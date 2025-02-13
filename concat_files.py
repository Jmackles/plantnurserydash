#!/usr/bin/env python
"""
File Concatenator Utility

This script provides a Tkinter-based GUI to help you select files from your file system
and concatenate them into a single master file (master.txt). The operations include:
  - Creating a timestamped backup of the existing master file.
  - Clearing the master file.
  - Writing a header with the directory structure (i.e. the list of file paths).
  - Appending the content of each selected file to the master file.
  
The GUI offers:
  - A treeview file explorer panel with filetype/folder icons and a legend.
  - A listbox showing the selected files.
  - Buttons to add files (via a file dialog), remove selected files, clear the list,
    and start the concatenation process.
  - A log panel that displays status messages with timestamps.

Double‑click or right‑click “Toggle Include” on a file node to add/remove it from the selection.
Files that are included show a “✓” appended to their display text and are highlighted.
  
Simply run this script, load a directory, and begin selecting files.
"""

import os
import shutil
from datetime import datetime
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext, END
import threading
import file_io_utils


class FileConcatenatorApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("File Concatenator Utility")
        self.geometry("1000x600")  # increased width for side panel
        self.resizable(True, True)

        # Remove duplicate state; listbox becomes the single source of truth.
        self.master_filename = 'master.txt'
        self.tree_item_to_path = {}
        self.tree_item_original_text = {}

        # Use a PanedWindow to separate explorer and file list
        self.paned = ttk.PanedWindow(self, orient="horizontal")
        self.paned.pack(fill="both", expand=True, padx=10, pady=10)

        # Left frame: File Explorer Panel
        self.frame_explorer = ttk.Frame(self.paned)
        self.paned.add(self.frame_explorer, weight=1)

        # Right frame: Selected Files and Log
        self.frame_main = ttk.Frame(self.paned)
        self.paned.add(self.frame_main, weight=2)

        self.create_explorer_widgets()
        self.create_main_widgets()
        self.log("Application started. Use 'Load Directory' to select a folder.")

    def create_explorer_widgets(self):
        # Button to load a directory
        btn_load_dir = ttk.Button(self.frame_explorer, text="Load Directory", command=self.load_directory)
        btn_load_dir.pack(padx=5, pady=5, anchor="n")

        # Legend frame: Shows filetype indicators
        frame_legend = ttk.Frame(self.frame_explorer)
        frame_legend.pack(padx=5, pady=5, fill="x")
        legend_text = (
            "Legend:  📁 Folder    🐍 Python    📜 JavaScript    ⚛️ TSX/JSX    🔷 TypeScript    "
            "🎨 CSS    🌐 HTML    📄 Other"
        )
        lbl_legend = ttk.Label(frame_legend, text=legend_text, wraplength=250, justify="center")
        lbl_legend.pack(padx=5, pady=5)

        # Frame to hold treeview and its scrollbar
        frame_explorer_inner = ttk.Frame(self.frame_explorer)
        frame_explorer_inner.pack(fill="both", expand=True)

        # Treeview for showing directories and files
        self.tree_files = ttk.Treeview(frame_explorer_inner)
        self.tree_files.pack(fill="both", expand=True, padx=5, pady=5)
        # Bind events
        self.tree_files.bind("<Double-1>", self.on_tree_item_double_click)
        self.tree_files.bind("<<TreeviewSelect>>", self.on_tree_selection)
        self.tree_files.bind("<Button-3>", self.show_context_menu)

        # Add vertical scrollbar for tree
        tree_scroll = ttk.Scrollbar(frame_explorer_inner, orient="vertical", command=self.tree_files.yview)
        self.tree_files.configure(yscrollcommand=tree_scroll.set)
        tree_scroll.pack(side="right", fill="y")

        # File Preview panel below the tree
        self.preview_text = tk.Text(self.frame_explorer, height=6, wrap="word")
        self.preview_text.pack(fill="x", padx=5, pady=5)

    def create_main_widgets(self):
        # --- Frame for Selected Files List ---
        frame_files = ttk.LabelFrame(self.frame_main, text="Selected Files")
        frame_files.pack(side="top", fill="both", expand=True, padx=10, pady=10)

        self.listbox_files = tk.Listbox(frame_files, selectmode="extended")
        self.listbox_files.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
        scrollbar = ttk.Scrollbar(frame_files, orient="vertical", command=self.listbox_files.yview)
        scrollbar.pack(side="left", fill="y", padx=(0, 10), pady=10)
        self.listbox_files.config(yscrollcommand=scrollbar.set)

        # --- Frame for Buttons ---
        frame_buttons = ttk.Frame(self.frame_main)
        frame_buttons.pack(fill="x", padx=10, pady=5)

        btn_add = ttk.Button(frame_buttons, text="Add Files", command=self.add_files)
        btn_add.pack(side="left", padx=5)

        btn_remove = ttk.Button(frame_buttons, text="Remove Selected", command=self.remove_selected)
        btn_remove.pack(side="left", padx=5)

        btn_clear = ttk.Button(frame_buttons, text="Clear List", command=self.clear_list)
        btn_clear.pack(side="left", padx=5)

        btn_exit = ttk.Button(frame_buttons, text="Exit", command=self.quit)
        btn_exit.pack(side="right", padx=5)

        btn_concat = ttk.Button(frame_buttons, text="Concatenate Files", command=self.concatenate_files)
        btn_concat.pack(side="right", padx=5)

        # --- Log Panel ---
        frame_log = ttk.LabelFrame(self.frame_main, text="Log")
        frame_log.pack(fill="both", expand=True, padx=10, pady=10)
        self.log_text = scrolledtext.ScrolledText(frame_log, wrap="word", height=10)
        self.log_text.pack(fill="both", expand=True, padx=10, pady=10)

    def log(self, message):
        """Append a timestamped log message to the log panel."""
        timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S] ")
        self.log_text.insert("end", timestamp + message + "\n")
        self.log_text.see("end")

    def add_files(self):
        """Open a file dialog to add one or more files to the list."""
        files = filedialog.askopenfilenames(title="Select Files to Concatenate")
        if files:
            count = 0
            current_files = self.listbox_files.get(0, END)
            for file in files:
                if file not in current_files:
                    self.listbox_files.insert(END, file)
                    count += 1
            self.log(f"Added {count} file(s).")

    def remove_selected(self):
        """Remove the selected file(s) from the list."""
        selected_indices = list(self.listbox_files.curselection())
        selected_indices.sort(reverse=True)
        for index in selected_indices:
            self.listbox_files.delete(index)
        self.log("Removed selected file(s).")

    def clear_list(self):
        """Clear all files from the selection list."""
        self.listbox_files.delete(0, END)
        self.log("Cleared file list.")

    def create_backup(self):
        """Create a backup of the master file (if it exists) with a timestamp."""
        if os.path.exists(self.master_filename):
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            backup_filename = f"{self.master_filename}.{timestamp}.bak"
            try:
                shutil.copy2(self.master_filename, backup_filename)
                self.log(f"Backup created: {backup_filename}")
            except Exception as e:
                self.log(f"Error creating backup: {str(e)}")
        else:
            self.log("No existing master file found; skipping backup.")

    def load_file(self, filename):
        """Load and return the content of a file."""
        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as file:
                    return file.read()
            except Exception as e:
                self.log(f"Error reading {filename}: {str(e)}")
                return None
        else:
            self.log(f"File not found: {filename}")
            return None

    def append_to_master_file(self, filename, content):
        """Append the given content to the master file, including a header."""
        try:
            with open(self.master_filename, 'a', encoding='utf-8') as master_file:
                master_file.write(f"\n\n# Content from {filename}\n\n")
                master_file.write(content)
            self.log(f"Appended content from {filename}")
        except Exception as e:
            self.log(f"Error appending {filename}: {str(e)}")

    def write_directory_structure(self):
        """Write the list of selected files (i.e. the directory structure) into the master file."""
        try:
            with open(self.master_filename, 'a', encoding='utf-8') as master_file:
                master_file.write("# Directory Structure\n\n")
                for file in self.selected_files:
                    master_file.write(f"{file}\n")
                master_file.write("\n\n")
            self.log("Directory structure written to master file.")
        except Exception as e:
            self.log(f"Error writing directory structure: {str(e)}")

    def concatenate_files(self):
        """Launch concatenation process in a separate thread."""
        files = self.listbox_files.get(0, END)
        if not files:
            messagebox.showwarning("No Files Selected", "Please add files to concatenate.")
            return
        if not messagebox.askyesno("Confirm Concatenation",
                                   "This will create a backup of the existing master file (if any) and overwrite it. Continue?"):
            return

        self.log("Starting concatenation process...")
        t = threading.Thread(target=self.run_concatenation, args=(files,))
        t.start()

    def run_concatenation(self, files):
        file_io_utils.create_backup(self.master_filename, self.log)
        try:
            open(self.master_filename, 'w').close()
            self.log("Cleared existing master file.")
        except Exception as e:
            self.log(f"Error clearing master file: {e}")
            return
        file_io_utils.write_directory_structure(self.master_filename, files, self.log)
        for file in files:
            content = file_io_utils.load_file(file, self.log)
            if content is not None:
                file_io_utils.append_to_master(self.master_filename, file, content, self.log)
        self.log("Concatenation process completed.")
        messagebox.showinfo("Completed", f"Files have been concatenated into {self.master_filename}.")

    def load_directory(self):
        """Let the user choose a directory to display in the file explorer."""
        dir_selected = filedialog.askdirectory(title="Select Directory")
        if not dir_selected:
            return
        self.tree_files.delete(*self.tree_files.get_children())
        self.tree_item_to_path.clear()
        self.tree_item_original_text.clear()
        self.populate_tree("", dir_selected)
        self.log(f"Loaded directory: {dir_selected}")

    def get_indicator(self, path):
        """Return an icon based on file type or folder."""
        if os.path.isdir(path):
            return "📁"
        ext = os.path.splitext(path)[1].lower()
        mapping = {
            '.py': '🐍',
            '.js': '📜',
            '.tsx': '⚛️',
            '.jsx': '⚛️',
            '.ts': '🔷',
            '.css': '🎨',
            '.html': '🌐',
            '.txt': '📄',
            '.json': '🔧'
        }
        return mapping.get(ext, "📄")

    def populate_tree(self, parent, path):
        """Recursively populate the tree with directories and files from the given path."""
        basename = os.path.basename(path)
        if not basename:
            basename = path  # For root directories
        icon = self.get_indicator(path)
        display_text = f"{icon} {basename}"
        node = self.tree_files.insert(parent, 'end', text=display_text, open=False)
        self.tree_item_to_path[node] = path
        self.tree_item_original_text[node] = display_text
        try:
            for entry in os.listdir(path):
                full_entry = os.path.join(path, entry)
                if os.path.isdir(full_entry):
                    self.populate_tree(node, full_entry)
                else:
                    file_icon = self.get_indicator(full_entry)
                    file_display = f"{file_icon} {entry}"
                    file_node = self.tree_files.insert(node, 'end', text=file_display)
                    self.tree_item_to_path[file_node] = full_entry
                    self.tree_item_original_text[file_node] = file_display
        except PermissionError:
            pass  # Skip directories that cannot be accessed

    def on_tree_item_double_click(self, event):
        """Toggle file inclusion when a user double-clicks a file node."""
        selected_items = self.tree_files.selection()
        if not selected_items:
            return
        item = selected_items[0]
        path = self.tree_item_to_path.get(item)
        if not path or os.path.isdir(path):
            return  # Only handle files

        # Toggle inclusion using the listbox as a single source.
        current_files = self.listbox_files.get(0, END)
        if path in current_files:
            # Remove from listbox.
            try:
                idx = current_files.index(path)
                self.listbox_files.delete(idx)
            except ValueError:
                pass
            self.log(f"Removed: {path}")
            original = self.tree_item_original_text.get(item, "")
            self.tree_files.item(item, text=original, tags=())
        else:
            self.listbox_files.insert(END, path)
            self.log(f"Added: {path}")
            original = self.tree_item_original_text.get(item, "")
            self.tree_files.item(item, text=f"{original} ✓", tags=("selected",))
            self.tree_files.tag_configure("selected", background="lightblue")

    def on_tree_selection(self, event):
        """Update preview panel with first few lines of the selected file."""
        selected = self.tree_files.selection()
        if not selected:
            self.preview_text.delete("1.0", END)
            return
        item = selected[0]
        path = self.tree_item_to_path.get(item)
        if path and os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    lines = f.readlines()[:10]
                preview = "".join(lines)
            except Exception as e:
                preview = f"Error previewing file: {e}"
        else:
            preview = ""
        self.preview_text.delete("1.0", END)
        self.preview_text.insert("1.0", preview)

    def show_context_menu(self, event):
        """Show a context menu to toggle file inclusion on right-click."""
        item = self.tree_files.identify_row(event.y)
        if not item:
            return
        self.tree_files.selection_set(item)
        menu = tk.Menu(self, tearoff=0)
        menu.add_command(label="Toggle Include", command=lambda: self.on_tree_item_double_click(event))
        menu.tk_popup(event.x_root, event.y_root)


if __name__ == "__main__":
    app = FileConcatenatorApp()
    app.mainloop()
