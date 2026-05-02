# Fredonia Calendar Project - Backend API

A TypeScript-based Express.js REST API for managing tasks with user authentication, task sharing, and analytics capabilities.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Development](#development)

## Overview

This backend API provides a comprehensive task management system with the following features:

- **User Authentication** via Firebase Authentication
- **Task Management** - Create, read, update, and delete tasks
- **Task Sharing** - Share tasks with other users with permission control
- **Multi-user Support** - Track task ownership and access permissions
- **Analytics** - Comprehensive task statistics and performance metrics
- **PostgreSQL Database** - Persistent data storage with relational structure

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL
- **Authentication**: Firebase Admin SDK
- **CORS**: Enabled for cross-origin requests
- **Development**: Nodemon, ts-node

## Project Structure

```
backend/
├── app.ts                  # Main application entry point
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── src/
│   ├── config/
│   │   ├── database.ts     # PostgreSQL connection pool
│   │   └── firebase.ts     # Firebase Admin SDK initialization
│   ├── controllers/
│   │   ├── AuthController.ts       # User authentication logic
│   │   ├── TaskController.ts       # Task management logic
│   │   └── AnalyticsController.ts  # Analytics logic
│   ├── db/
│   │   └── deploy.ts       # Database migration runner
│   ├── middleware/
│   │   └── authMiddleware.ts       # Firebase token verification
│   ├── models/
│   │   ├── User.ts         # User data model
│   │   ├── Task.ts         # Task data model
│   │   └── Analytics.ts    # Analytics data model
│   └── routes/
│       └── api.ts          # API route definitions
└── database/
    ├── schema.sql          # Database schema
    └── migrations/         # Migration scripts
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Firebase project with Admin SDK credentials

### Installation Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** (see [Environment Variables](#environment-variables))

3. **Deploy database schema**
   ```bash
   npm run deploy-db
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start at `http://localhost:3000` and automatically reload on file changes.

### Production Build

```bash
npm run build
```

### Deploy Database

```bash
npm run deploy-db
```

## API Documentation

All API endpoints (except `/` and `/auth/register`) require Firebase authentication via the `Authorization: Bearer <token>` header.

### Authentication Endpoints

#### Register or Get User

- **POST** `/api/auth/register`
- **Authentication**: Required
- **Description**: Register a new user or get existing user if already registered
- **Response**: User ID and email

#### Get Current User

- **GET** `/api/auth/me`
- **Authentication**: Required
- **Description**: Retrieve the current authenticated user's information
- **Response**: User ID, email, and metadata

### Task Endpoints

#### Get All Tasks

- **GET** `/api/tasks`
- **Authentication**: Required
- **Query Parameters**:
  - `search` (optional): Search tasks by title or description
- **Response**: Array of tasks owned by the user
- **Example**: `GET /api/tasks?search=meeting`

#### Get Accessible Tasks

- **GET** `/api/tasks/accessible`
- **Authentication**: Required
- **Description**: Get all tasks owned by user plus tasks shared with them
- **Response**: Array of accessible tasks with owner information

#### Create Task

- **POST** `/api/tasks`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "Task Title",
    "description": "Task Description (optional)",
    "priority": "Low|Medium|High",
    "due_date": "2026-05-15T00:00:00Z (optional)"
  }
  ```
- **Response**: Created task object

#### Update Task

- **PUT** `/api/tasks`
- **Authentication**: Required (owner or editor)
- **Request Body**: Partial task fields to update
- **Response**: Updated task object

#### Update Task Status

- **PUT** `/api/tasks/status`
- **Authentication**: Required (owner or editor)
- **Request Body**:
  ```json
  {
    "task_id": "task_uuid",
    "status": "Open|In progress|Review|Completed|Overdue"
  }
  ```
- **Response**: Updated task with new status

#### Delete Task

- **DELETE** `/api/tasks`
- **Authentication**: Required (owner only)
- **Query Parameters**:
  - `task_id`: ID of task to delete
- **Response**: Confirmation message

#### Share Task

- **POST** `/api/tasks/share`
- **Authentication**: Required (owner only)
- **Request Body**:
  ```json
  {
    "task_id": "task_uuid",
    "shared_with_email": "user@example.com",
    "permission": "view|edit"
  }
  ```
- **Response**: Share record confirmation

#### Unshare Task

- **POST** `/api/tasks/unshare`
- **Authentication**: Required (owner only)
- **Request Body**:
  ```json
  {
    "task_id": "task_uuid",
    "shared_with_email": "user@example.com"
  }
  ```
- **Response**: Confirmation message

#### Get Task Shares

- **GET** `/api/tasks/shares`
- **Authentication**: Required (owner only)
- **Query Parameters**:
  - `task_id`: ID of task
- **Response**: Array of users the task is shared with and their permissions

### Analytics Endpoints

#### Get Task Statistics

- **GET** `/api/analytics/stats`
- **Authentication**: Required
- **Response**: Total tasks, completed, pending, and overdue counts

#### Get Status Breakdown

- **GET** `/api/analytics/status-breakdown`
- **Authentication**: Required
- **Response**: Task count by status (Open, In Progress, Review, Completed, Overdue)

#### Get Priority Breakdown

- **GET** `/api/analytics/priority-breakdown`
- **Authentication**: Required
- **Response**: Task count by priority level (Low, Medium, High)

#### Get Completion Trends

- **GET** `/api/analytics/completion-trends`
- **Authentication**: Required
- **Response**: Task completion data over time

#### Get Performance Metrics

- **GET** `/api/analytics/performance-metrics`
- **Authentication**: Required
- **Response**: User performance statistics

#### Get Team Performance

- **GET** `/api/analytics/team-performance`
- **Authentication**: Required
- **Response**: Performance metrics for shared tasks and team collaboration

## Database Schema

### Key Tables

**users**

- `id` (UUID): Unique user identifier
- `firebase_uid` (string): Firebase Authentication UID
- `email` (string): User email address
- `created_at` (timestamp): Account creation time

**tasks**

- `id` (UUID): Unique task identifier
- `creator_id` (UUID): User who created the task
- `title` (string): Task title
- `description` (text): Task description
- `status` (enum): Current task status
- `priority` (enum): Task priority level
- `due_date` (timestamp): Task deadline
- `created_at` (timestamp): Creation time
- `updated_at` (timestamp): Last update time
- `completed_at` (timestamp): Completion time

**task_shares**

- `id` (UUID): Unique share record ID
- `task_id` (UUID): Shared task ID
- `shared_with_id` (UUID): User the task is shared with
- `permission` (enum): 'view' or 'edit'
- `created_at` (timestamp): Share creation time

For full schema details, see [database/SCHEMA_DESIGN.md](../database/SCHEMA_DESIGN.md) and [database/schema.sql](../database/schema.sql)

## Authentication

### How It Works

1. Frontend sends Firebase authentication token in `Authorization: Bearer <token>` header
2. `authMiddleware` verifies the token with Firebase Admin SDK
3. Token is decoded and user UID is attached to `req.user`
4. Controllers use UID to look up user and verify permissions

### Middleware Protection

- All sensitive endpoints require `authMiddleware`
- Public endpoints: `GET /` (health check) and `POST /api/auth/register`
- Requires valid Firebase ID token

## Development

### Code Structure

- **Controllers**: Handle request/response logic and business rules
- **Models**: Database queries and data manipulation
- **Middleware**: Authentication and request processing
- **Routes**: API endpoint definitions
- **Config**: Database and Firebase initialization

### Error Handling

- All controllers implement try-catch blocks
- Global error handler in app.ts catches unhandled exceptions
- Consistent JSON error response format

### Type Safety

- Full TypeScript strict mode
- Interfaces for all data models (ITask, IUser, etc.)
- Type-checked request/response objects

### Running Tests

Currently no test suite implemented. To be added in future updates.

## Future Enhancements

- Unit and integration tests
- Request validation middleware
- Rate limiting
- Advanced search and filtering
- Batch operations
- WebSocket support for real-time updates
- Audit logging
- Backup and recovery procedures
