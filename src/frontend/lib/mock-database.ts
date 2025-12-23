// Mock database with realistic data generation
import type { TestConfig, Question, TestResult } from "./mock-api"

interface MockUser {
  id: string
  email: string
  name: string
  role: "student" | "admin"
}

interface MockTest {
  testId: string
  userId: string
  subject: string
  difficulty: number
  questions: Question[]
  createdAt: Date
}

interface MockDocument {
  id: string
  filename: string
  subject: string
  topic: string
  chunks: number
  upload_date: string
}

// Sample question banks
const mathQuestions = [
  {
    question: "Solve for x: 2x² - 5x + 2 = 0",
    options: ["A) x = 1/2 or x = 2", "B) x = 1 or x = 2", "C) x = 1/2 or x = 1", "D) x = 2 or x = 3"],
    correct_answer: "A",
    topic: "Quadratic Equations",
    explanation:
      "Using the quadratic formula: x = [-b ± √(b²-4ac)] / 2a. Here a=2, b=-5, c=2. x = [5 ± √(25-16)] / 4 = [5 ± 3] / 4, giving x = 2 or x = 1/2.",
    source_document: "math_algebra_grade12.pdf",
    source_page: 47,
  },
  {
    question: "What is the derivative of f(x) = 3x³ - 2x + 5?",
    options: ["A) 9x² - 2", "B) 6x² - 2", "C) 9x² + 2", "D) 3x² - 2"],
    correct_answer: "A",
    topic: "Calculus - Derivatives",
    explanation: "Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹. The derivative is 9x² - 2.",
    source_document: "math_calculus_grade12.pdf",
    source_page: 23,
  },
  {
    question:
      "In a right triangle, if one angle is 30° and the hypotenuse is 10, what is the length of the side opposite to the 30° angle?",
    options: ["A) 5", "B) 5√3", "C) 10", "D) 10√3"],
    correct_answer: "A",
    topic: "Geometry - Trigonometry",
    explanation: "In a 30-60-90 triangle, the side opposite to 30° is half the hypotenuse. Therefore, 10/2 = 5.",
    source_document: "math_geometry_grade11.pdf",
    source_page: 89,
  },
  {
    question: "Simplify: (x² - 9) / (x - 3)",
    options: ["A) x + 3", "B) x - 3", "C) x² + 3", "D) Cannot be simplified"],
    correct_answer: "A",
    topic: "Algebra - Factoring",
    explanation: "Factor the numerator: x² - 9 = (x+3)(x-3). Cancel (x-3) to get x + 3.",
    source_document: "math_algebra_grade10.pdf",
    source_page: 34,
  },
  {
    question: "What is the area of a circle with radius 7?",
    options: ["A) 49π", "B) 14π", "C) 7π", "D) 98π"],
    correct_answer: "A",
    topic: "Geometry - Circles",
    explanation: "Area of a circle = πr². Therefore, π(7)² = 49π.",
    source_document: "math_geometry_grade9.pdf",
    source_page: 56,
  },
]

const englishQuestions = [
  {
    question: "Which sentence is grammatically correct?",
    options: [
      "A) She don't like coffee",
      "B) She doesn't likes coffee",
      "C) She doesn't like coffee",
      "D) She not like coffee",
    ],
    correct_answer: "C",
    topic: "Grammar - Subject-Verb Agreement",
    explanation: "With third-person singular subjects, use 'doesn't' + base verb form.",
    source_document: "english_grammar_guide.pdf",
    source_page: 12,
  },
  {
    question: "What is the main theme of Shakespeare's 'Romeo and Juliet'?",
    options: ["A) Revenge", "B) Love conquers all", "C) The destructiveness of feuds", "D) Political ambition"],
    correct_answer: "C",
    topic: "Literature - Shakespeare",
    explanation: "While love is central, the play primarily explores how family feuds destroy lives.",
    source_document: "english_literature_classics.pdf",
    source_page: 78,
  },
  {
    question: "Identify the metaphor in: 'Time is a thief'",
    options: ["A) Time", "B) Thief", "C) Time is a thief", "D) There is no metaphor"],
    correct_answer: "C",
    topic: "Literature - Figurative Language",
    explanation: "The entire phrase is a metaphor comparing time to a thief.",
    source_document: "english_literary_devices.pdf",
    source_page: 34,
  },
  {
    question: "What is the past participle of 'swim'?",
    options: ["A) Swam", "B) Swum", "C) Swimming", "D) Swimmed"],
    correct_answer: "B",
    topic: "Grammar - Irregular Verbs",
    explanation: "The past participle of swim is 'swum' (have swum).",
    source_document: "english_grammar_guide.pdf",
    source_page: 56,
  },
  {
    question: "Which punctuation mark is used to join two independent clauses?",
    options: ["A) Comma", "B) Semicolon", "C) Colon", "D) Dash"],
    correct_answer: "B",
    topic: "Grammar - Punctuation",
    explanation: "A semicolon connects two related independent clauses.",
    source_document: "english_punctuation_rules.pdf",
    source_page: 23,
  },
]

const georgianQuestions = [
  {
    question: "რომელია სწორი წინადადება?",
    options: ["მე წავედი სახლში", "მე წავიდა სახლში", "მე წავალ სახლში", "მე წასვლა სახლში"],
    correct_answer: "A",
    topic: "Grammar - Verb Conjugation",
    explanation: "Past tense first person: 'მე წავედი' is correct.",
    source_document: "georgian_grammar_guide.pdf",
    source_page: 45,
  },
  {
    question: "რა არის მეტაფორა?",
    options: [
      "სიტყვების პირდაპირი მნიშვნელობა",
      "გადატანითი მნიშვნელობა",
      "სინონიმების გამოყენება",
      "პირდაპირი შედარება",
    ],
    correct_answer: "B",
    topic: "Literature - Figurative Language",
    explanation: "მეტაფორა არის გადატანითი მნიშვნელობით გამოყენებული სიტყვა ან გამოთქმა.",
    source_document: "georgian_literature_guide.pdf",
    source_page: 67,
  },
  {
    question: "რომელია სწორი ორთოგრაფია?",
    options: ["კომპიუტერი", "კომპიუტერი", "კომპიუტერ", "კომპიუტერ"],
    correct_answer: "A",
    topic: "Spelling - Foreign Words",
    explanation: "კომპიუტერი - სწორი ქართული ორთოგრაფია.",
    source_document: "georgian_spelling_rules.pdf",
    source_page: 89,
  },
  {
    question: "რა არის ზმნის საფუძველი?",
    options: ["ზმნის ფორმა", "ზმნის უცვლელი ნაწილი", "ზმნის დრო", "ზმნის კილო"],
    correct_answer: "B",
    topic: "Grammar - Verb Structure",
    explanation: "ზმნის საფუძველი არის ზმნის უცვლელი ნაწილი, რომელსაც ემატება დაბოლოებები.",
    source_document: "georgian_grammar_verbs.pdf",
    source_page: 34,
  },
  {
    question: "რომელია სახელის მრავლობითი რიცხვი სიტყვისთვის 'წიგნი'?",
    options: ["წიგნები", "წიგნი", "წიგნებმა", "წიგნის"],
    correct_answer: "A",
    topic: "Grammar - Noun Plurals",
    explanation: "სახელის მრავლობითი რიცხვი: წიგნი → წიგნები.",
    source_document: "georgian_grammar_nouns.pdf",
    source_page: 12,
  },
  {
    question: "რომელი არის ეპითეტი?",
    options: ["სახელის განსაზღვრება", "გამომსახველობითი შედარება", "მხატვრული განსაზღვრება", "ზმნის დამხმარე ფორმა"],
    correct_answer: "C",
    topic: "Literature - Literary Devices",
    explanation: "ეპითეტი არის მხატვრული განსაზღვრება, რომელიც ზრდის გამოხატულების ემოციურობას.",
    source_document: "georgian_literary_devices.pdf",
    source_page: 45,
  },
  {
    question: "რომელი არის სწორი ბრუნვა? 'ბავშვი_____ წიგნი აქვს'",
    options: ["ს", "ის", "ში", "მა"],
    correct_answer: "A",
    topic: "Grammar - Cases",
    explanation: "ნათესაობითი ბრუნვა: ბავშვი → ბავშვის. სწორია 'ბავშვს წიგნი აქვს'.",
    source_document: "georgian_grammar_cases.pdf",
    source_page: 28,
  },
]

class MockDatabase {
  users: MockUser[] = [
    { id: "user_123", email: "student@example.com", name: "John Student", role: "student" },
    { id: "admin_123", email: "admin@example.com", name: "Admin User", role: "admin" },
  ]

  tests: MockTest[] = []

  documents: MockDocument[] = [
    {
      id: "doc_001",
      filename: "math_algebra_grade12.pdf",
      subject: "Math",
      topic: "Algebra",
      chunks: 145,
      upload_date: "2025-11-01",
    },
    {
      id: "doc_002",
      filename: "english_grammar_guide.pdf",
      subject: "English",
      topic: "Grammar",
      chunks: 89,
      upload_date: "2025-11-03",
    },
  ]

  generateTest(userId: string, config: TestConfig) {
    let questionBank: any[]

    switch (config.subject) {
      case "Math":
        questionBank = mathQuestions
        break
      case "English":
        questionBank = englishQuestions
        break
      case "Georgian":
        questionBank = georgianQuestions
        break
    }

    // Select random questions
    const selectedQuestions = []
    const numQuestions = Math.min(config.numQuestions, questionBank.length)
    const usedIndices = new Set<number>()

    while (selectedQuestions.length < numQuestions) {
      const idx = Math.floor(Math.random() * questionBank.length)
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx)
        selectedQuestions.push({
          ...questionBank[idx],
          questionNumber: selectedQuestions.length + 1,
        })
      }
    }

    const testId = `test_${Date.now()}`
    const test: MockTest = {
      testId,
      userId,
      subject: config.subject,
      difficulty: config.difficulty,
      questions: selectedQuestions as Question[],
      createdAt: new Date(),
    }

    this.tests.push(test)

    return {
      testId,
      questions: selectedQuestions,
    }
  }

  gradeTest(testId: string, answers: Array<{ questionIndex: number; userAnswer: string }>) {
    const test = this.tests.find((t) => t.testId === testId)
    if (!test) throw new Error("Test not found")

    const results: TestResult[] = []
    let correct = 0

    test.questions.forEach((question, index) => {
      const userAnswer = answers.find((a) => a.questionIndex === index)?.userAnswer || ""
      const isCorrect = userAnswer === question.correct_answer

      if (isCorrect) correct++

      results.push({
        questionIndex: index,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correct_answer,
        socraticFeedback: isCorrect
          ? "Great job! You understood this concept well."
          : `Think about ${question.topic}. What key principles apply here? Review the explanation and try to understand the reasoning.`,
        fullExplanation: question.explanation,
        source: {
          document: question.source_document,
          page: question.source_page,
        },
      })
    })

    const accuracy = Math.round((correct / test.questions.length) * 100)

    return {
      score: `${correct}/${test.questions.length}`,
      accuracy,
      results,
      recommendations: {
        nextDifficulty: accuracy >= 80 ? test.difficulty + 1 : accuracy < 60 ? test.difficulty - 1 : test.difficulty,
        weakTopics: results.filter((r) => !r.correct).map((r) => test.questions[r.questionIndex].topic),
        studyMaterials: [`Review ${test.subject} materials on weak topics`],
      },
    }
  }

  getDashboardData(userId: string) {
    const userTests = this.tests.filter((t) => t.userId === userId)

    // Generate mock trend data
    const accuracyTrend = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      accuracy: 55 + Math.random() * 30, // Random between 55-85
    }))

    return {
      user: {
        name: this.users.find((u) => u.id === userId)?.name || "Student",
        totalTests: userTests.length,
        averageAccuracy: 72,
      },
      accuracyTrend,
      topicPerformance: [
        { topic: "Quadratic Equations", accuracy: 48, totalQuestions: 25 },
        { topic: "Geometry", accuracy: 78, totalQuestions: 15 },
        { topic: "Calculus", accuracy: 65, totalQuestions: 20 },
      ],
      recentTests: userTests.slice(-5).map((t) => ({
        date: t.createdAt.toISOString().split("T")[0],
        subject: t.subject,
        score: "7/10",
        difficulty: t.difficulty,
      })),
    }
  }

  addDocument(filename: string, metadata: any) {
    const doc: MockDocument = {
      id: `doc_${Date.now()}`,
      filename,
      subject: metadata.subject,
      topic: metadata.topic,
      chunks: Math.floor(Math.random() * 100) + 50,
      upload_date: new Date().toISOString().split("T")[0],
    }

    this.documents.push(doc)

    return {
      documentId: doc.id,
      filename: doc.filename,
      chunksCreated: doc.chunks,
      message: "Document processed successfully",
    }
  }
}

export const mockDatabase = new MockDatabase()
