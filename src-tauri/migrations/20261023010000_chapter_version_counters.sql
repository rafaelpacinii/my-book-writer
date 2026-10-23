-- Preserve version numbers after snapshots are deleted.
CREATE TABLE chapter_version_counters (
    chapter_id TEXT PRIMARY KEY NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    last_number INTEGER NOT NULL CHECK (last_number > 0)
);

INSERT INTO chapter_version_counters (chapter_id, last_number)
SELECT chapter_id, MAX(version_number) FROM chapter_versions GROUP BY chapter_id;
