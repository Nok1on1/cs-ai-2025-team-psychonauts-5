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
import { mockDatabase } from "@/lib/mock-database"
import type { Question } from "@/lib/mock-api"
import { FileText, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params?.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testMetadata, setTestMetadata] = useState<{ subject: string; difficulty: number } | null>(null)

  useEffect(() => {
    // Load test data
    const test = mockDatabase.tests.find((t) => t.testId === testId)
    if (!test) {
      router.push("/dashboard")
      return
    }

    setQuestions(test.questions)
    setTestMetadata({
      subject: test.subject,
      difficulty: test.difficulty,
    })
    setLoading(false)

    // Start timer
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [testId, router])

  const handleSelectAnswer = (answer: string) => {
    console.log("[v0] Answer selected:", answer)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
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
      if (userAnswer && userAnswer === question.correct_answer) {
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

      const response = await fetch("http://localhost:8000/api/dashboard/insertTest", {
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

      // Store results for the results page in the format it expects
      const results = {
        score: `${correctAnswers}/${totalQuestions}`,
        accuracy: savedHistory.scorePercent,
        results: questions.map((question, index) => {
          const userAnswer = answers[index] || ""
          const isCorrect = userAnswer === question.correct_answer
          
          return {
            questionIndex: index,
            userAnswer: userAnswer,
            correctAnswer: question.correct_answer,
            correct: isCorrect,
            socraticFeedback: question.socratic_feedback || "Review the concept and try to understand why this answer is correct.",
            fullExplanation: question.explanation || "The correct answer demonstrates the key principle of this topic.",
            source: {
              document: question.source_document,
              page: question.source_page,
            },
          }
        }),
        recommendations: {
          nextDifficulty: savedHistory.scorePercent >= 80 ? testMetadata.difficulty + 1 : testMetadata.difficulty,
          weakTopics: questions
            .filter((q, i) => answers[i] !== q.correct_answer)
            .map(q => q.topic)
            .filter((topic, index, self) => self.indexOf(topic) === index)
            .slice(0, 3),
          studyMaterials: [],
        },
      }

      localStorage.setItem(`test_results_${testId}`, JSON.stringify(results))
      router.push(`/test/${testId}/results`)
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
                    <Badge variant="secondary">{currentQuestion.topic}</Badge>
                    {answers[currentQuestionIndex] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">
                    {currentQuestion.source_document}, p.{currentQuestion.source_page}
                  </span>
                </div>
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
                      <Badge variant="secondary">{currentQuestion.topic}</Badge>
                      {answers[currentQuestionIndex] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
                    <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">
                      {currentQuestion.source_document}, p.{currentQuestion.source_page}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers[currentQuestionIndex] || ""} onValueChange={handleSelectAnswer}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                      return (
                        <div key={index} className="relative">
                          <RadioGroupItem value={optionLetter} id={`option-${index}`} className="peer sr-only" />
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
                            <span className="flex-1 leading-relaxed">{option}</span>
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
                          : answers[index]
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