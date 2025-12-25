"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE_URL = "http://localhost:8000"

interface Question {
  id: string
  text: string
  choices: string[]
  correct_index: number
  subject: string
  difficulty: number
  topic?: string
  source_document?: string
  source_page?: number
}

interface TestSession {
  session_id: string
  questions: Question[]
  expires: number
}

export default function TestPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // Store as index (0-3)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testMetadata, setTestMetadata] = useState<{ subject: string; difficulty: number } | null>(null)

  useEffect(() => {
    // Load test data from sessionStorage
    const loadTestData = () => {
      try {
        const storedData = sessionStorage.getItem(`test_${sessionId}`)
        
        if (!storedData) {
          throw new Error("Test session not found. Please generate a new test.")
        }

        const testData = JSON.parse(storedData)
        
        if (!testData.questions || testData.questions.length === 0) {
          throw new Error("No questions found in test session")
        }

        // Check if test has expired
        if (testData.expires && Date.now() > testData.expires) {
          throw new Error("This test session has expired. Please generate a new test.")
        }

        setQuestions(testData.questions)
        
        // Extract metadata
        setTestMetadata({
          subject: testData.subject,
          difficulty: testData.difficulty,
        })
        
        setLoading(false)
      } catch (err) {
        console.error("Error loading test:", err)
        setError(err instanceof Error ? err.message : "Failed to load test")
        setLoading(false)
      }
    }

    loadTestData()

    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionId])

  const handleSelectAnswer = (choiceIndex: string) => {
    console.log("[v0] Answer selected:", choiceIndex)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: parseInt(choiceIndex),
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const calculateResults = () => {
    let correct = 0
    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      if (userAnswer !== undefined && userAnswer === question.correct_index) {
        correct++
      }
    })
    return correct
  }

  const handleSubmit = async () => {
    if (!testMetadata) return

    setSubmitting(true)

    try {
      const correctAnswers = calculateResults()
      const totalQuestions = questions.length

      console.log("Submitting test:", {
        subject: testMetadata.subject,
        difficulty: testMetadata.difficulty,
        correct: correctAnswers,
        total_questions: totalQuestions,
      })

      const response = await fetch(`${API_BASE_URL}/api/dashboard/insertTest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subject: testMetadata.subject,
          difficulty: testMetadata.difficulty,
          correct: correctAnswers,
          total_questions: totalQuestions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit test")
      }

      const savedHistory = await response.json()
      console.log("Test saved successfully:", savedHistory)

      // Generate Socratic feedback for incorrect answers
      console.log("Generating Socratic feedback for incorrect answers...")
      const resultsWithFeedback = await Promise.all(
        questions.map(async (question, index) => {
          const userAnswerIndex = answers[index]
          const isCorrect = userAnswerIndex !== undefined && userAnswerIndex === question.correct_index
          
          let socraticFeedback = "Great job! You understood this concept well."
          
          // Generate Socratic feedback only for incorrect answers
          if (!isCorrect && userAnswerIndex !== undefined) {
            try {
              console.log(`Generating feedback for question ${index + 1}:`, {
                question_id: question.id,
                selected_index: userAnswerIndex,
              })

              const feedbackResponse = await fetch(`${API_BASE_URL}/api/tests/feedback`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  question: {
                    id: question.id,
                    text: question.text,
                    choices: question.choices,
                    correct_index: question.correct_index,
                    subject: question.subject,
                    difficulty: question.difficulty,
                  },
                  selected_index: userAnswerIndex,
                }),
              })

              console.log(`Feedback response status for question ${index + 1}:`, feedbackResponse.status)

              if (feedbackResponse.ok) {
                const feedbackData = await feedbackResponse.json()
                console.log(`Feedback data for question ${index + 1}:`, feedbackData)
                socraticFeedback = feedbackData
              } else {
                const errorText = await feedbackResponse.text()
                console.error(`Failed to generate feedback for question ${index + 1}. Status: ${feedbackResponse.status}, Response:`, errorText)
                socraticFeedback = "Review the concept and try to understand why this answer is correct."
              }
            } catch (error) {
              console.error(`Error generating feedback for question ${index + 1}:`, error)
              socraticFeedback = "Review the concept and try to understand why this answer is correct."
            }
          }

          return {
            questionIndex: index,
            userAnswer: userAnswerIndex !== undefined ? question.choices[userAnswerIndex] : "",
            correctAnswer: question.choices[question.correct_index],
            correct: isCorrect,
            socraticFeedback: socraticFeedback,
            source: {
              document: question.source_document || "Curriculum materials",
              page: question.source_page || 0,
            },
          }
        })
      )

      console.log("All feedback generated, storing results...")


      // Store results for the results page
      const results = {
        score: `${correctAnswers}/${totalQuestions}`,
        accuracy: savedHistory.scorePercent,
        results: resultsWithFeedback,
        recommendations: {
          nextDifficulty: savedHistory.scorePercent >= 80 ? testMetadata.difficulty + 1 : testMetadata.difficulty,
          weakTopics: questions
            .filter((q, i) => answers[i] === undefined || answers[i] !== q.correct_index)
            .map(q => q.topic || testMetadata.subject)
            .filter((topic, index, self) => self.indexOf(topic) === index)
            .slice(0, 3),
          studyMaterials: [],
        },
      }

      localStorage.setItem(`test_results_${sessionId}`, JSON.stringify(results))
      router.push(`/test/${sessionId}/results`)
    } catch (error) {
      console.error("Failed to submit test:", error)
      alert(error instanceof Error ? error.message : "Failed to submit test. Please try again.")
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading test...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => router.push("/dashboard")} className="w-full mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header with Progress */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{currentQuestion.topic || currentQuestion.subject}</Badge>
                    {answers[currentQuestionIndex] !== undefined && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
                </div>
                {currentQuestion.source_document && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">
                      {currentQuestion.source_document}
                      {currentQuestion.source_page && `, p.${currentQuestion.source_page}`}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Content */}
        <div className="container px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{currentQuestion.topic || currentQuestion.subject}</Badge>
                      {answers[currentQuestionIndex] !== undefined && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
                    <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
                  </div>
                  {currentQuestion.source_document && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">
                        {currentQuestion.source_document}
                        {currentQuestion.source_page && `, p.${currentQuestion.source_page}`}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={answers[currentQuestionIndex]?.toString() || ""} 
                  onValueChange={handleSelectAnswer}
                >
                  <div className="space-y-3">
                    {currentQuestion.choices.map((choice, index) => {
                      const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                      return (
                        <div key={index} className="relative">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} className="peer sr-only" />
                          <Label
                            htmlFor={`option-${index}`}
                            className={cn(
                              "flex items-start gap-3 rounded-lg border-2 border-muted bg-card p-4 cursor-pointer transition-all hover:bg-accent/50",
                              "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                            )}
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground shrink-0 mt-0.5">
                              <span className="text-sm font-medium">{optionLetter}</span>
                            </div>
                            <span className="flex-1 leading-relaxed">{choice}</span>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={submitting} size="lg" className="gap-2">
                  {submitting ? "Submitting..." : "Submit Test"}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Question Navigator */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3">Quick Navigation</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={cn(
                        "h-10 w-10 rounded-lg border-2 font-medium text-sm transition-all",
                        currentQuestionIndex === index
                          ? "border-primary bg-primary text-primary-foreground"
                          : answers[index] !== undefined
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-muted hover:border-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}