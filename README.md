## Health Tech Solutions – Task Management System
A full-stack task management application built with Django (backend) and React + TypeScript (frontend). This system allows users to create, view, edit, delete, and track the status of tasks via a clean, professional UI.

### Assumptions
For ease of running this application and because of ease in deployed the requirement and assumption is that Docker and Docker Compose is already installed.

With this requirement met No additional setup is needed; the database and server are handled automatically by Docker.

### Deployment
This project is fully containerized with Docker, so it only needs to be deployed once. Both the backend and frontend are automatically set up using Docker Compose.

### Steps to Run:

### 1️⃣ Clone the Repository

Ensure you are in the directory containing the file docker-compose.yml
### 2️⃣ Build and run the application:
```bash
docker compose up --build
```
The backend will start first, followed by the frontend. No need to run them separately.

### 3️⃣ Access the application
Open your browser and go to: http://localhost:3300/


### Features of the application
- List all tasks in a professional table view.

- Create, edit, and delete tasks with validation and success feedback.

- Task status displayed in a dashboard-style view.

- Fully responsive, professional UI with loading states and confirmation modals.

