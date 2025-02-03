import sqlite3
import os

def migrate_database(db_path):
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Step 1: Backup BenchTags Data
    cursor.execute('''CREATE TABLE IF NOT EXISTS BenchTags_backup AS SELECT * FROM BenchTags''')
    print("BenchTags data backed up successfully.")

    # Step 2: Drop Redundant Tables
    tables_to_drop = [
        'PlantImages',
        '"BenchTag Images"',
        '"All Perennials"',
        'BenchTags',
        'GrowthRateOptions',
        'CheckTable',
        'WinterizingOptions',
        'Botanical',
        'Genus',
        'Species',
        'CommonNames'
    ]

    for table in tables_to_drop:
        cursor.execute(f'''DROP TABLE IF EXISTS {table}''')
    print("Redundant tables dropped.")

    # Step 3: Create New Consolidated Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PlantCatalog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_name TEXT,
            botanical TEXT,
            department TEXT,
            classification TEXT,
            no_warranty BOOLEAN NOT NULL,
            deer_resistance TEXT,
            nativity TEXT,
            car_native BOOLEAN NOT NULL,
            melting_sun BOOLEAN NOT NULL,
            full_sun BOOLEAN NOT NULL,
            part_sun BOOLEAN NOT NULL,
            shade BOOLEAN NOT NULL,
            growth_rate TEXT NOT NULL,
            avg_size TEXT,
            max_size TEXT,
            mature_size TEXT,
            zone_max INTEGER,
            zone_min INTEGER,
            winterizing TEXT,
            notes TEXT,
            show_top_notes BOOLEAN NOT NULL,
            top_notes TEXT,
            price REAL,
            size TEXT,
            pot_details_id INTEGER,
            flat_pricing BOOLEAN NOT NULL,
            flat_count INTEGER,
            flat_price REAL,
            print BOOLEAN NOT NULL,
            botanical_id INTEGER,
            FOREIGN KEY (pot_details_id) REFERENCES PotDetails(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PotDetails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pot_size TEXT,
            pot_size_unit TEXT,
            pot_depth TEXT,
            pot_shape TEXT,
            pot_type TEXT,
            pot_custom_text TEXT
        )
    ''')

    print("New consolidated tables created.")

    # Step 4: Migrate Data from BenchTags to PlantCatalog
    cursor.execute('''
        INSERT INTO PlantCatalog (
            tag_name, botanical, department, classification, no_warranty,
            deer_resistance, nativity, car_native, melting_sun, full_sun, 
            part_sun, shade, growth_rate, avg_size, max_size, mature_size, 
            zone_max, zone_min, winterizing, notes, show_top_notes, top_notes, 
            price, size, flat_pricing, flat_count, flat_price, print, botanical_id
        )
        SELECT 
            tag_name, Botanical, Department, Classification, NoWarranty,
            DeerResistance, Nativity, CarNative, MeltingSun, FullSun,
            PartSun, Shade, GrowthRate, AvgSize, MaxSize, MatureSize,
            CAST(ZoneMax AS INTEGER), CAST(ZoneMin AS INTEGER), Winterizing, Notes,
            ShowTopNotes, TopNotes, CAST(Price AS REAL), Size, 
            FlatPricing, FlatCount, CAST(FlatPrice AS REAL), Print, botanical_id
        FROM BenchTags_backup
    ''')
    print("BenchTags data migrated to PlantCatalog.")

    # Step 5: Validation
    cursor.execute('''SELECT COUNT(*) FROM BenchTags_backup''')
    original_count = cursor.fetchone()[0]

    cursor.execute('''SELECT COUNT(*) FROM PlantCatalog''')
    new_count = cursor.fetchone()[0]

    if original_count == new_count:
        print(f"Migration successful. {new_count} records transferred.")
    else:
        print(f"Migration discrepancy detected: {original_count} vs {new_count}")

    conn.commit()
    conn.close()

# Usage
migrate_database(os.path.join(os.path.dirname(__file__), '../database.sqlite'))

