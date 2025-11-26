# Bug Tracker Lite

> A full-featured bug tracking system built with Node.js, Express, MySQL, and email notifications. Perfect for practicing REST API development, database operations, CI/CD, and collaborative workflows.

## 🎯 Project Purpose

This project covers all key skills mentioned in modern web development job descriptions:
- ✅ RESTful API development
- ✅ MySQL database queries and reporting
- ✅ Email notification system
- ✅ JWT authentication & authorization
- ✅ Admin tools and dashboards
- ✅ Git workflow with pull requests
- ✅ Testing with high coverage
- ✅ CI/CD with GitHub Actions
- ✅ Technical documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- MySQL 8.0+ installed and running
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Bug-Tracker-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=bug_tracker
   JWT_SECRET=your_secret_key_here
   ```

4. **Create database**
   ```bash
   mysql -u root -p
   CREATE DATABASE bug_tracker;
   exit;
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed sample data**
   ```bash
   npm run db:seed
   ```

7. **Start the server**
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:3000`

## 📚 API Documentation

### Authentication

#### Register User
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "developer"  // Optional: admin, developer, reporter (default)
}
```

#### Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "developer"
  }
}
```

### Bugs

All bug endpoints require authentication. Include token in headers:
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Get All Bugs
```bash
GET /api/bugs?status=open&priority=high&page=1&limit=10
```

#### Get Bug by ID
```bash
GET /api/bugs/:id
```

#### Create Bug
```bash
POST /api/bugs
Content-Type: application/json

{
  "title": "Login page not loading",
  "description": "Users cannot access the login page on mobile devices",
  "priority": "critical",  // low, medium, high, critical
  "severity": "critical"   // minor, major, critical
}
```

#### Update Bug (Admin/Developer only)
```bash
PUT /api/bugs/:id
Content-Type: application/json

{
  "status": "in_progress",  // open, in_progress, resolved, closed, reopened
  "assigned_to": 2,          // User ID
  "priority": "high"
}
```

#### Add Comment to Bug
```bash
POST /api/bugs/:id/comments
Content-Type: application/json

{
  "comment": "I've identified the root cause. Working on a fix."
}
```

#### Delete Bug (Admin only)
```bash
DELETE /api/bugs/:id
```

### Reports (Admin/Developer only)

#### Bugs by Priority
```bash
GET /api/reports/bugs-by-priority
```

#### Bugs Per Day
```bash
GET /api/reports/bugs-per-day?days=30
```

#### Developer Performance
```bash
GET /api/reports/developer-performance
```

#### SLA Violations
```bash
GET /api/reports/sla-violations
```

#### Bug Status Summary
```bash
GET /api/reports/bug-status-summary
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# View coverage report
npm test
# Then open: coverage/lcov-report/index.html
```

## 📊 Database Schema

### Users
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - admin, developer, or reporter

### Bugs
- `id` - Primary key
- `title` - Bug title
- `description` - Detailed description
- `priority` - low, medium, high, critical
- `severity` - minor, major, critical
- `status` - open, in_progress, resolved, closed, reopened
- `reporter_id` - Foreign key to users
- `assigned_to` - Foreign key to users (nullable)
- `created_at`, `updated_at`, `resolved_at` - Timestamps

### Comments
- `id` - Primary key
- `bug_id` - Foreign key to bugs
- `user_id` - Foreign key to users
- `comment` - Comment text
- `created_at` - Timestamp

### Bug History
- Tracks all changes made to bugs for audit purposes

## 🔐 User Roles

| Role      | Permissions                                      |
|-----------|--------------------------------------------------|
| Reporter  | Create bugs, add comments, view bugs             |
| Developer | All reporter permissions + update bugs           |
| Admin     | All permissions + delete bugs, view all reports  |

## 📧 Email Notifications

The system sends emails for:
- Bug assignment to developers
- Status updates to bug reporters

Configure email in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

## 🛠 Tech Stack

- **Backend:** Node.js + Express
- **Database:** MySQL 8.0
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **Email:** Nodemailer
- **Testing:** Jest + Supertest
- **CI/CD:** GitHub Actions

## 📁 Project Structure

```
Bug-Tracker-Project/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI pipeline
├── src/
│   ├── config/
│   │   ├── database.js      # MySQL connection pool
│   │   └── email.js         # Email configuration
│   ├── controllers/
│   │   ├── bugController.js # Bug CRUD operations
│   │   ├── userController.js# Authentication & users
│   │   └── reportController.js # Report generation
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   ├── migrate.js       # Migration script
│   │   └── seed.js          # Sample data seeding
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── validation.js    # Request validation
│   ├── routes/
│   │   ├── bugRoutes.js     # Bug endpoints
│   │   ├── userRoutes.js    # User endpoints
│   │   └── reportRoutes.js  # Report endpoints
│   └── server.js            # Express app entry point
├── tests/
│   ├── bugController.test.js
│   └── reportController.test.js
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔄 Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/add-bug-labels
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Add label field to bugs table"
   ```

3. **Push and create pull request**
   ```bash
   git push origin feature/add-bug-labels
   ```

4. **Review and merge** through GitHub UI

## 🎓 Learning Exercises

Try extending this project:

1. **Add bug labels/tags** (many-to-many relationship)
2. **Implement file attachments** for bugs
3. **Create a dashboard frontend** with React
4. **Add real-time notifications** with WebSockets
5. **Implement bug watchers** (users following bugs)
6. **Add activity timeline** for each bug
7. **Create custom report builder**
8. **Add two-factor authentication**
9. **Implement rate limiting**
10. **Add API versioning**

## 🐛 Sample API Calls with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bugtracker.com","password":"password123"}'

# Create a bug (replace YOUR_TOKEN)
curl -X POST http://localhost:3000/api/bugs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"API returning 500 error",
    "description":"The GET /api/users endpoint is crashing the server",
    "priority":"critical",
    "severity":"critical"
  }'

# Get all bugs
curl http://localhost:3000/api/bugs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get developer performance report
curl http://localhost:3000/api/reports/developer-performance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and portfolio purposes.

## 💡 Interview Tips

When discussing this project in interviews:

1. **Explain the architecture** - RESTful design, MVC pattern, middleware chain
2. **Discuss database design** - Foreign keys, indexes, normalization
3. **Talk about security** - Password hashing, JWT, role-based access control
4. **Mention testing** - Unit tests, integration tests, coverage metrics
5. **Highlight CI/CD** - Automated testing on each push, GitHub Actions
6. **Show email integration** - Working with external services (Nodemailer)
7. **Explain prioritization logic** - SLA violations report demonstrates customer impact awareness
8. **Talk about scalability** - Connection pooling, pagination, indexed queries

---

**Built with ❤️ for interview preparation**