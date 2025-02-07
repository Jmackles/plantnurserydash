import sqlite3
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import os
import re
import shutil
from difflib import SequenceMatcher

# -------------------------------------------------------------------
# 1. Sanitize Filename: Remove characters that are invalid in Windows
# -------------------------------------------------------------------
def sanitize_filename(filename):
    # Remove any of these characters: <>:"/\|?*
    return re.sub(r'[<>:"/\\|?*]', '', filename)

# -------------------------------------------------------------------
# 2. Normalization & Key Extraction Functions
# -------------------------------------------------------------------
def normalize(s):
    """Lowercase and remove all non-alphanumeric characters."""
    return re.sub(r'\W+', '', s).lower()

def extract_candidate_key(record, genus):
    """
    Given a database record and the folder's genus, produce a candidate key
    from the record's tag_name.
    
    Strategy:
      - If tag_name contains parenthesized text, use that.
      - Otherwise, remove the given genus (case-insensitively) from tag_name.
      - If that leaves an empty string, revert to using the full tag_name.
      - Also, if the botanical field contains extra info (after an "x"),
        combine that.
    """
    tag = record.get('tag_name') or ""
    botanical = record.get('botanical') or ""
    
    # (1) Use text in parentheses if available.
    paren_match = re.search(r'\((.*?)\)', tag)
    if (paren_match):
        key = paren_match.group(1)
    else:
        # Remove the folder's genus from the tag name.
        key = re.sub(genus, '', tag, flags=re.IGNORECASE)
        if not key.strip():
            # Fallback: if the removal empties the string, use the full tag.
            key = tag
    key = normalize(key)
    
    # (2) Check for extra info in botanical (e.g., "Illicium x floridanum").
    parts = botanical.lower().split('x')
    extra_key = ""
    if len(parts) > 1:
        extra = parts[1].strip()
        extra = re.sub(r"[\'\"]", "", extra)
        extra_key = normalize(extra)
    
    if extra_key:
        if extra_key not in key:
            key = key + extra_key
        else:
            key = extra_key
    return key

def extract_file_key(filename, genus, cultivar=None):
    """
    Given a filename (e.g., "anisebanapp.png"), remove the extension and the
    genus (and cultivar, if applicable), then normalize the result.
    """
    name, _ = os.path.splitext(filename)
    key = normalize(name)
    genus_norm = normalize(genus)
    if key.startswith(genus_norm):
        key = key[len(genus_norm):]
    if cultivar:
        cultivar_norm = normalize(cultivar)
        if key.startswith(cultivar_norm):
            key = key[len(cultivar_norm):]
    return key

def get_genus_and_cultivar_from_path(base_dir, file_path):
    """
    From the file's full path, derive the folder (genus) and, if present, the cultivar.
    For example:
       - .../png/Anise/aniseyellow.png   -> ("Anise", None)
       - .../png/Camellia/Japonica/xxxx.png -> ("Camellia", "Japonica")
    """
    rel_path = os.path.relpath(file_path, base_dir)
    parts = rel_path.split(os.sep)
    if len(parts) == 2:
        return parts[0], None
    elif len(parts) >= 3:
        return parts[0], parts[1]
    else:
        return None, None

# -------------------------------------------------------------------
# 3. Matching Helpers
# -------------------------------------------------------------------
def similar(a, b):
    """Return a similarity ratio between two strings."""
    return SequenceMatcher(None, a, b).ratio()

def match_keys(candidate_key, file_key, threshold=0.7):
    """
    First try fuzzy matching. If the similarity ratio is above the threshold,
    or if the sorted lists of words match, consider it a match.
    """
    if similar(candidate_key, file_key) >= threshold:
        return True
    # Fallback: split into words and compare sorted lists.
    candidate_words = sorted(re.findall(r'[a-z]+', candidate_key))
    file_words = sorted(re.findall(r'[a-z]+', file_key))
    if candidate_words == file_words and candidate_words:
        return True
    return False

def find_candidate_record(file_key, genus, cultivar, db_records, threshold=0.7):
    """
    From the database records, select those where the folder name (genus) appears
    in either the botanical field or tag_name. Then, extract the candidate key and
    use fuzzy matching (with fallback on sorted words) to see if it matches the file_key.
    """
    candidates = []
    for record in db_records:
        botanical_value = (record.get('botanical') or "").lower()
        tag_name_value = (record.get('tag_name') or "").lower()
        # Require that the folder name appears in either field.
        if (genus.lower() not in botanical_value) and (genus.lower() not in tag_name_value):
            continue

        # For Camellia (or similar cases) with cultivar folders, filter further.
        if cultivar and genus.lower() == 'camellia':
            if (cultivar.lower() not in botanical_value) and (cultivar.lower() not in tag_name_value):
                continue

        candidate_key = extract_candidate_key(record, genus)
        if match_keys(candidate_key, file_key, threshold):
            candidates.append(record)
    return candidates




def load_db_records(db_path):
    """
    Connect to the SQLite database and load all records from the table.
    (Adjust the table name if needed; here it is assumed to be "PlantCatalog".)
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT id, tag_name, botanical FROM PlantCatalog")
    records = [dict(row) for row in cur.fetchall()]
    conn.close()
    return records

# =============================================================================
# Tkinter Application
# =============================================================================

class Application(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Plant Image Processor")
        self.geometry("1000x600")
        self.resizable(True, True)
        
        # Define paths (assumes this script, database.sqlite, and png/ are in the same folder)
        self.base_dir = os.path.abspath(os.path.dirname(__file__))
        self.png_dir = os.path.join(self.base_dir, "png")
        self.db_path = os.path.join(self.base_dir, "database.sqlite")
        
        # Add new directory for processed images
        self.png_complete_dir = os.path.join(self.base_dir, "png.complete")
        os.makedirs(self.png_complete_dir, exist_ok=True)
        
        # Load DB records from SQLite.
        self.db_records = load_db_records(self.db_path)
        
        # Build the UI
        self.create_widgets()
    
    def create_widgets(self):
        # Use a PanedWindow to split the UI into a side panel and main panel.
        paned = ttk.PanedWindow(self, orient=tk.HORIZONTAL)
        paned.pack(fill=tk.BOTH, expand=True)
        
        # Left side: File Explorer (directory tree)
        self.side_frame = ttk.Frame(paned, width=300)
        paned.add(self.side_frame, weight=1)
        
        # Right side: Log console, progress bar, image preview, and run button.
        self.main_frame = ttk.Frame(paned)
        paned.add(self.main_frame, weight=4)
        
        # --- Side Panel ---
        lbl = ttk.Label(self.side_frame, text="Select Directories to Process:")
        lbl.pack(padx=5, pady=5)
        
        # Treeview widget for directory listing.
        self.tree = ttk.Treeview(self.side_frame, selectmode="extended")
        self.tree.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Add a vertical scrollbar to the tree.
        tree_scroll = ttk.Scrollbar(self.side_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=tree_scroll.set)
        tree_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Populate the tree with directories from the png folder.
        self.populate_treeview()
        
        # --- Main Panel ---
        # A Text widget for logging.
        self.log_text = tk.Text(self.main_frame, height=15)
        self.log_text.pack(fill=tk.BOTH, padx=5, pady=5, expand=False)
        
        # A Progressbar widget.
        self.progress = ttk.Progressbar(self.main_frame, orient="horizontal", mode="determinate")
        self.progress.pack(fill=tk.X, padx=5, pady=5)
        
        # An image preview area (Label). When a file is renamed successfully,
        # its image will be “flashed” here.
        self.image_label = ttk.Label(self.main_frame)
        self.image_label.pack(padx=5, pady=5)
        
        # Button to start processing.
        self.run_button = ttk.Button(self.main_frame, text="Run Script", command=self.run_script)
        self.run_button.pack(padx=5, pady=5)
        
        # Add new button for inserting images
        self.insert_button = ttk.Button(self.main_frame, text="Insert Applicable Images", 
                                      command=self.insert_applicable_images)
        self.insert_button.pack(padx=5, pady=5)
    
    def populate_treeview(self):
        """Recursively populate the treeview with folders under the png directory."""
        # Clear any existing items.
        for i in self.tree.get_children():
            self.tree.delete(i)
            
        # Insert the root node for the png folder.
        root_node = self.tree.insert("", "end", text="png", open=True, values=(self.png_dir,))
        self._process_directory(root_node, self.png_dir)
    
    def _process_directory(self, parent, path):
        try:
            entries = os.listdir(path)
        except Exception as e:
            self.log(f"Error listing {path}: {e}")
            return
        for entry in sorted(entries):
            full_path = os.path.join(path, entry)
            if os.path.isdir(full_path):
                node = self.tree.insert(parent, "end", text=entry, open=False, values=(full_path,))
                self._process_directory(node, full_path)
    
    def log(self, message):
        """Append a message to the log console."""
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.update_idletasks()
    
    def update_progress(self, value, maximum):
        """Update the progress bar."""
        self.progress["maximum"] = maximum
        self.progress["value"] = value
        self.update_idletasks()
    
    def flash_image(self, image_path):
        """
        Load and display the image briefly in the image preview area.
        (If the image is too large, it is thumbnailed.)
        """
        try:
            img = Image.open(image_path)
            img.thumbnail((300, 300))
            photo = ImageTk.PhotoImage(img)
            self.image_label.config(image=photo)
            self.image_label.image = photo  # keep a reference
            self.update_idletasks()
            # Remove the image after 500 ms.
            self.after(500, lambda: self.image_label.config(image=""))
        except Exception as e:
            self.log(f"Error displaying image {image_path}: {e}")
    
    def get_selected_directories(self):
        """Return a list of selected directories (full paths) from the treeview."""
        selected_items = self.tree.selection()
        dirs = []
        for item in selected_items:
            path = self.tree.item(item, "values")[0]
            if os.path.isdir(path):
                dirs.append(path)
        return dirs
    
    def run_script(self):
        """Called when the Run Script button is pressed."""
        selected_dirs = self.get_selected_directories()
        if not selected_dirs:
            messagebox.showwarning("No Selection", "Please select at least one directory from the side panel.")
            return
        
        # Disable the run button during processing.
        self.run_button.config(state=tk.DISABLED)
        
        # Run the file processing in a separate thread to keep the UI responsive.
        thread = threading.Thread(target=self.process_directories, args=(selected_dirs,))
        thread.start()
    
    def process_directories(self, directories):
        """Traverse the selected directories, match each PNG file to a db record, and rename it."""
        # Collect all PNG files recursively from the selected directories.
        file_list = []
        for d in directories:
            for root, _, files in os.walk(d):
                for f in files:
                    if f.lower().endswith(".png"):
                        file_list.append(os.path.join(root, f))
        total_files = len(file_list)
        self.log(f"Found {total_files} PNG files in selected directories.")
        
        # Process each file.
        for idx, file_path in enumerate(file_list, start=1):
            genus, cultivar = get_genus_and_cultivar_from_path(self.png_dir, file_path)
            if not genus:
                self.log(f"Skipping file with no genus: {file_path}")
                continue
            file_key = extract_file_key(os.path.basename(file_path), genus, cultivar)
            candidates = find_candidate_record(file_key, genus, cultivar, self.db_records)
            
            if len(candidates) == 1:
                record = candidates[0]
                # New filename format: {id}[{tag_name}].png
                new_filename = f"{record['id']}[{record['tag_name']}].png"
                new_full_path = os.path.join(os.path.dirname(file_path), new_filename)
                try:
                    os.rename(file_path, new_full_path)
                    self.log(f"Renamed:\n  {file_path}\n  -> {new_full_path}")
                    self.flash_image(new_full_path)
                except Exception as e:
                    self.log(f"Error renaming {file_path}: {e}")
            elif len(candidates) == 0:
                self.log(f"No match for file:\n  {file_path}\n  (file key: {file_key})")
            else:
                self.log(f"Multiple matches for file:\n  {file_path}\n  (file key: {file_key})")
                self.log(f"Candidates: {candidates}")
            
            # Update progress.
            self.update_progress(idx, total_files)
            time.sleep(0.1)  # a small delay for smoother UI feedback
        
        self.log("Processing complete.")
        self.run_button.config(state=tk.NORMAL)
    
    def insert_applicable_images(self):
        """Disable the button and run the image insertion in a separate thread."""
        self.insert_button.config(state=tk.DISABLED)
        thread = threading.Thread(target=self.process_images_insertion)
        thread.start()
    
    def process_images_insertion(self):
        """Process images for insertion into CatalogImages table."""
        pattern = re.compile(r'^(\d+)\[(.+?)\]\.png$', re.IGNORECASE)
        file_list = []
        for root, dirs, files in os.walk(self.png_dir):
            for f in files:
                if pattern.match(f):
                    file_list.append(os.path.join(root, f))
        
        total_files = len(file_list)
        self.log(f"Found {total_files} applicable PNG files for insertion.")
        if total_files == 0:
            self.log("No applicable images found.")
            self.insert_button.config(state=tk.NORMAL)
            return
        
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        
        for idx, file_path in enumerate(file_list, start=1):
            filename = os.path.basename(file_path)
            m = pattern.match(filename)
            if not m:
                continue
            
            plant_id = int(m.group(1))
            rel_path = os.path.relpath(file_path, self.png_dir)
            new_path = os.path.join(self.png_complete_dir, rel_path)
            new_dir = os.path.dirname(new_path)
            base_name = sanitize_filename(os.path.basename(new_path))
            new_path = os.path.join(new_dir, base_name)
            os.makedirs(new_dir, exist_ok=True)
            
            try:
                cur.execute("INSERT INTO CatalogImages (plantcatalog_id, image_path) VALUES (?, ?)", 
                          (plant_id, new_path))
                conn.commit()
                self.log(f"Inserted image record for plant id {plant_id}: {new_path}")
                self.flash_image(file_path)
                shutil.move(file_path, new_path)
            except Exception as e:
                self.log(f"Error inserting or moving {file_path}: {e}")
            
            self.update_progress(idx, total_files)
            time.sleep(0.1)
        
        conn.close()
        self.log("Image insertion processing complete.")
        self.insert_button.config(state=tk.NORMAL)

if __name__ == '__main__':
    app = Application()
    app.mainloop()
