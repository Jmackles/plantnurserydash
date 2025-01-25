// scripts/testConnection.js

//---------------------------------------
// [Lines 1-9] Imports & Config
//---------------------------------------
import fs from 'node:fs';
import sql from 'mssql/msnodesqlv8.js';

const config = {
  server: 'bill2pc\\benchytest',    // Replace with your SQL Server instance
  database: 'BenchTags',        // Replace with your actual DB name
  driver: 'msnodesqlv8',            // Must be msnodesqlv8 for Windows auth
  options: {
    trustedConnection: true,        // Windows Authentication
    trustServerCertificate: true,   // For local/self-signed
  },
};

//---------------------------------------
// [Lines 11-25] Helpers
//---------------------------------------
/**
 * Retrieve a list of table names from INFORMATION_SCHEMA.TABLES.
 */
async function fetchAllTables(pool) {
  const result = await pool.request().query(`
    SELECT TABLE_SCHEMA, TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME IN ('BenchTags', 'WinterizingOptions', 'GrowthRateOptions', 'CheckTable', 'All Perennials', 'BenchTag Images')
    ORDER BY TABLE_NAME
  `);
  return result.recordset; // Array of { TABLE_SCHEMA, TABLE_NAME }
}

/**
 * Retrieve columns for a given table from INFORMATION_SCHEMA.COLUMNS.
 */
async function fetchTableSchema(pool, schemaName, tableName) {
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

  return result.recordset; // Array of column metadata objects
}

/**
 * Retrieve foreign key relationships for the given tables.
 */
async function fetchForeignKeys(pool) {
  const result = await pool.request().query(`
    SELECT 
      fk.name AS FK_NAME,
      tp.name AS PARENT_TABLE,
      cp.name AS PARENT_COLUMN,
      tr.name AS REFERENCED_TABLE,
      cr.name AS REFERENCED_COLUMN
    FROM 
      sys.foreign_keys AS fk
      INNER JOIN sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN sys.tables AS tp ON fkc.parent_object_id = tp.object_id
      INNER JOIN sys.columns AS cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
      INNER JOIN sys.tables AS tr ON fkc.referenced_object_id = tr.object_id
      INNER JOIN sys.columns AS cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
    WHERE 
      tp.name IN ('BenchTags', 'WinterizingOptions', 'GrowthRateOptions', 'CheckTable', 'All Perennials', 'BenchTag Images')
  `);

  return result.recordset; // Array of foreign key metadata objects
}

//---------------------------------------
// [Lines 27-57] Main Script
//---------------------------------------
(async function main() {
  let pool;
  try {
    console.log('Connecting to SQL Server...');
    pool = await sql.connect(config);
    console.log('Connection successful!');

    console.log('Fetching all table names...');
    const tables = await fetchAllTables(pool);

    // Build a JSON-serializable object of the entire DB schema
    const dbSchema = {};

    for (const table of tables) {
      const { TABLE_SCHEMA, TABLE_NAME } = table;
      console.log(`Fetching columns for [${TABLE_SCHEMA}].[${TABLE_NAME}]...`);

      const columns = await fetchTableSchema(pool, TABLE_SCHEMA, TABLE_NAME);
      dbSchema[TABLE_NAME] = {
        schema: TABLE_SCHEMA,
        columns,
      };
    }

    console.log('Fetching foreign key relationships...');
    const foreignKeys = await fetchForeignKeys(pool);
    dbSchema.foreignKeys = foreignKeys;

    // Write the schema info to a local JSON file
    const outputFile = 'dbSchema.json';
    fs.writeFileSync(outputFile, JSON.stringify(dbSchema, null, 2), 'utf-8');
    console.log(`\nDatabase schema exported to "${outputFile}".`);
  } catch (err) {
    console.error('Error during schema export:', err);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed.');
    }
  }
})();
