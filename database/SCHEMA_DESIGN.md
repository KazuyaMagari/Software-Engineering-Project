# Database Schema Design - Fredonia Calendar Project

**Last Updated:** 4/18/2026  
**Version:** 2.0 (Phase 1 - MVP)

## Overview

Simplified database schema for **MVP (Minimum Viable Product)** phase. The database uses **PostgreSQL** (hosted on Neon) as the primary data store.

**Design Philosophy:** Start minimal, add features incrementally as needed.

---

## Core Entities & Relationships

```
Users (1) ──── (N) Tasks
```

**Phase 1 Focus:** Core task management for single/few users
**Future Phases:** Comments, Assignments, Categories, Sharing, etc.

---

## Table Definitions

### 1. Users

Core user entity with authentication metadata.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | UUID      | Primary key           |
| email      | VARCHAR   | User email            |
| auth0_id   | VARCHAR   | Auth0 user identifier |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time      |
| last_login | TIMESTAMP | Last login timestamp  |

---

### 2. Tasks

Main task entity with essential properties.

```sql
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
```

| Column       | Type      | Description                          |
| ------------ | --------- | ------------------------------------ |
| id           | UUID      | Primary key                          |
| creator_id   | UUID      | User who created the task            |
| title        | VARCHAR   | Task title                           |
| description  | TEXT      | Detailed task description            |
| status       | VARCHAR   | Open, In progress, Review, Completed |
| priority     | VARCHAR   | Low, Medium, High                    |
| due_date     | DATE      | Task deadline                        |
| created_at   | TIMESTAMP | Creation timestamp                   |
| updated_at   | TIMESTAMP | Last modified timestamp              |
| completed_at | TIMESTAMP | When task was completed              |

---

## Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth0_id ON users(auth0_id);

-- Task queries
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Full-text search
CREATE INDEX idx_tasks_title_search ON tasks USING GIN(to_tsvector('english', title));
```

---

## Key Constraints & Business Rules

1. **User Authentication**: All users must have an Auth0 ID
2. **Task Status**: Open → In progress → Review → Completed (or back to Open)
3. **Task Priority**: Low < Medium < High
4. **Cascading Deletes**: When a user is deleted, their tasks are removed
5. **Timestamps**: created_at and updated_at track history

---

## Data Volume Projections (Phase 1)

- **Users**: 1-10 concurrent users
- **Tasks**: 50-500 tasks per user
- **Total Records**: ~5K-10K tasks

---

## Security Considerations

1. **Authentication**: Delegated to Auth0
2. **Authorization**: Implement app-level checks (user can only see/edit their own tasks)
3. **Row-Level Security (RLS)**: Optional for future phases
4. **Prepared Statements**: Prevent SQL injection

---

## Migration Path - Future Phases

### Phase 2: Collaboration & Comments

```sql
-- Add when needed:
- comments table (task_id, user_id, content, timestamps)
```

### Phase 3: Task Sharing & Multiple Users

```sql
-- Add when needed:
- task_assignments (task_id, assigned_to_user_id, role)
- task_sharing (task_id, shared_with_user_id, permission_level)
```

### Phase 4: Organization & Metadata

```sql
-- Add when needed:
- categories (user_id, name, color)
- task_categories (task_id, category_id) - M2M junction
```

### Phase 5: Advanced Features

```sql
-- Add when needed:
- recurring_task_instances (parent_task_id, instance_date)
- task_attachments (task_id, file_name, storage_url)
- activity_log (task_id, action_type, old_value, new_value, timestamp)
```

---

## Implementation Notes
