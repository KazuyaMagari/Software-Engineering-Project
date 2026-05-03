# Database Design

## Current Version

- **v1.0** - Comprehensive PostgreSQL schema design (4/13/2026)
- See [SCHEMA_DESIGN.md](SCHEMA_DESIGN.md) for complete documentation

## Quick Overview

The database uses **PostgreSQL** (Neon) with the following core entities:

- **Users**: User accounts and profiles (Auth0 integration)
- **Tasks**: Main task entity with status, priority, deadlines, recurrence
- **Categories**: User-defined task categories
- **Comments**: Collaboration comments on tasks
- **Attachments**: File storage references
- **Assignments**: Assign multiple users to tasks
- **Sharing**: Control task access and permissions
- **Activity Log**: Audit trail of all changes

## Schema Structure

- 11 main tables
- Support for recurring tasks with iCalendar format
- Role-based access control via TaskSharing
- Full audit logging
- Optimized indexes for common queries

## Key Technologies

- Database: PostgreSQL (Neon cloud)
- Authentication: Auth0
- File Storage: GCS / Firebase / S3 / Azure / Dropbox
- Access Control: Row-Level Security (RLS) recommended

See [SCHEMA_DESIGN.md](SCHEMA_DESIGN.md) for SQL definitions and detailed documentation.
