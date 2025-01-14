"""
This script is a utility tool designed to consolidate multiple code files into a single 'master.txt' file,
making it easier to perform modifications across these files.

The script performs the following operations:
1. Creates a timestamped backup of the existing 'master.txt' file for potential rollback.
2. Sequentially loads and processes the specified files.
   For each file, the script:
   - Prints a terminal message indicating the loading process.
   - Appends the content of the loaded file to the 'master.txt' file.
   - Prints a terminal message confirming successful loading and appending.
3. Utilizes the 'os', 'datetime', and 'shutil' modules for file-path manipulations and timestamp operations.

The script includes three main functions:
- 'load_file(filename)': Checks if the provided file exists, loads it if it does, and returns its content.
- 'append_to_master_file(master_filename, filename, content)': Appends the content of the provided file to the master file.
- 'create_backup(master_filename)': Creates a new timestamped backup of the master file.

The script iterates over a list of files, loads each file, and appends its content to the master file.
"""

import os
from datetime import datetime
import shutil

# Function to create a backup of a file
def create_backup(master_filename):
    if os.path.exists(master_filename):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        backup_filename = f"{master_filename}.{timestamp}.bak"
        shutil.copy2(master_filename, backup_filename)
        print(f"Backup created: {backup_filename}")

# Function to load a file's content
def load_file(filename):
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as file:
            return file.read()
    else:
        print(f"File not found: {filename}")
        return None

# Function to append content to the master file
def append_to_master_file(master_filename, filename, content):
    with open(master_filename, 'a', encoding='utf-8') as master_file:
        master_file.write(f"\n\n# Content from {filename}\n\n")
        master_file.write(content)
        print(f"Appended content from {filename}")

# Function to write the directory structure to the master file
def write_directory_structure(master_filename, files):
    with open(master_filename, 'a', encoding='utf-8') as master_file:
        master_file.write("# Directory Structure\n\n")
        for file in files:
            master_file.write(f"{file}\n")
        master_file.write("\n\n")

# Main function to concatenate files
def concatenate_files():
    master_filename = 'master.txt'
    files_to_concatenate = [
        'app/page.tsx',
        'app/wantlistdashboard/page.tsx',
        'app/components/cards/CustomerCard.js',
        'app/components/cards/WantListCard.js',
        'app/components/forms/InputForm.tsx',
        'app/components/shared/Modal.js',
        'app/lib/types.ts',
        'app/components/cards/Cards.js',
        'app/layout.tsx',
        'app/globals.css'
    ]

    # Create a backup of the existing master file
    create_backup(master_filename)

    # Clear the master file before appending new content
    open(master_filename, 'w').close()

    # Write the directory structure to the master file
    write_directory_structure(master_filename, files_to_concatenate)

    # Load and append each file's content to the master file
    for filename in files_to_concatenate:
        content = load_file(filename)
        if content:
            append_to_master_file(master_filename, filename, content)

if __name__ == "__main__":
    concatenate_files()