Task Management System

A full-stack Task Management System built with Node.js, TypeScript, Prisma, SQLite, and Next.js.

 Tech Stack
- Backend: Node.js, TypeScript, Express, Prisma, SQLite, JWT Authentication
- Frontend: Next.js, TypeScript, Tailwind CSS

Project Structure
```
task-management-system/
├── backend/    # Node.js REST API
└── frontend/   # Next.js Web App
```
 How to Run

1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```
Backend runs on: http://localhost:5000

2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

API Endpoints

### Auth
| Method | Endpoint | Description |

| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout user |

 Tasks (Protected Routes)
| Method | Endpoint | Description |

| GET | /tasks | Get all tasks (pagination, filter, search) |
| POST | /tasks | Create new task |
| GET | /tasks/:id | Get single task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| PATCH | /tasks/:id/toggle | Toggle task status |

 Features
- JWT Authentication (Access Token + Refresh Token)
-  Password hashing with bcrypt
-  Full Task CRUD operations
-  Pagination, filtering by status, search by title
-  Responsive UI (mobile + desktop)
-  Toast notifications
-  Auto token refresh
