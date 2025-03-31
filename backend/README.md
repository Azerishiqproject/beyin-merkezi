# Beyin Merkezi Backend

This is the backend API for the Beyin Merkezi project, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- User management (CRUD operations)
- Department management (CRUD operations)
- User data management (CRUD operations)
- Role-based access control (Admin and User roles)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beyin-merkezi
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Departments

- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create a new department (Admin only)
- `PUT /api/departments/:id` - Update department (Admin only)
- `DELETE /api/departments/:id` - Delete department (Admin only)

### User Data

- `GET /api/user-data` - Get all user data (Admin only, can filter by department)
- `GET /api/user-data/:userId` - Get user data by user ID
- `POST /api/user-data` - Create user data
- `PUT /api/user-data/:id` - Update user data
- `DELETE /api/user-data/:id` - Delete user data

## License

This project is licensed under the MIT License. 