-- A completed review applies only to the content that was actually reviewed.
UPDATE review_progress SET needs_recheck = 1
WHERE reviewed_content_revision != (SELECT content_revision FROM chapters WHERE id = chapter_id)
   OR EXISTS (SELECT 1 FROM review_comments WHERE chapter_id = review_progress.chapter_id AND status = 'open');

CREATE TRIGGER invalidate_review_on_content_change
AFTER UPDATE OF content_revision ON chapters
WHEN NEW.content_revision != OLD.content_revision
BEGIN
    UPDATE review_progress SET needs_recheck = 1, updated_at = datetime('now')
    WHERE chapter_id = NEW.id;
END;

CREATE TRIGGER invalidate_review_on_new_comment
AFTER INSERT ON review_comments WHEN NEW.status = 'open'
BEGIN
    UPDATE review_progress SET needs_recheck = 1, updated_at = datetime('now')
    WHERE chapter_id = NEW.chapter_id;
END;

CREATE TRIGGER invalidate_review_on_reopened_comment
AFTER UPDATE OF status ON review_comments WHEN NEW.status = 'open' AND OLD.status != 'open'
BEGIN
    UPDATE review_progress SET needs_recheck = 1, updated_at = datetime('now')
    WHERE chapter_id = NEW.chapter_id;
END;
