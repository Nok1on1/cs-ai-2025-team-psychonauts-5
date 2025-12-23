// Mock API implementation with realistic delays
import { mockDatabase } from "./mock-database"

// Utility function to simulate network delay
const delay = (min: number, max: number) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min))

export interface User {
  id: string
  email: string
  name: string
  role: "student" | "admin"
}

export interface Question {
  question: string
  options: string[]
  correct_answer: string
  topic: string
  explanation: string
  source_document: string
  source_page: number
  questionNumber: number
}

export interface TestConfig {
  subject: "Math" | "English" | "Georgian"
  difficulty: number // 1-5
  numQuestions: 5 | 10 | 15 | 20
}

export interface TestResult {
  questionIndex: number
  correct: boolean
  userAnswer: string
  correctAnswer: string
  socraticFeedback: string
  fullExplanation: string
  source: {
    document: string
    page: number
  }
}

// Mock API functions
export const mockApi = {
  // Authentication
  async login(email: string, password: string) {
    await delay(500, 800)

    const user = mockDatabase.users.find((u) => u.email === email)
    if (!user || (password !== "password123" && password !== "admin123")) {
      throw new Error("Invalid credentials")
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: `mock_jwt_token_${user.id}`,
    }
  },

  async signup(email: string, name: string, password: string) {
    await delay(500, 800)

    if (mockDatabase.users.find((u) => u.email === email)) {
      throw new Error("Email already exists")
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      role: "student" as const,
    }

    mockDatabase.users.push(newUser)

    return {
      success: true,
      user: newUser,
      token: `mock_jwt_token_${newUser.id}`,
    }
  },

  // Test generation
  async generateTest(userId: string, config: TestConfig) {
    await delay(2000, 3000) // Simulate RAG processing

    const test = mockDatabase.generateTest(userId, config)
    return test
  },

  // Test submission
  async submitTest(testId: string, answers: Array<{ questionIndex: number; userAnswer: string }>) {
    await delay(1000, 2000)

    const test = mockDatabase.tests.find((t) => t.testId === testId)
    if (!test) {
      throw new Error("Test not found")
    }

    const results = mockDatabase.gradeTest(testId, answers)
    return results
  },

  // Dashboard data
  async getDashboard(userId: string) {
    await delay(500, 800)

    return mockDatabase.getDashboardData(userId)
  },

  // Admin: Document upload
  async uploadDocument(file: File, metadata: { subject: string; topic: string; grade_level: number; source: string }) {
    await delay(3000, 4000) // Simulate processing

    const doc = mockDatabase.addDocument(file.name, metadata)
    return doc
  },

  // Admin: Get documents
  async getDocuments() {
    await delay(500, 800)

    return {
      documents: mockDatabase.documents,
    }
  },
}
