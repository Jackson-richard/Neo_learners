# 📚 AI-Powered Literacy Assistant for Neo-Learners

An AI-powered web application designed to help neo-learners improve their literacy skills through structured learning content, multilingual support, learner assessments, and personalized proficiency tracking.

This repository contains **Module 1**, which establishes the core learning platform by managing curriculum, learner profiles, assessments, and proficiency evaluation. Future modules will build on this foundation by introducing AI-driven recommendations and personalized learning paths.

---

## 🚀 Features

### 👤 Learner Management
- User Registration
- Secure Login & Authentication (JWT)
- Password Encryption
- Learner Profile Management
- Preferred Language Selection

### 📖 Curriculum Management
- Create, Read, Update & Delete Curriculum
- Lesson Management
- Difficulty Levels
- Lesson Categories
- Structured Learning Paths

### 🌍 Multilingual Learning
- English
- Hindi
- Tamil
- Kannada
- Easy Language Switching

### 📝 Assessment System
- Reading Assessment
- Writing Assessment
- Comprehension Assessment
- Automatic Score Calculation
- Response Storage

### 📊 Proficiency Evaluation
Learner proficiency is automatically determined based on assessment scores.

| Score | Level |
|-------|--------|
| 0 – 40 | Beginner |
| 41 – 70 | Intermediate |
| 71 – 100 | Advanced |

---

# 🏗️ Tech Stack

## Frontend
- React.js
- React Router
- Material UI (MUI)
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Express Validator

## Database
- MongoDB

---

# 📁 Project Structure

```
AI-Powered-Literacy-Assistant/

│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

# 🗄️ Database Collections

- Users
- Curriculum
- Lessons
- LessonTranslations
- Assessments
- Questions
- Responses
- Results

---

# 🔐 Authentication

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization (Admin & Learner)

---

# 📚 Module 1

## 1️⃣ Curriculum Management

- Create Curriculum
- Update Curriculum
- Delete Curriculum
- View Curriculum
- Organize Lessons
- Difficulty Levels

---

## 2️⃣ Lesson Management

Each lesson contains:

- Title
- Description
- Learning Material
- Exercises
- Difficulty
- Category
- Language
- Estimated Duration

Supports multiple languages for improved accessibility.

---

## 3️⃣ Learner Registration

Each learner profile includes:

- Name
- Email
- Password
- Age
- Education Level
- Preferred Language

---

## 4️⃣ Assessment Module

Three assessments are available:

- Reading
- Writing
- Comprehension

The system stores learner responses and calculates scores automatically.

---

## 5️⃣ Proficiency Calculation

Overall learner proficiency is determined based on assessment scores and categorized as:

- Beginner
- Intermediate
- Advanced

---

# 🌐 REST API Endpoints

## Authentication

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
```

## Curriculum

```
GET    /api/curriculum
POST   /api/curriculum
PUT    /api/curriculum/:id
DELETE /api/curriculum/:id
```

## Lessons

```
GET    /api/lessons
POST   /api/lessons
PUT    /api/lessons/:id
DELETE /api/lessons/:id
```

## Assessments

```
GET    /api/assessments
POST   /api/assessments
PUT    /api/assessments/:id
DELETE /api/assessments/:id
```

## Responses

```
POST   /api/responses
GET    /api/responses/:userId
```

## Results

```
GET    /api/results/:userId
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AI-Powered-Literacy-Assistant.git
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📌 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---



- AI Recommendation Engine
- Personalized Learning Paths
- Speech Recognition
- Pronunciation Evaluation
- Progress Analytics Dashboard
- Gamification
- Learning Streaks
- Smart Revision Plans

---


**Jackson Richard J**


---

# 📄 License

This project is developed for academic and internship purposes.

---

## ⭐ If you like this project, don't forget to give it a star!
