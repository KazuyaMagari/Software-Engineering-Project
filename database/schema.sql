
-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON users(auth0_id);

-- ============================================================================
-- 2. TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Open',
  priority VARCHAR(50) DEFAULT 'Medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (status IN ('Open', 'In progress', 'Review', 'Completed', 'Overdue')),
  CHECK (priority IN ('Low', 'Medium', 'High'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON tasks USING GIN(to_tsvector('english', title));

-- ============================================================================
-- 3. TASK SHARES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  shared_with_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, shared_with_id)
);

-- ============================================================================
-- SAMPLE DATA (for testing/development - remove in production)
-- ============================================================================

-- Insert sample users
-- Note: In production, users will be created via Auth0 integration
INSERT INTO users (email, auth0_id) VALUES
  ('user@example.com', 'auth0|user123'),
  ('developer@example.com', 'auth0|dev456')
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (creator_id, title, description, status, priority, due_date)
SELECT 
  users.id,
  'Sample Task 1',
  'This is a sample task for testing',
  'Open',
  'High',
  CURRENT_DATE + INTERVAL '3 days'
FROM users 
WHERE email = 'user@example.com'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- UTILITY FUNCTIONS (Optional - for common queries)
-- ============================================================================

-- Function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for tasks table
DROP TRIGGER IF EXISTS update_tasks_timestamp ON tasks;
CREATE TRIGGER update_tasks_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for task_shares table
DROP TRIGGER IF EXISTS update_task_shares_timestamp ON task_shares;
CREATE TRIGGER update_task_shares_timestamp
BEFORE UPDATE ON task_shares
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- INFORMATIONAL QUERIES
-- ============================================================================

-- View: User task summary
CREATE OR REPLACE VIEW user_task_summary AS
SELECT 
  users.id,
  users.email,
  COUNT(tasks.id) as total_tasks,
  SUM(CASE WHEN tasks.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
  SUM(CASE WHEN tasks.status = 'Open' THEN 1 ELSE 0 END) as open_tasks,
  SUM(CASE WHEN tasks.status = 'In progress' THEN 1 ELSE 0 END) as in_progress_tasks,
  MAX(tasks.due_date) as next_due_date
FROM users
LEFT JOIN tasks ON users.id = tasks.creator_id
GROUP BY users.id, users.email;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
