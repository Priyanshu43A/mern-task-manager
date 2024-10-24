# MERN Task Manager

This project is a **MERN stack** web application where users can manage tasks in both **boss** and **employee** profiles. The app allows bosses to assign tasks to employees and manage teams, while employees can view assigned tasks, mark them as complete, and manage their work. Additionally, bosses can send requests to potential employees, and users can accept or decline these invitations.

## Features

- **Dual Profiles**: Users can switch between **boss** and **employee** profiles.
- **Task Assignment**: Bosses can assign tasks to employees, with tasks categorized by status (active, completed, etc.).
- **Team Management**: Bosses can send requests to users by their username to invite them to the team.
- **Task Management**: Employees can view their assigned tasks, update statuses, and manage deadlines.
- **User Authentication**: Secure login and registration using JWT.
- **Scalable Architecture**: Backend API designed using Node.js, Express, and MongoDB, with React.js handling the frontend.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel for frontend, (to be determined) for backend

## Project Structure

The project is divided into two main parts: `frontend` and `backend`.

```bash
mern-task-manager/
│
├── backend/
│   ├── controllers/   # Handles request logic for users, teams, and tasks
│   ├── models/        # MongoDB schemas for User, Team, Task
│   ├── routes/        # API routes
│   ├── middleware/    # Authentication middleware (JWT)
│   ├── config/        # Database configuration
│   ├── server.js      # Main entry point for backend server
│   └── package.json   # Node.js dependencies
│
└── frontend/
    ├── public/        # Public assets
    ├── src/           # React components, pages, and API service
    ├── package.json   # React dependencies
    └── README.md      # Project documentation

```
