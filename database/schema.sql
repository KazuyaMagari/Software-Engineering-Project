
-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);

-- ============================================================================
-- 2. TASKS TABLE
-- ============================================================================

CREATE TABLE tasks (
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

CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_title_search ON tasks USING GIN(to_tsvector('english', title));

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
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for tasks table
CREATE TRIGGER update_tasks_timestamp
BEFORE UPDATE ON tasks
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
