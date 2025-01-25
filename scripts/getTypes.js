import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, '../app/database/database.sqlite'));
const dbAll = promisify(db.all).bind(db);

function convertSQLiteTypeToTS(sqlType) {
  switch(sqlType.toLowerCase()) {
    case 'integer':
      return 'number';
    case 'text':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'real':
    case 'float':
      return 'number';
    default:
      return 'any';
  }
}

function generateInterface(tableName, columns) {
  let interfaceDef = `export interface ${tableName} {\n`;
  columns.forEach(col => {
    const nullable = col.notnull === 0 ? '?' : '';
    interfaceDef += `    ${col.name}${nullable}: ${convertSQLiteTypeToTS(col.type)};\n`;
  });
  interfaceDef += '}\n\n';
  return interfaceDef;
}

async function generateTypes() {
  const tables = ['AllPerennials', 'BenchTagImages', 'BenchTags', 'CheckTable', 
           'GrowthRateOptions', 'WinterizingOptions'];
  let typeDefs = '';

  for (const table of tables) {
    try {
      const columns = await dbAll(`PRAGMA table_info(${table})`);
      typeDefs += generateInterface(table, columns);
    } catch (err) {
      console.error(`Error fetching columns for table ${table}:`, err);
    }
  }

  const typesPath = path.join(__dirname, '../app/lib/types.ts');
  let existingTypes = '';
  try {
    existingTypes = fs.readFileSync(typesPath, 'utf8');
  } catch (err) {
    console.error('Error reading types.ts:', err);
  }

  const updatedTypes = existingTypes + '\n' + typeDefs;
  try {
    fs.writeFileSync(typesPath, updatedTypes);
  } catch (err) {
    console.error('Error writing to types.ts:', err);
  }
}

generateTypes().then(() => {
  console.log('Types generated successfully');
  db.close();
}).catch(err => {
  console.error('Error generating types:', err);
  db.close();
});
