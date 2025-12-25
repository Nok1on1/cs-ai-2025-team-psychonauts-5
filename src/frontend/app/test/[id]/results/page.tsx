"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Lightbulb, FileText, TrendingUp, BookOpen, Home } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TestResult {
  questionIndex: number
  userAnswer: string
  correctAnswer: string
  correct: boolean
  socraticFeedback: string
  source: {
    document: string
    page: number
  }
}

interface ResultsData {
  score: string
  accuracy: number
  results: TestResult[]
  recommendations: {
    nextDifficulty: number
    weakTopics: string[]
    studyMaterials: string[]
  }
}

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

interface TestData {
  sessionId: string
  questions: Question[]
  subject: string
  difficulty: number
  expires: number
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params?.id as string

  const [testData, setTestData] = useState<TestData | null>(null)
  const [resultsData, setResultsData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load test data from sessionStorage
    const storedTestData = sessionStorage.getItem(`test_${sessionId}`)
    if (!storedTestData) {
      console.error("Test data not found in sessionStorage")
      router.push("/dashboard")
      return
    }

    const testDataParsed: TestData = JSON.parse(storedTestData)
    setTestData(testDataParsed)

    // Get the graded results from localStorage
    const storedResults = localStorage.getItem(`test_results_${sessionId}`)
    if (!storedResults) {
      console.error("Results not found in localStorage")
      router.push("/dashboard")
      return
    }

    const resultsParsed: ResultsData = JSON.parse(storedResults)
    setResultsData(resultsParsed)
    setLoading(false)
  }, [sessionId, router])

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!resultsData || !testData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const correctCount = resultsData.results.filter((r) => r.correct).length

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Header */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
                  {resultsData.accuracy >= 70 ? (
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  ) : (
                    <TrendingUp className="h-10 w-10 text-orange-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {correctCount} out of {testData.questions.length} correct!
                  </h1>
                  <p className="text-xl text-muted-foreground">{resultsData.accuracy}% accuracy</p>
                </div>
                <Progress value={resultsData.accuracy} className="h-3 max-w-md mx-auto" />
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {testData.subject}
                  </Badge>
                  <Badge variant="outline" className="text-base py-1 px-3">
                    Difficulty Level {testData.difficulty}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {resultsData.recommendations && (
            <Alert className="bg-accent/50 border-accent">
              <Lightbulb className="h-5 w-5" />
              <AlertDescription className="mt-2">
                <p className="font-semibold mb-2">Recommendations for your next study session:</p>
                <ul className="space-y-1 text-sm">
                  {resultsData.accuracy >= 80 ? (
                    <li>Great job! Consider trying a higher difficulty level to challenge yourself.</li>
                  ) : resultsData.accuracy >= 60 ? (
                    <li>You're making progress! Keep practicing at this level to build confidence.</li>
                  ) : (
                    <li>Consider reviewing the fundamentals before taking another test.</li>
                  )}
                  {resultsData.recommendations.weakTopics.length > 0 && (
                    <li>Focus on: {resultsData.recommendations.weakTopics.join(", ")}</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Question Review */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
              <CardDescription>Review each question with detailed feedback and explanations</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {testData.questions.map((question: Question, index: number) => {
                  const result = resultsData.results[index]
                  const isCorrect = result.correct

                  return (
                    <AccordionItem key={index} value={`question-${index}`} className="border rounded-lg mb-3 px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-start gap-3 text-left flex-1">
                          <div className="mt-1">
                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">Question {index + 1}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{question.text}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pb-4">
                        {/* Question */}
                        <div className="space-y-2">
                          <Badge variant="secondary" className="mb-2">
                            {question.topic || question.subject}
                          </Badge>
                          <p className="font-medium leading-relaxed">{question.text}</p>
                        </div>

                        {/* Answer Comparison */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Your Answer</p>
                            <div
                              className={`p-3 rounded-lg border-2 ${
                                isCorrect ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
                              }`}
                            >
                              <p className="text-sm font-medium">{result.userAnswer || "Not answered"}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Correct Answer</p>
                            <div className="p-3 rounded-lg border-2 border-green-600 bg-green-50">
                              <p className="text-sm font-medium">{result.correctAnswer}</p>
                            </div>
                          </div>
                        </div>

                        {/* Feedback */}
                        {!isCorrect && (
                          <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertDescription>
                              <p className="font-semibold text-sm mb-1">Socratic Hint:</p>
                              <p className="text-sm">{result.socraticFeedback}</p>
                            </AlertDescription>
                          </Alert>
                        )}

              
                        {/* Source */}
                        {result.source && result.source.document && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>
                              Source: {result.source.document}
                              {result.source.page > 0 && `, Page ${result.source.page}`}
                            </span>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.push("/test/new")} className="flex-1 gap-2" size="lg">
              <BookOpen className="h-4 w-4" />
              Take Another Test
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1 gap-2" size="lg">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}