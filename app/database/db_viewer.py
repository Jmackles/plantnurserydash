import tkinter as tk
from tkinter import ttk, messagebox, filedialog   # Added filedialog import
import sqlite3
from PIL import Image, ImageTk
from io import BytesIO
import datetime

PAGE_SIZE = 10

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("SQLite DB Viewer")
        self.geometry("800x600")
        self.current_page = 0
        self.image_refs = {}  # to hold references for PhotoImage objects
        self.db_path = None
        self.selected_table = None
        self.create_widgets()
        self.log("Application started.")
        # Removed automatic load_data() call; user must select DB and table

    def create_widgets(self):
        # New top panel for DB and table selection
        select_frame = ttk.Frame(self)
        select_frame.pack(fill=tk.X, padx=5, pady=5)
        self.db_btn = ttk.Button(select_frame, text="Select Database", command=self.select_database)
        self.db_btn.pack(side=tk.LEFT, padx=5)
        ttk.Label(select_frame, text="Select Table:").pack(side=tk.LEFT, padx=5)
        self.table_cb = ttk.Combobox(select_frame, state="readonly")
        self.table_cb.bind("<<ComboboxSelected>>", self.on_table_select)
        self.table_cb.pack(side=tk.LEFT, padx=5)
        
        # Top frame containing treeview and nav controls
        top_frame = ttk.Frame(self)
        top_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Treeview frame with scrollbars
        tree_frame = ttk.Frame(top_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True)
        
        # Treeview: first (hidden) column holds the image; second column shows tag_name.
        self.tree = ttk.Treeview(tree_frame, columns=("tag_name",), show="tree headings")
        self.tree.heading("#0", text="Image")
        self.tree.heading("tag_name", text="tag_name")
        self.tree.column("#0", width=60, anchor='center')
        self.tree.column("tag_name", anchor='w')
        self.tree.bind("<<TreeviewSelect>>", self.on_item_select)
        
        vsb = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        hsb = ttk.Scrollbar(tree_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)
        self.tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")
        tree_frame.columnconfigure(0, weight=1)
        tree_frame.rowconfigure(0, weight=1)
        
        # Navigation and Close controls
        nav_frame = ttk.Frame(top_frame)
        nav_frame.pack(fill=tk.X, pady=5)
        self.prev_btn = ttk.Button(nav_frame, text="Previous", command=self.prev_page)
        self.prev_btn.pack(side=tk.LEFT, padx=5)
        self.page_label = ttk.Label(nav_frame, text=f"Page: {self.current_page + 1}")
        self.page_label.pack(side=tk.LEFT, padx=5)
        self.next_btn = ttk.Button(nav_frame, text="Next", command=self.next_page)
        self.next_btn.pack(side=tk.LEFT, padx=5)
        self.close_btn = ttk.Button(nav_frame, text="Close", command=self.on_close)
        self.close_btn.pack(side=tk.RIGHT, padx=5)

        # Bottom panel acting as a console with styled log text.
        console_frame = ttk.LabelFrame(self, text="Console Output")
        console_frame.pack(fill=tk.BOTH, padx=5, pady=5, expand=False)
        self.console = tk.Text(console_frame, height=8, background="#1e1e1e", foreground="#d4d4d4")
        self.console.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        console_scroll = ttk.Scrollbar(console_frame, command=self.console.yview)
        self.console.configure(yscrollcommand=console_scroll.set)
        console_scroll.pack(side=tk.RIGHT, fill=tk.Y)

    def log(self, message, level="INFO"):
        now = datetime.datetime.now().strftime("%H:%M:%S")
        log_message = f"[{now}] {level}: {message}\n"
        # Insert the log and apply style tags.
        start_index = self.console.index("end")
        self.console.insert(tk.END, log_message)
        if level == "ERROR":
            self.console.tag_add("error", start_index, f"{start_index} linestart +1l")
            self.console.tag_config("error", foreground="red")
        elif level == "INFO":
            self.console.tag_add("info", start_index, f"{start_index} linestart +1l")
            self.console.tag_config("info", foreground="green")
        self.console.see(tk.END)

    def select_database(self):
        path = filedialog.askopenfilename(title="Select SQLite Database", filetypes=[("SQLite Files", "*.sqlite"), ("All Files", "*.*")])
        if path:
            self.db_path = path
            self.log(f"Selected database: {path}")
            self.load_table_list()

    def load_table_list(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            if tables:
                self.table_cb['values'] = tables
                self.table_cb.set(tables[0])
                self.selected_table = tables[0]
                self.current_page = 0
                self.load_data()
                self.log("Table list loaded.")
            else:
                self.log("No tables found in database.", level="ERROR")
        except Exception as e:
            self.log(f"Error loading table list: {e}", level="ERROR")

    def on_table_select(self, event):
        self.selected_table = self.table_cb.get()
        self.current_page = 0
        self.load_data()
        self.log(f"Selected table: {self.selected_table}")

    def load_data(self):
        if not self.db_path or not self.selected_table:
            self.log("Database or table not selected.", level="ERROR")
            return
        self.log(f"Loading data for page {self.current_page + 1} from table {self.selected_table}")
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            offset = self.current_page * PAGE_SIZE
            # Adjusted query to use selected table
            query = f"SELECT tag_name, Image FROM {self.selected_table} ORDER BY tag_name LIMIT ? OFFSET ?"
            cursor.execute(query, (PAGE_SIZE, offset))
            rows = cursor.fetchall()
            conn.close()
            self.populate_tree(rows)
        except Exception as e:
            self.log(f"Failed to load data: {e}", level="ERROR")

    def populate_tree(self, rows):
        # Clear previous entries and image references.
        self.tree.delete(*self.tree.get_children())
        self.image_refs.clear()
        
        for idx, (tag, image_blob) in enumerate(rows):
            img = None
            if image_blob:
                try:
                    image = Image.open(BytesIO(image_blob))
                    image.thumbnail((50, 50))
                    img = ImageTk.PhotoImage(image)
                    self.image_refs[idx] = img  # maintain reference to avoid garbage collection
                except Exception as ex:
                    self.log(f"Image conversion error on tag '{tag}': {ex}", level="ERROR")
            self.tree.insert("", "end", iid=str(idx), text="", values=(tag,), image=img)
        self.page_label.config(text=f"Page: {self.current_page + 1}")
        self.log("Data loaded successfully.")

    def on_item_select(self, event):
        # Log selection; could be extended to show a full-size image/details.
        selected = self.tree.selection()
        if selected:
            item = self.tree.item(selected[0])
            tag = item["values"][0]
            self.log(f"Selected Tag: {tag}")

    def next_page(self):
        self.current_page += 1
        self.load_data()

    def prev_page(self):
        if self.current_page > 0:
            self.current_page -= 1
            self.load_data()
        else:
            self.log("Already at first page.", level="INFO")

    def on_close(self):
        self.log("Closing application.", level="INFO")
        self.destroy()

if __name__ == "__main__":
    app = App()
    app.mainloop()
