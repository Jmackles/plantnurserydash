// Filename: fetchAccessSchema.js

import pkg from 'odbc'; // CommonJS default export workaround
const { connect } = pkg; // Extract the `connect` function from the odbc module
import fs from 'fs';
import path from 'path';

// Connection details
const databaseFilePath = 'P:\\Bench Tags (Server)\\Bench Tags.accdb';
const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${databaseFilePath};`;

async function fetchSchema() {
  try {
    // Connect to the database
    const connection = await connect(connectionString);

    // Query for schema information
    const schemaQuery = `
      SELECT 
        MSysObjects.Name AS TableName, 
        MSysObjects.Type AS ObjectType,
        MSysObjects.DateCreate AS DateCreated,
        MSysObjects.DateUpdate AS DateModified
      FROM 
        MSysObjects
      WHERE 
        MSysObjects.Type IN (1, 4, 6) AND MSysObjects.Flags = 0
      ORDER BY 
        MSysObjects.Name;
    `;

    const result = await connection.query(schemaQuery);

    // Organize schema into a JSON object
    const schema = result.map(row => ({
      tableName: row.TableName,
      objectType: row.ObjectType,
      dateCreated: row.DateCreate,
      dateModified: row.DateUpdate,
    }));

    // Save schema as a JSON file
    const outputFilePath = path.resolve('./databaseSchema.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(schema, null, 2));

    console.log(`Schema saved to ${outputFilePath}`);

    // Close the connection
    await connection.close();
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

// Execute the function
fetchSchema();
