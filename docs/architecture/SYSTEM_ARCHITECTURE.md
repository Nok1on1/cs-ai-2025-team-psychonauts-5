# Dialogos System Architecture

**Project:** Dialogos AI Tutor  
**Version:** 2.0 (Week 4 Design Review)  
**Date:** November 7, 2025  
**Team:** Giorgi Mikaberidze, Nikoloz Kvirikashvili, Sergi Arabidze, Luka Mekoshvili, Lasha Giorgi Tskhadadze

---

## 📊 Executive Summary

Dialogos is an AI-powered entrance exam preparation platform for Georgian students, providing adaptive practice tests with Socratic feedback. The system generates personalized questions using Google's Gemini API, adapts difficulty based on performance, and tracks student progress over time.

**Key Metrics (Current):**
- Target Latency: <3s (Current: 4.2s)
- Cost per Test: <₾0.30 (Current: ₾0.09)
- Expected Users: 10-50 students during course
- Budget: ₾150 ($50) for entire semester

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DIALOGOS ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   Student User    │
                         │  (Web Browser)    │
                         └────────┬──────────┘
                                  │ HTTPS
                                  │
┌─────────────────────────────────▼─────────────────────────────────┐
│                         FRONTEND LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │   React 18 + Vite 4.5 (Deployed on Vercel)                 │   │
│  │                                                             │   │
│  │   Pages:                     State Management:             │   │
│  │   • Login/Signup             • React Context (Auth)        │   │
│  │   • Test Configuration       • Local State (Test Flow)     │   │
│  │   • Question Display         • localStorage (Progress)     │   │
│  │   • Results Review                                         │   │
│  │   • Performance Dashboard    Libraries:                    │   │
│  │                              • React Router v6             │   │
│  │   Components:                • Axios (API client)          │   │
│  │   • TestConfigForm           • Chart.js (Visualizations)   │   │
│  │   • QuestionCard             • Tailwind CSS (Styling)      │   │
│  │   • FeedbackPanel                                          │   │
│  │   • DashboardCharts                                        │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬───────────────────────────────────┘
                                 │ REST API (JSON)
                                 │ Authorization: Bearer {JWT}
                                 │
┌────────────────────────────────▼───────────────────────────────────┐
│                        BACKEND LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │   Express 4.18 + Node.js 20 (Azure App Service)           │   │
│  │                                                             │   │
│  │   API Routes:                Middleware:                   │   │
│  │   POST /api/auth/signup      • JWT Verification            │   │
│  │   POST /api/auth/login       • Input Validation            │   │
│  │   POST /api/tests/generate   • Rate Limiting (planned)     │   │
│  │   GET  /api/tests/:id        • Error Handling              │   │
│  │   POST /api/tests/:id/submit • Request Logging             │   │
│  │   GET  /api/tests/:id/feedback                             │   │
│  │   GET  /api/users/:id/dashboard                            │   │
│  │   GET  /api/health                                         │   │
│  │                                                             │   │
│  │   Services:                  ORM:                          │   │
│  │   • AuthService              • Sequelize (MSSQL)           │   │
│  │   • TestGenerationService    • Connection Pooling          │   │
│  │   • GradingService           • Migrations Support          │   │
│  │   • AnalyticsService                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────────┬────────────────────────┘
             │                              │
             │                              │
   ┌─────────▼─────────┐          ┌────────▼────────────────────────┐
   │   DATABASE LAYER  │          │    AI SERVICES LAYER            │
   │                   │          │                                 │
   │  MSSQL (Azure)    │          │  Google Gemini API              │
   │                   │          │                                 │
   │  Tables:          │          │  Models:                        │
   │  • Users          │          │  • gemini-1.5-flash (80%)       │
   │  • Tests          │          │    Fast, cheap, simple Qs       │
   │  • Responses      │          │    Cost: $0.0008/test           │
   │  • Performance    │          │                                 │
   │                   │          │  • gemini-1.5-pro (20%)         │
   │  Features:        │          │    Slower, expensive, complex   │
   │  • ACID           │          │    Cost: $0.012/test            │
   │  • Transactions   │          │                                 │
   │  • Indexes        │          │  Blended: ~$0.003/test          │
   │  • Foreign Keys   │          │                                 │
   │                   │          │  Functions:                     │
   │  Connection:      │          │  • Generate questions           │
   │  • Pool (max 10)  │          │  • Generate Socratic feedback   │
   │  • SSL/TLS        │          │  • Difficulty calibration       │
   │  • Auto-retry     │          │                                 │
   └───────────────────┘          └─────────────────────────────────┘
```

---

## 🔄 Data Flow: Generate and Complete Test

### Sequence Diagram

```
User          Frontend       Backend        Database      Gemini API
 │               │              │               │              │
 │ 1. Click      │              │               │              │
 │ "New Test"    │              │               │              │
 │──────────────>│              │               │              │
 │               │              │               │              │
 │               │ 2. Show form │               │              │
 │               │    Select:   │               │              │
 │               │    • Math    │               │              │
 │               │    • Level 3 │               │              │
 │               │    • 10 Qs   │               │              │
 │               │              │               │              │
 │ 3. Submit     │              │               │              │
 │──────────────>│              │               │              │
 │               │              │               │              │
 │               │ 4. Validate  │               │              │
 │               │    input     │               │              │
 │               │              │               │              │
 │               │ 5. POST      │               │              │
 │               │ /tests/gen   │               │              │
 │               │──────────────>│               │              │
 │               │              │               │              │
 │               │              │ 6. Verify JWT │              │
 │               │              │               │              │
 │               │              │ 7. Get user   │              │
 │               │              │    performance│              │
 │               │              │──────────────>│              │
 │               │              │               │              │
 │               │              │ 8. Return:    │              │
 │               │              │    • 68% acc  │              │
 │               │              │    • Weak:    │              │
 │               │              │      Algebra  │              │
 │               │              │<──────────────│              │
 │               │              │               │              │
 │               │              │ 9. Build prompt              │
 │               │              │    with context              │
 │               │              │               │              │
 │               │              │ 10. Call Flash (8 Qs)        │
 │               │              │──────────────────────────────>│
 │               │              │               │              │
 │               │              │ 11. Call Pro (2 Qs)          │
 │               │              │──────────────────────────────>│
 │               │              │               │              │
 │               │              │ 12. Return JSON              │
 │               │              │<──────────────────────────────│
 │               │              │               │              │
 │               │              │ 13. Validate  │              │
 │               │              │     output    │              │
 │               │              │               │              │
 │               │              │ 14. Store test│              │
 │               │              │──────────────>│              │
 │               │              │               │              │
 │               │              │ 15. Return ID │              │
 │               │              │<──────────────│              │
 │               │              │               │              │
 │               │ 16. Return   │               │              │
 │               │     test     │               │              │
 │               │<──────────────│               │              │
 │               │              │               │              │
 │               │ 17. Display  │               │              │
 │               │     Q1 of 10 │               │              │
 │<──────────────│              │               │              │
 │               │              │               │              │
 │ 18. Answer    │              │               │              │
 │     questions │              │               │              │
 │     (10x)     │              │               │              │
 │──────────────>│              │               │              │
 │               │              │               │              │
 │ 19. Submit    │              │               │              │
 │──────────────>│              │               │              │
 │               │              │               │              │
 │               │ 20. POST     │               │              │
 │               │ /tests/:id/  │               │              │
 │               │ submit       │               │              │
 │               │──────────────>│               │              │
 │               │              │               │              │
 │               │              │ 21. Grade     │              │
 │               │              │     answers   │              │
 │               │              │               │              │
 │               │              │ 22. Store     │              │
 │               │              │     responses │              │
 │               │              │──────────────>│              │
 │               │              │               │              │
 │               │              │ 23. Generate  │              │
 │               │              │     Socratic  │              │
 │               │              │     feedback  │              │
 │               │              │──────────────────────────────>│
 │               │              │               │              │
 │               │              │ 24. Return    │              │
 │               │              │     hints     │              │
 │               │              │<──────────────────────────────│
 │               │              │               │              │
 │               │ 25. Return   │               │              │
 │               │     results  │               │              │
 │               │<──────────────│               │              │
 │               │              │               │              │
 │               │ 26. Display  │               │              │
 │               │     score &  │               │              │
 │               │     feedback │               │              │
 │<──────────────│              │               │              │
 │               │              │               │              │

Total Time: ~4.2 seconds (Target: <3s)
```

### Latency Breakdown

| Step | Component | Time | % of Total |
|------|-----------|------|------------|
| 1-4 | Frontend validation | 50ms | 1.2% |
| 5 | Network (client→server) | 150ms | 3.6% |
| 6 | JWT verification | 10ms | 0.2% |
| 7-8 | Database query | 80ms | 1.9% |
| 9 | Prompt building | 20ms | 0.5% |
| 10-12 | Gemini API (both calls) | 2000ms | 47.6% |
| 13 | Output validation | 30ms | 0.7% |
| 14-15 | Database write | 80ms | 1.9% |
| 16 | Network (server→client) | 150ms | 3.6% |
| 17 | Frontend render | 300ms | 7.1% |
| **TOTAL** | **End-to-end** | **~4200ms** | **100%** |

**🔴 Primary Bottleneck:** Gemini API calls (2000ms = 47.6% of total time)

---

## 📦 Component Details

### 1. Frontend (React + Vite)

**Deployment:** Vercel  
**URL:** https://dialogos.vercel.app (staging)

#### Technology Stack

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

#### File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── test/
│   │   │   ├── TestConfigForm.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── TestTimer.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── results/
│   │   │   ├── ScoreBanner.jsx
│   │   │   ├── QuestionReview.jsx
│   │   │   └── FeedbackPanel.jsx
│   │   ├── dashboard/
│   │   │   ├── AccuracyChart.jsx
│   │   │   ├── TopicBreakdown.jsx
│   │   │   └── WeakTopics.jsx
│   │   └── shared/
│   │       ├── Header.jsx
│   │       ├── ErrorBoundary.jsx
│   │       └── LoadingSpinner.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTestGeneration.js
│   │   └── usePerformance.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── validation.js
│   │   └── formatters.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewTest.jsx
│   │   ├── TakeTest.jsx
│   │   └── Results.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

#### Key Implementation Details

**State Management Strategy:**
```javascript
// AuthContext.jsx - Global authentication state
import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    setToken(response.data.token)
    setUser(response.data.user)
    localStorage.setItem('token', response.data.token)
  }
  
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**API Client Configuration:**
```javascript
// services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

### 2. Backend (Express + Node.js)

**Deployment:** Azure App Service  
**URL:** https://dialogos-api.azurewebsites.net

#### Technology Stack

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.1",
    "tedious": "^16.6.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "@google/generative-ai": "^0.1.3",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── gemini.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Test.js
│   │   ├── Response.js
│   │   └── Performance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tests.js
│   │   └── users.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── testGenerationService.js
│   │   ├── gradingService.js
│   │   └── analyticsService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── validators.js
│   │   └── prompts.js
│   └── app.js
├── migrations/
├── .env.example
└── package.json
```

#### API Endpoints Documentation

| Method | Endpoint | Request Body | Response | Auth |
|--------|----------|--------------|----------|------|
| POST | `/api/auth/signup` | `{email, name, password}` | `{user, token}` | No |
| POST | `/api/auth/login` | `{email, password}` | `{user, token}` | No |
| POST | `/api/tests/generate` | `{subject, difficulty, numQuestions}` | `{testId, questions[]}` | Yes |
| GET | `/api/tests/:id` | - | `{test}` | Yes |
| POST | `/api/tests/:id/submit` | `{answers[]}` | `{score, results[], feedback[]}` | Yes |
| GET | `/api/tests/:id/feedback` | - | `{feedback[]}` | Yes |
| GET | `/api/users/:id/dashboard` | - | `{accuracy, weakTopics[], charts}` | Yes |
| GET | `/api/health` | - | `{status: 'ok'}` | No |

#### Key Implementation Details

**JWT Authentication Middleware:**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken')

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

**Test Generation Service:**
```javascript
// services/testGenerationService.js
const { GoogleGenerativeAI } = require('@google/generative-ai')
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function generateTest(userId, config) {
  // 1. Get user performance
  const performance = await getUserPerformance(userId, config.subject)
  
  // 2. Build context-aware prompt
  const prompt = buildPrompt(config, performance)
  
  // 3. Determine model selection (Flash vs Pro)
  const questions = []
  
  // Generate 8 simple/medium questions with Flash
  const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const flashResult = await flashModel.generateContent(prompt.flash)
  const flashQuestions = JSON.parse(flashResult.response.text())
  questions.push(...flashQuestions)
  
  // Generate 2 complex questions with Pro
  const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
  const proResult = await proModel.generateContent(prompt.pro)
  const proQuestions = JSON.parse(proResult.response.text())
  questions.push(...proQuestions)
  
  // 4. Validate output
  validateQuestions(questions)
  
  // 5. Store in database
  const test = await Test.create({
    userId,
    subject: config.subject,
    difficultyLevel: config.difficulty,
    questions: JSON.stringify(questions)
  })
  
  return { testId: test.id, questions }
}
```

---

### 3. Database (MSSQL on Azure)

**Service:** Azure SQL Database (Free Tier)  
**Connection:** SSL/TLS encrypted

#### Complete Schema

```sql
-- Users table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME,
    
    INDEX idx_email (email)
);

-- Tests table
CREATE TABLE Tests (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    subject NVARCHAR(50) NOT NULL,
    difficulty_level TINYINT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    questions NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    completed_at DATETIME NULL,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user_tests (user_id, created_at DESC)
);

-- Responses table
CREATE TABLE Responses (
    id INT PRIMARY KEY IDENTITY(1,1),
    test_id INT NOT NULL,
    question_index INT NOT NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_topic NVARCHAR(100) NOT NULL,
    user_answer NVARCHAR(500),
    correct_answer NVARCHAR(500) NOT NULL,
    is_correct BIT NOT NULL,
    time_spent_seconds INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (test_id) REFERENCES Tests(id) ON DELETE CASCADE,
    INDEX idx_test_responses (test_id),
    INDEX idx_topic_performance (question_topic, is_correct)
);

-- Performance table (aggregated analytics)
CREATE TABLE Performance (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    subject NVARCHAR(50) NOT NULL,
    topic NVARCHAR(100) NOT NULL,
    accuracy_percentage DECIMAL(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_questions INT NOT NULL,
    updated_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE (user_id, subject, topic),
    INDEX idx_user_performance (user_id, subject, topic)
);

-- Stored procedure for updating performance
CREATE PROCEDURE UpdatePerformance
    @user_id INT,
    @subject NVARCHAR(50),
    @topic NVARCHAR(100)
AS
BEGIN
    MERGE Performance AS target
    USING (
        SELECT 
            @user_id AS user_id,
            @subject AS subject,
            @topic AS topic,
            COUNT(*) AS total_questions,
            SUM(CAST(is_correct AS INT)) AS correct_questions,
            CAST(SUM(CAST(is_correct AS INT)) * 100.0 / COUNT(*) AS DECIMAL(5,2)) AS accuracy_percentage
        FROM Responses r
        JOIN Tests t ON r.test_id = t.id
        WHERE t.user_id = @user_id 
          AND t.subject = @subject
          AND r.question_topic = @topic
    ) AS source
    ON (target.user_id = source.user_id 
        AND target.subject = source.subject 
        AND target.topic = source.topic)
    WHEN MATCHED THEN
        UPDATE SET 
            total_questions = source.total_questions,
            correct_questions = source.correct_questions,
            accuracy_percentage = source.accuracy_percentage,
            updated_at = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT (user_id, subject, topic, total_questions, correct_questions, accuracy_percentage)
        VALUES (source.user_id, source.subject, source.topic, source.total_questions, source.correct_questions, source.accuracy_percentage);
END;
```

#### Connection Configuration

```javascript
// config/database.js
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    port: 1433,
    
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
      }
    },
    
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /ECONNRESET/,
        /ENOTFOUND/
      ]
    }
  }
)

module.exports = sequelize
```

---

### 4. AI Services (Gemini API)

**Provider:** Google AI Studio  
**Cost:** Pay-per-token

#### Model Selection Logic

```javascript
// utils/modelSelector.js
function selectModel(questionComplexity, topic) {
  // Use Pro for complex multi-step problems
  const proTopics = [
    'Multi-step Algebra',
    'Geometric Proofs',
    'Complex Logic Puzzles',
    'Advanced Calculus'
  ]
  
  if (proTopics.includes(topic) || questionComplexity === 'complex') {
    return {
      model: 'gemini-1.5-pro',
      cost: 0.012, // per request
      timeout: 5000
    }
  }
  
  // Use Flash for everything else
  return {
    model: 'gemini-1.5-flash',
    cost: 0.0008,
    timeout: 3000
  }
}
```

#### Prompt Templates

```javascript
// utils/prompts.js
const SYSTEM_PROMPT = `You are an expert Georgian National Entrance Exam tutor.
Generate pedagogically sound multiple-choice questions aligned with Georgian exam standards.
Output ONLY valid JSON array format.`

function buildQuestionPrompt(config, performance) {
  const { subject, difficulty, weakTopics, strongTopics } = config
  
  return {
    system: SYSTEM_PROMPT,
    user: `Generate ${config.numQuestions} ${subject} questions at difficulty ${difficulty}/5.

Student Context:
- Recent accuracy: ${performance.accuracy}%
- Weak topics (focus 60%): ${weakTopics.join(', ')}
- Strong topics (reinforce 40%): ${strongTopics.join(', ')}

Output Format:
[
  {
    "question": "question text",
    "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
    "correctAnswer": "B",
    "topic": "topic name",
    "explanation": "why this answer is correct"
  }
]

Requirements:
- Exactly ${config.numQuestions} questions
- Age-appropriate for 17-18 year olds
- Clear, unambiguous wording
- One definitively correct answer
- Plausible distractors`
  }
}

function buildFeedbackPrompt(question, userAnswer, correctAnswer) {
  return {
    system: `You are a Socratic tutor. Guide students to discover why their answer is incorrect without giving away the solution directly.`,
    user: `Question: ${question}
Student answered: ${userAnswer}
Correct answer: ${correctAnswer}

Provide a Socratic hint (2-3 sentences) that helps them realize their mistake. Ask guiding questions.`
  }
}
```

#### Cost Analysis

| Model | Input Cost | Output Cost | Avg Tokens | Cost/Test | Usage % |
|-------|------------|-------------|------------|-----------|---------|
| Gemini 1.5 Flash | $0.075/1M | $0.30/1M | 2500 | $0.0008 | 80% |
| Gemini 1.5 Pro | $1.25/1M | $5.00/1M | 2500 | $0.012 | 20% |
| **Blended Average** | - | - | - | **$0.003** | 100% |

**Monthly Projections (1000 tests):**
- Flash only: $0.80
- Pro only: $12.00
- Blended (80/20): $3.00 ✅

---

## ⚡ Performance Analysis

### Current Performance Metrics

| Metric | Target | Current | Gap | Status |
|--------|--------|---------|-----|--------|
| Test Generation (P95) | <3000ms | 4200ms | +1200ms | 🔴 |
| Question Quality | >85% | ~65% | -20% | 🔴 |
| Cost per Test | <₾0.30 | ₾0.09 | ✅ | 🟢 |
| Database Queries | <100ms | Untested | Unknown | ⚠️ |
| Frontend Load | <1000ms | ~800ms | ✅ | 🟢 |

### Performance Optimization Plan

#### Week 5 Optimizations (Target: -1200ms latency)

**1. Prompt Token Reduction (Expected: -600ms)**
```javascript
// BEFORE (1500 tokens)
const verbosePrompt = `You are an expert Georgian National Entrance Exam tutor with deep knowledge of pedagogical best practices...
[300 words of instructions]`

// AFTER (800 tokens)
const concisePrompt = `Generate 10 ${subject} questions at level ${difficulty}/5.
Focus: ${weakTopics.join(',')}
Format: JSON array with question, options[4], correctAnswer, topic, explanation.`

// Expected reduction: 700 tokens = ~30% faster response
```

**2. Database Query Optimization (Expected: -100ms)**
```sql
-- Add covering indexes
CREATE INDEX idx_dashboard_analytics 
ON Responses(user_id, created_at DESC) 
INCLUDE (question_topic, is_correct, time_spent_seconds);

-- Use compiled stored procedure instead of ad-hoc query
EXEC UpdatePerformance @user_id, @subject, @topic;
```

**3. Parallel API Calls (Expected: -500ms)**
```javascript
// BEFORE: Sequential calls (3.5s total)
const flashQuestions = await callFlash() // 2s
const proQuestions = await callPro()     // 1.5s

// AFTER: Parallel calls (2s total)
const [flashQuestions, proQuestions] = await Promise.all([
  callFlash(),  // 2s
  callPro()     // 1.5s (runs simultaneously)
])
```

**Expected Performance After Week 5:**
- Current: 4200ms
- Optimizations: -1200ms
- **Target: 3000ms ✅**

---

## 🔒 Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Frontend Security                                   │
│ • Input validation (client-side)                             │
│ • HTTPS only (enforced by Vercel)                            │
│ • No API keys in client code                                 │
│ • Content Security Policy headers                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Transport Security                                  │
│ • TLS 1.3 encryption                                         │
│ • JWT tokens in Authorization header                         │
│ • CORS restricted to frontend domain                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Application Security                                │
│ • JWT verification on all protected routes                   │
│ • Rate limiting (20 tests/user/day)                          │
│ • Input sanitization (prevent injection)                     │
│ • bcrypt password hashing (cost 10)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Data Security                                       │
│ • Database encryption at rest (Azure managed)                │
│ • SQL injection prevention (Sequelize ORM)                   │
│ • Connection pooling with SSL                                │
│ • Foreign key constraints                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: API Key Security                                    │
│ • Environment variables only                                 │
│ • Never committed to Git                                     │
│ • Rotated quarterly                                          │
│ • Separate keys for dev/staging/prod                         │
└─────────────────────────────────────────────────────────────┘
```

### Threat Model & Mitigations

| Threat | Likelihood | Impact | Mitigation | Status |
|--------|------------|--------|------------|--------|
| Unauthorized data access | Medium | High | JWT auth + HTTPS | ✅ |
| API key theft | Low | High | Env vars, server-side only | ✅ |
| SQL injection | Low | Critical | Sequelize ORM, parameterized queries | ✅ |
| Prompt injection | Medium | Medium | Input sanitization, system prompt guards | 📅 Week 5 |
| DDoS/API abuse | Medium | High | Rate limiting | 📅 Week 5 |
| Password compromise | Medium | High | bcrypt hashing, HTTPS | ✅ |
| CSRF attacks | Low | Medium | JWT (not cookies), CORS | ✅ |

---

## 💰 Cost Architecture

### Monthly Cost Breakdown (50 Users, 1000 Tests)

| Service | Plan | Usage | Cost | Notes |
|---------|------|-------|------|-------|
| **Frontend (Vercel)** | Free | 100GB bandwidth | $0 | Well within free tier |
| **Backend (Azure App Service)** | Free | F1 tier | $0 | Free student tier |
| **Database (Azure SQL)** | Free | 32MB, 5 DTU | $0 | Student credits |
| **Gemini API** | Pay-per-use | 1000 tests/month | $3 | Blended Flash/Pro |
| **Domain (optional)** | - | dialogos.ge | $12/year | Optional for production |
| **SSL Certificates** | - | - | $0 | Included with hosting |
| **Monitoring** | Free | Basic logging | $0 | Azure included |
| **TOTAL** | - | - | **~$3/month** | **Well within ₾150 budget** |

### Cost Optimization Strategies

**1. Smart Model Selection (Saves $9/month)**
```javascript
// Without optimization: All requests use Pro
// Cost: $12/month for 1000 tests

// With optimization: 80% Flash, 20% Pro
// Cost: $3/month for 1000 tests
// Savings: $9/month (75% reduction)
```

**2. Response Caching (Saves $1.50/month)**
```javascript
// Cache Socratic feedback for common mistakes
// Reduces duplicate Gemini calls by ~50% for feedback
// Savings: ~$1.50/month
```

**3. Rate Limiting (Prevents runaway costs)**
```javascript
// Hard cap: 20 tests/user/day
// Maximum possible cost: 50 users × 20 tests × $0.003 = $3/day
// Monthly cap with safety: $90/month (still under budget)
```

---

## 🔄 Deployment Architecture

### CI/CD Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    Development Workflow                       │
└──────────────────────────────────────────────────────────────┘

Developer → Git Commit → GitHub Repository
                              │
                              ├─── Frontend Branch (main)
                              │    │
                              │    ↓
                              │    Vercel Detects Push
                              │    │
                              │    ├─ Run Build: npm run build
                              │    ├─ Run Tests: npm test
                              │    ├─ Build Success?
                              │    │  ├─ Yes → Deploy to Production
                              │    │  │         https://dialogos.vercel.app
                              │    │  └─ No → Send Failure Email
                              │
                              └─── Backend Branch (main)
                                   │
                                   ↓
                                   Azure App Service Detects Push
                                   │
                                   ├─ Run Build: npm install
                                   ├─ Run Migrations: npm run migrate
                                   ├─ Health Check: GET /api/health
                                   ├─ All Pass?
                                   │  ├─ Yes → Deploy to Production
                                   │  │         https://dialogos-api.azurewebsites.net
                                   │  └─ No → Rollback to Previous Version

Deployment Time: ~2-3 minutes per service
```

### Environment Configuration

**Frontend (.env)**
```bash
VITE_API_URL=https://dialogos-api.azurewebsites.net/api
VITE_APP_NAME=Dialogos
VITE_VERSION=2.0.0
```

**Backend (.env)**
```bash
NODE_ENV=production
PORT=3000

# Database
DB_HOST=dialogos-db.database.windows.net
DB_NAME=dialogos
DB_USER=dbadmin
DB_PASS=****** # Stored in Azure Key Vault

# JWT
JWT_SECRET=****** # 256-bit random string
JWT_EXPIRY=7d

# Gemini API
GEMINI_API_KEY=****** # From Google AI Studio

# CORS
ALLOWED_ORIGINS=https://dialogos.vercel.app

# Rate Limiting
RATE_LIMIT_TESTS_PER_DAY=20
RATE_LIMIT_LOGIN_PER_MINUTE=5
```

---

## 🧪 Testing Strategy

### Testing Pyramid

```
                    ┌──────────────┐
                    │   E2E Tests  │ (5%)
                    │   Playwright │ 
                    └──────────────┘
                          ↑
                ┌────────────────────┐
                │  Integration Tests │ (15%)
                │  API + DB          │
                └────────────────────┘
                          ↑
           ┌──────────────────────────────┐
           │      Unit Tests              │ (80%)
           │  Components, Services, Utils │
           └──────────────────────────────┘
```

### Test Coverage Plan

**Frontend Tests (Jest + React Testing Library)**
```javascript
// components/__tests__/QuestionCard.test.jsx
describe('QuestionCard', () => {
  it('renders question text correctly', () => {
    render(<QuestionCard question="What is 2+2?" />)
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })
  
  it('handles answer selection', () => {
    const onAnswer = jest.fn()
    render(<QuestionCard onAnswer={onAnswer} />)
    fireEvent.click(screen.getByText('A'))
    expect(onAnswer).toHaveBeenCalledWith('A')
  })
})
```

**Backend Tests (Jest + Supertest)**
```javascript
// routes/__tests__/tests.test.js
describe('POST /api/tests/generate', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/tests/generate')
      .send({ subject: 'Math', difficulty: 3 })
    
    expect(res.status).toBe(401)
  })
  
  it('generates test successfully', async () => {
    const token = generateTestToken()
    const res = await request(app)
      .post('/api/tests/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Math', difficulty: 3, numQuestions: 10 })
    
    expect(res.status).toBe(200)
    expect(res.body.questions).toHaveLength(10)
  })
})
```

**E2E Tests (Playwright)**
```javascript
// e2e/test-flow.spec.js
test('complete test flow', async ({ page }) => {
  // Login
  await page.goto('https://dialogos.vercel.app/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Generate test
  await page.click('text=New Test')
  await page.selectOption('select[name="subject"]', 'Math')
  await page.selectOption('select[name="difficulty"]', '3')
  await page.click('text=Generate Test')
  
  // Wait for questions (max 5s)
  await page.waitForSelector('text=Question 1 of 10', { timeout: 5000 })
  
  // Answer all questions
  for (let i = 0; i < 10; i++) {
    await page.click('input[type="radio"]')
    await page.click('text=Next')
  }
  
  // Submit and verify results
  await page.click('text=Submit Test')
  await expect(page.locator('text=/\\d+ out of 10/')).toBeVisible()
})
```

---

## 📊 Monitoring & Observability

### Logging Strategy

**Log Levels:**
- **ERROR:** Application crashes, API failures
- **WARN:** Slow queries (>100ms), rate limit hits
- **INFO:** User actions, API calls, deployments
- **DEBUG:** Detailed request/response data (dev only)

**Winston Configuration:**
```javascript
// config/logger.js
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dialogos-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // Write errors to error.log
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
})

module.exports = logger
```

### Metrics to Track

**Application Metrics:**
```javascript
// Track in every API call
{
  timestamp: '2025-11-07T10:30:00Z',
  endpoint: '/api/tests/generate',
  method: 'POST',
  userId: 123,
  statusCode: 200,
  latency_ms: 4200,
  gemini_tokens: 2500,
  gemini_cost_usd: 0.003,
  db_query_time_ms: 80
}
```

**Business Metrics:**
- Tests generated per day
- Average user accuracy
- Most difficult topics
- User retention (7-day, 30-day)
- Test completion rate

### Alerting Rules (Week 8)

| Alert | Condition | Action |
|-------|-----------|--------|
| High Latency | P95 > 5s for 5 min | Email team |
| API Errors | >10 errors/min | Email + Slack |
| Cost Overrun | Daily cost > $10 | Email + pause service |
| Database Down | Connection fails | Email + SMS |
| Disk Space | >80% full | Email team |

---

## 🔧 Technical Debt & Future Improvements

### Known Technical Debt (Week 4)

| Debt Item | Impact | Priority | Planned Fix |
|-----------|--------|----------|-------------|
| No caching layer | High latency | HIGH | Week 6: Redis |
| Hardcoded prompts | Hard to A/B test | MEDIUM | Week 6: Config file |
| No automated tests | Breaking changes ship | HIGH | Week 6: Jest setup |
| No monitoring | Can't debug prod | HIGH | Week 8: Azure Insights |
| No database backups | Data loss risk | MEDIUM | Week 7: Auto backups |
| No rate limiting | API abuse possible | CRITICAL | Week 5: Express limiter |

### Future Enhancements (Post-Course)

**Phase 2 (Weeks 16-20):**
- Mobile app (React Native)
- Collaborative study groups
- Teacher dashboard
- Question flagging/reporting
- Advanced analytics

**Phase 3 (Weeks 21+):**
- Subject expansion (Physics, Chemistry)
- Video explanations
- Spaced repetition algorithm
- Competition leaderboards
- Premium features

---

## 📚 Architecture Decision Records (ADRs)

### ADR-001: React vs Vue for Frontend

**Context:** Need to choose frontend framework  
**Decision:** Use React 18  
**Rationale:**
- All team members know React from previous courses
- Larger ecosystem (Chart.js, Tailwind work well)
- Better job market skills

**Consequences:**
- ✅ Faster development (no learning curve)
- ✅ More Stack Overflow answers
- ❌ Larger bundle size than Vue/Svelte
- ❌ More boilerplate code

---

### ADR-002: Express vs FastAPI for Backend

**Context:** Need to choose backend framework  
**Decision:** Use Express (Node.js)  
**Rationale:**
- Team comfortable with JavaScript
- Sequelize ORM supports MSSQL well
- Easier to share code/types with frontend

**Consequences:**
- ✅ Single language across stack
- ✅ Faster prototyping
- ❌ Less structured than FastAPI
- ❌ No native async/await for DB (but Sequelize handles it)

---

### ADR-003: Gemini vs GPT-4 for AI

**Context:** Need cost-effective AI for question generation  
**Decision:** Use Gemini 1.5 (Flash + Pro hybrid)  
**Rationale:**
- 10-20x cheaper than GPT-4
- Structured output support
- Good quality for educational content

**Consequences:**
- ✅ 90% cost savings
- ✅ Meets quality requirements
- ❌ Less community support
- ❌ Newer API, less stable

---

### ADR-004: MSSQL vs PostgreSQL for Database

**Context:** Need reliable relational database  
**Decision:** Use MSSQL on Azure  
**Rationale:**
- Team has MSSQL experience
- Free Azure student credits available
- Good Azure ecosystem integration

**Consequences:**
- ✅ Familiar to team (faster development)
- ✅ Free for entire semester
- ❌ Azure vendor lock-in
- ❌ Fewer advanced features than PostgreSQL

---

## 🔄 Changes from Week 2 Architecture

| Component | Week 2 | Week 4 | Reason |
|-----------|--------|--------|--------|
| Frontend Host | Azure Static Web Apps | Vercel | Better DX, faster deploys |
| AI Strategy | Single model (Pro) | Hybrid (80% Flash, 20% Pro) | Cost optimization |
| Deployment | Week 4 | Week 5 | Prioritize core features first |
| Prompt Design | Simple | Context-aware with performance | Better personalization |
| Latency Target | Not specified | <3s (P95) | User research findings |

---

## ✅ Architecture Review Checklist

### Completeness
- [x] All components documented
- [x] Data flows clearly shown
- [x] Technology versions specified
- [x] API endpoints documented
- [x] Database schema complete
- [x] Security layers defined

### Performance
- [x] Latency targets defined
- [x] Bottlenecks identified
- [x] Optimization plan created
- [x] Cost analysis included
- [x] Scalability considered

### Security
- [x] Authentication strategy
- [x] Authorization approach
- [x] Data encryption
- [x] API key management
- [x] Threat model documented

### Operations
- [x] Deployment process defined
- [x] Monitoring strategy planned
- [x] Logging approach documented
- [x] Error handling considered
- [x] Backup plan exists

### Quality
- [x] Testing strategy defined
- [x] Technical debt tracked
- [x] Future improvements planned
- [x] ADRs documented
- [x] Changes from Week 2 noted

---

**Document Version:** 2.0  
**Last Updated:** November 7, 2025  
**Next Review:** Week 7 (after user testing)  
**Status:** ✅ Ready for Design Review