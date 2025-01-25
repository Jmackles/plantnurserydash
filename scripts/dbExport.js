import path from 'node:path';
import sql from 'mssql/msnodesqlv8.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// ANSI escape sequences for console styling
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

// Symbols
const CHECK = '✓';
const CROSS = '✘';

const config = {
  server: 'bill2pc\\benchytest',
  database: 'BenchTags',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Simple progress bar: updates in place in the console.
 */
function renderProgressBar(current, total, stepInfo) {
  const percent = Math.floor((current / total) * 100);
  const barWidth = 20;
  const filled = Math.floor((percent / 100) * barWidth);
  const bar = '█'.repeat(filled) + '-'.repeat(barWidth - filled);
  // Transition from yellow to green near completion
  const color = percent < 80 ? YELLOW : GREEN;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(
    `${color}[${bar}] ${percent}%${RESET} - ${stepInfo}`
  );
}

async function fetchAllTables(pool) {
  try {
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME IN (
        'CheckTable'
      )
      ORDER BY TABLE_NAME;
    `);
    return result.recordset;
  } catch (err) {
    throw new Error(`Unable to fetch table list: ${err.message}`);
  }
}

async function fetchTableSchema(pool, schemaName, tableName) {
  try {
    const result = await pool.request()
      .input('schemaName', sql.VarChar, schemaName)
      .input('tableName', sql.VarChar, tableName)
      .query(`
        SELECT
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = @tableName
        ORDER BY ORDINAL_POSITION;
      `);
    return result.recordset;
  } catch (err) {
    throw new Error(`Error fetching schema for [${schemaName}].[${tableName}]: ${err.message}`);
  }
}

async function fetchTableData(pool, schemaName, tableName) {
  try {
    const result = await pool.request()
      .input('schemaName', sql.VarChar, schemaName)
      .input('tableName', sql.VarChar, tableName)
      .query(`SELECT * FROM [${schemaName}].[${tableName}];`);
    return result.recordset;
  } catch (err) {
    throw new Error(`Error fetching data for [${schemaName}].[${tableName}]: ${err.message}`);
  }
}

function sanitizeColumnName(name) {
  // Replace spaces with underscores and remove special characters
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

async function createSQLiteTable(db, tableName, columns) {
  const columnDefinitions = columns.map(col => {
    let type;
    switch (col.DATA_TYPE) {
      case 'int':
        type = 'INTEGER';
        break;
      case 'varchar':
      case 'nvarchar':
      case 'text':
        type = 'TEXT';
        break;
      case 'bit':
        type = 'BOOLEAN';
        break;
      case 'datetime':
        type = 'DATETIME';
        break;
      case 'image':
        type = 'BLOB';
        break;
      default:
        type = 'TEXT';
    }
    const sanitizedName = sanitizeColumnName(col.COLUMN_NAME);
    return `"${sanitizedName}" ${type} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : ''}`;
  }).join(', ');

  const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions});`;
  await db.exec(createTableSQL);
}

async function ensureColumnsExist(db, tableName, columns) {
  const existingCols = await db.all(`PRAGMA table_info("${tableName}")`);
  for (const col of columns) {
    const name = col.COLUMN_NAME;
    if (!existingCols.some(ec => ec.name === name)) {
      let type;
      switch (col.DATA_TYPE) {
        case 'int':
          type = 'INTEGER';
          break;
        case 'varchar':
        case 'nvarchar':
        case 'text':
          type = 'TEXT';
          break;
        case 'bit':
          type = 'BOOLEAN';
          break;
        case 'datetime':
          type = 'DATETIME';
          break;
        case 'image':
          type = 'BLOB';
          break;
        default:
          type = 'TEXT';
      }
      await db.exec(`ALTER TABLE "${tableName}" ADD COLUMN "${name}" ${type};`);
    }
  }
}

async function insertDataIntoSQLite(db, tableName, columns, data) {
  if (!data || data.length === 0) return { total: 0, failed: 0, incomplete: [] };

  const columnNames = columns.map(col => `"${sanitizeColumnName(col.COLUMN_NAME)}"`).join(', ');
  const placeholders = columns.map(() => '?').join(', ');
  const insertSQL = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders});`;
  const stmt = await db.prepare(insertSQL);

  let failed = 0;
  const incompleteEntries = [];

  for (let i = 0; i < data.length; i++) {
    let row;
    try {
      row = data[i];
      const values = [];
      for (const col of columns) {
        const sanitizedName = sanitizeColumnName(col.COLUMN_NAME);
        const originalValue = row[col.COLUMN_NAME];
        
        if (col.IS_NULLABLE === 'NO' && originalValue == null) {
          row[sanitizedName] = originalValue || getDefaultForType(col.DATA_TYPE.toUpperCase());
          logIssueToFile(tableName, row.id || i, 
            `Mapped column '${col.COLUMN_NAME}' to '${sanitizedName}' with value: ${row[sanitizedName]}`);
        }
        values.push(row[sanitizedName] || originalValue);
      }
      await stmt.run(values);
    } catch (err) {
      failed++;
      const refinedMsg = parseSQLiteError(err.message);
      if (!incompleteEntries.some(e => e.index === i)) {
        incompleteEntries.push({
          index: i,
          rowData: row,
          reason: refinedMsg
        });
        logIssueToFile(tableName, row.id || i, `Data: ${JSON.stringify(row)}, Reason: ${refinedMsg}`);
      }
    }
    renderProgressBar(i + 1, data.length, `${tableName} insertion`);
  }

  await stmt.finalize();
  return {
    total: data.length,
    failed,
    incomplete: incompleteEntries
  };
}

function getDefaultForType(type) {
  switch (type) {
    case 'INTEGER':
      return 0;
    case 'TEXT':
      return 'DEFAULT';
    case 'BOOLEAN':
      return false;
    case 'DATETIME':
      return new Date().toISOString();
    case 'BLOB':
      return Buffer.from([]);
    default:
      return null;
  }
}

function logIssueToFile(tableName, rowId, details) {
  const logMessage = `[${new Date().toISOString()}] Table: ${tableName}, Row ID: ${rowId}, Details: ${details}\n`;
  fs.appendFileSync('dbExport_issues.log', logMessage);
}

function parseSQLiteError(message) {
  const match = /NOT NULL constraint failed: ([^.]+)\.([^.]+)/.exec(message);
  if (match) {
    return `Column '${match[2]}' is marked NOT NULL but received no value.`;
  }
  return message;
}

(async function main() {
  let pool;
  try {
    console.log(`${BOLD}Connecting to SQL Server...${RESET}`);
    pool = await sql.connect(config);
    console.log(`${GREEN}${CHECK} Connection to SQL Server successful!${RESET}`);

    console.log(`${BOLD}Fetching table names...${RESET}`);
    const tables = await fetchAllTables(pool);

    if (!tables.length) {
      console.log(`${YELLOW}No tables found; exiting.${RESET}`);
      return;
    }

    const dbPath = path.join(__dirname, '../app/database/database.sqlite');
    console.log(`Targeting SQLite DB at: ${dbPath}`);
    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    for (const table of tables) {
      const { TABLE_SCHEMA, TABLE_NAME } = table;
      console.log(`${BOLD}\nProcessing table: [${TABLE_SCHEMA}].[${TABLE_NAME}]...${RESET}`);

      const schema = await fetchTableSchema(pool, TABLE_SCHEMA, TABLE_NAME);
      await createSQLiteTable(db, TABLE_NAME, schema);
      await ensureColumnsExist(db, TABLE_NAME, schema);
      const data = await fetchTableData(pool, TABLE_SCHEMA, TABLE_NAME);

      console.log(`${CYAN}Inserting data into ${TABLE_NAME}...${RESET}`);
      const result = await insertDataIntoSQLite(
        db,
        TABLE_NAME,
        schema,
        data
      );

      // Results
      if (result.failed === 0 && !result.incomplete.length) {
        console.log(`\n${GREEN}${CHECK} Completed Successfully for [${TABLE_NAME}]! ${CHECK}${RESET}`);
      } else {
        console.log(`\n${RED}${CROSS} Failed for [${TABLE_NAME}]!${RESET}`);
        console.log(`${RED}Reason(s):${RESET}`);
        if (result.failed > 0) {
          console.log(`- ${RED}${result.failed} entries failed due to validation or insertion errors.${RESET}`);
          console.log(`- ${RED}Details: ${JSON.stringify(result.incomplete, null, 2)}${RESET}`);
        }
        if (result.incomplete.length > 0) {
          console.log(`- ${RED}Incomplete rows: ${JSON.stringify(result.incomplete, null, 2)}${RESET}`);
        }
      }
    }

    console.log(`${GREEN}${BOLD}\nAll tables processed!${RESET}`);
  } catch (err) {
    console.error(`\n${RED}${CROSS} Failed! Reason: ${err.message} ${CROSS}${RESET}`);
  } finally {
    if (pool) {
      await pool.close();
      console.log(`${CYAN}SQL Server connection closed.${RESET}`);
    }
  }
})();