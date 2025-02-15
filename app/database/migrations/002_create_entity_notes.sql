CREATE TABLE IF NOT EXISTS entity_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notable_type TEXT NOT NULL,
    notable_id INTEGER NOT NULL,
    note_type TEXT NOT NULL,
    note_text TEXT NOT NULL,
    parent_note_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dismissed_at TIMESTAMP,
    FOREIGN KEY (parent_note_id) REFERENCES entity_notes(id)
);

CREATE INDEX idx_entity_notes_notable ON entity_notes(notable_type, notable_id);
CREATE INDEX idx_entity_notes_parent ON entity_notes(parent_note_id);
