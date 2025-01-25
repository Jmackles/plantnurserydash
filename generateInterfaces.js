import fs from 'node:fs';

/**
 * A simple mapping from SQL data types -> TypeScript types
 * Adjust as needed to fit your exact usage & edge cases
 */
const sqlToTsMap = {
  // Numeric
  'int': 'number',
  'bigint': 'number',
  'smallint': 'number',
  'tinyint': 'number',
  'float': 'number',
  'real': 'number',
  'decimal': 'number',
  'numeric': 'number',
  'money': 'number',
  // Strings
  'char': 'string',
  'nchar': 'string',
  'nvarchar': 'string',
  'varchar': 'string',
  'text': 'string',
  'ntext': 'string',
  // Boolean-ish
  'bit': 'boolean',
  // Date/Time
  'date': 'Date',
  'datetime': 'Date',
  'smalldatetime': 'Date',
  'datetime2': 'Date',
  'time': 'Date',
  // Other
  'uniqueidentifier': 'string', // or "UUID"
  'image': 'Buffer',           // or "string" if storing base64
};

/**
 * Helper function to convert a string to PascalCase
 * e.g. "BenchTags" -> "BenchTags", "some_table" -> "SomeTable"
 */
function toPascalCase(str) {
  return str
    .replace(/[_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Generate a TS interface for a single table.
 * - tableName: The interface name you want to produce
 * - columns: Array of { COLUMN_NAME, DATA_TYPE, IS_NULLABLE, ... }
 * - useNullUnion: If true, add "| null" for nullable columns
 */
function generateInterface(tableName, columns, useNullUnion = true) {
  const interfaceName = toPascalCase(tableName);
  
  const lines = columns.map((col) => {
    const tsType = sqlToTsMap[col.DATA_TYPE.toLowerCase()] || 'any';
    const isNullable = col.IS_NULLABLE === 'YES';

    // Example: "TagName: string | null;"
    if (useNullUnion && isNullable) {
      return `  ${col.COLUMN_NAME}: ${tsType} | null;`;
    }
    // If not using union, you could do optional properties e.g. "TagName?: string"
    // or simply ignore nullability
    return `  ${col.COLUMN_NAME}: ${tsType};`;
  });

  return `export interface ${interfaceName} {\n${lines.join('\n')}\n}`;
}

// ---------------- MAIN SCRIPT ----------------

try {
  // 1) Read schema JSON (produced by your testConnection.js script)
  const rawJson = fs.readFileSync('dbSchema.json', 'utf-8');
  const dbSchema = JSON.parse(rawJson); // an array of { schema, table, columns }

  // 2) Build up an array of interface definitions
  const interfaceBlocks = [];

  for (const tableDef of dbSchema) {
    const schemaName = tableDef.schema; // e.g. "dbo"
    const tableName = tableDef.table;   // e.g. "BenchTags"
    const columns = tableDef.columns;

    // You might want to combine schema + table name: e.g. "dbo_BenchTags"
    // Or just use table name. We'll use just the table name here.
    const ifaceString = generateInterface(tableName, columns);
    interfaceBlocks.push(ifaceString);
  }

  // 3) Combine them into one big file
  const fileContent = interfaceBlocks.join('\n\n');

  // 4) Write to "dbInterfaces.ts"
  fs.writeFileSync('dbInterfaces.ts', fileContent, 'utf-8');
  console.log('Successfully generated TypeScript interfaces in "dbInterfaces.ts".');
} catch (error) {
  console.error('Error generating TypeScript interfaces:', error);
  process.exit(1);
}
