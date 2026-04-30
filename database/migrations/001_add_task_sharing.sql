-- ============================================================================
-- Add Task Sharing Support
-- ============================================================================

-- Create task_shares table
CREATE TABLE IF NOT EXISTS task_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  shared_with_id UUID NOT NULL,
  shared_by_id UUID NOT NULL,
  permission VARCHAR(50) DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (permission IN ('view', 'edit')),
  UNIQUE(task_id, shared_with_id)
);

CREATE INDEX IF NOT EXISTS idx_task_shares_task_id ON task_shares(task_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_shared_with_id ON task_shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_shared_by_id ON task_shares(shared_by_id);

-- Trigger for task_shares table
DROP TRIGGER IF EXISTS update_task_shares_timestamp ON task_shares;
CREATE TRIGGER update_task_shares_timestamp
BEFORE UPDATE ON task_shares
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
