import sqlite3
import json

def extract_column_types(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # get list of all user tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()

    types_info = {}

    for (table_name,) in tables:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()  # each column has: cid, name, type, notnull, dflt_value, pk
        types_info[table_name] = {col[1]: col[2] for col in columns}

    conn.close()
    return types_info

if __name__ == "__main__":
    db_path = "database.sqlite"  # change path if needed
    info = extract_column_types(db_path)
    output_file = "data_types.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=4)
    print(f"Data types extracted and logged to {output_file}")