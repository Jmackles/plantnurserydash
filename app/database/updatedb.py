import sqlite3
import json
import os

def update_schema(db_path):
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Step 1: Ensure want_list created_at is DATETIME
    try:
        cursor.execute('''ALTER TABLE want_list RENAME COLUMN created_at TO created_at_text''')
    except sqlite3.OperationalError:
        pass  # Column already renamed or doesn't exist

    try:
        cursor.execute('''ALTER TABLE want_list ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP''')
    except sqlite3.OperationalError:
        pass  # Column already exists

    # Step 2: Ensure ON DELETE CASCADE in plants table
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='plants'")
    plants_schema_result = cursor.fetchone()

    if plants_schema_result:
        plants_schema = plants_schema_result[0]
        if 'ON DELETE CASCADE' not in plants_schema:
            cursor.execute('''ALTER TABLE plants RENAME TO plants_old''')

            # Check columns in the old plants table
            cursor.execute("PRAGMA table_info(plants_old)")
            existing_columns = [col[1] for col in cursor.fetchall()]

            # Build dynamic insert query based on existing columns
            columns_to_insert = [
                'id', 'want_list_entry_id', 'name', 'size', 'quantity'
            ]
            if 'status' in existing_columns:
                columns_to_insert.append('status')
            else:
                columns_to_insert.append("'pending' AS status")

            if 'plant_catalog_id' in existing_columns:
                columns_to_insert.append('plant_catalog_id')
            if 'requested_at' in existing_columns:
                columns_to_insert.append('requested_at')
            if 'fulfilled_at' in existing_columns:
                columns_to_insert.append('fulfilled_at')

            cursor.execute('''
                CREATE TABLE plants (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    want_list_entry_id INTEGER,
                    name TEXT,
                    size TEXT,
                    quantity INTEGER,
                    status TEXT DEFAULT 'pending',
                    plant_catalog_id INTEGER,
                    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    fulfilled_at DATETIME,
                    FOREIGN KEY (want_list_entry_id) REFERENCES want_list(id) ON DELETE CASCADE,
                    FOREIGN KEY (plant_catalog_id) REFERENCES PlantCatalog(id)
                )
            ''')

            insert_query = f'''
                INSERT INTO plants ({', '.join([col if 'AS' not in col else col.split(' AS ')[1] for col in columns_to_insert])})
                SELECT {', '.join(columns_to_insert)} FROM plants_old
            '''

            cursor.execute(insert_query)
            cursor.execute('''DROP TABLE plants_old''')

    # Step 3: Create index on want_list_entry_id in plants
    cursor.execute('''CREATE INDEX IF NOT EXISTS idx_plants_want_list_entry_id ON plants (want_list_entry_id)''')

    print("Schema updated successfully.")

    # Step 4: Export the full schema to a JSON file
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    db_schema = {}

    for table_name in tables:
        table = table_name[0]
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        db_schema[table] = [
            {
                'cid': column[0],
                'name': column[1],
                'type': column[2],
                'notnull': column[3],
                'default_value': column[4],
                'primary_key': column[5]
            } 
            for column in columns
        ]

    with open('database_schema.json', 'w') as f:
        json.dump(db_schema, f, indent=4)

    print("Database schema saved to database_schema.json")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    update_schema(os.path.join(os.path.dirname(__file__), 'database.sqlite'))
