# CodeArena - A Full-Stack LeetCode Clone

CodeArena is a comprehensive platform for developers to practice coding problems, run their code in real-time, and track their performance. It features a robust code execution engine, a full-featured admin panel, and high-performance caching for a seamless user experience.

## 🚀 Features

- **Professional Code Editor**: Integrated with **Monaco Editor** for a VS Code-like coding experience.
- **Real-Time Code Execution**: Supports multiple languages using the **Judge0 API** for instant feedback.
- **Secure Authentication**: User signup and login with **JWT** and secure HTTP-only cookies.
- **Submission History**: Detailed history of all user submissions with execution status and results.
- **Admin Dashboard**: Specialized interface for admins to create, edit, and delete problems.
- **High Performance**: **Redis** integration for optimized caching of problem lists and API responses.
- **Responsive UI**: Modern, dark-themed design built with **Tailwind CSS 4** and **DaisyUI**.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4, DaisyUI
- **State Management**: Redux Toolkit
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **Editor**: Monaco Editor (@monaco-editor/react)

### Backend
- **Environment**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis
- **Security**: JWT, Bcrypt, Helmet, CORS
- **APIs**: Judge0 (via RapidAPI)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Redis instance (Upstash or Redis Cloud)
- RapidAPI Key for Judge0

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/leetcode-clone.git
cd leetcode-clone
```

### 2. Backend Setup
```bash
cd BACKEND
npm install
```
Create a `.env` file in the `BACKEND` directory:
```env
PORT=3000
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_secret_jwt_key
REDIS_PASS=your_redis_password
REDIS_PORT=your_redis_port
REDIS_HOST=your_redis_host
RAPIDAPI_KEY=your_rapidapi_key
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../FRONTEND/vite-project
npm install
```
Create a `.env` file in the `FRONTEND/vite-project` directory:
```env
VITE_API_URL=http://localhost:3000
```
Run the frontend:
```bash
npm run dev
```

## 📸 Screenshots
*(Add screenshots here)*

## 🛡️ Security Features
- **JWT Authentication**: Secure token-based auth with HTTP-only cookies to prevent XSS.
- **Input Validation**: Server-side validation using `validator` and client-side using `Zod`.
- **Protected Routes**: Admin-only routes for sensitive operations.
- **Security Headers**: Powered by `helmet` for enhanced protection.

## 📈 Performance Optimizations
- **Redis Caching**: Frequently accessed problem lists are cached to reduce DB latency.
- **Optimized API**: Efficient Mongoose queries and response structuring.

## 📄 License
This project is licensed under the ISC License.
