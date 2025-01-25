import sqlite3
import os
import pandas as pd

# Configuration
CSV_FOLDER = 'path_to_your_csv_files'  # Folder with exported CSV files
SQLITE_DB_PATH = 'plantKB.sqlite'

def create_sqlite_table_from_csv(csv_path, conn):
    table_name = os.path.splitext(os.path.basename(csv_path))[0]
    df = pd.read_csv(csv_path)
    
    # Create table
    columns = [f'"{col}" TEXT' for col in df.columns]  # Defaulting to TEXT
    create_table_query = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({", ".join(columns)})'
    conn.execute(create_table_query)
    
    # Insert data
    df.to_sql(table_name, conn, if_exists='append', index=False)

def import_csv_to_sqlite(csv_folder, sqlite_db_path):
    conn = sqlite3.connect(sqlite_db_path)
    try:
        for file_name in os.listdir(csv_folder):
            if file_name.endswith('.csv'):
                csv_path = os.path.join(csv_folder, file_name)
                print(f'Importing {file_name}...')
                create_sqlite_table_from_csv(csv_path, conn)
        conn.commit()
        print('All CSV files imported successfully!')
    except Exception as e:
        print(f'Error: {e}')
    finally:
        conn.close()

if __name__ == '__main__':
    import_csv_to_sqlite(CSV_FOLDER, SQLITE_DB_PATH)
