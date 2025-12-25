"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AccuracyChart } from "@/components/accuracy-chart"
import { TopicPerformanceChart } from "@/components/topic-performance-chart"
import { useAuthStore } from "@/lib/auth-store"
import { Loader2, TrendingUp, Target, BookOpen, Plus } from "lucide-react"

interface TestHistory {
  _id: string
  email: string
  subject: string
  difficulty: number
  correct: number
  total_questions: number
  scorePercent: number
  createdAt: string
}

interface DashboardData {
  user: {
    name: string
    totalTests: number
    averageAccuracy: number
  }
  accuracyTrend: Array<{ date: string; accuracy: number }>
  topicPerformance: Array<{ topic: string; accuracy: number; totalQuestions: number }>
  recentTests: Array<{ date: string; subject: string; score: string; difficulty: number }>
  improvementPercent: number
}

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleNewTest = () => {
    console.log("[v0] Dashboard - New Test button clicked")
    console.log("[v0] Dashboard - Navigating to /test/new")
    router.push("/test/new")
    console.log("[v0] Dashboard - router.push called")
  }

  const calculateDashboardData = (tests: TestHistory[]): DashboardData => {
    if (tests.length === 0) {
      return {
        user: {
          name: user?.name || "Student",
          totalTests: 0,
          averageAccuracy: 0,
        },
        accuracyTrend: [],
        topicPerformance: [],
        recentTests: [],
        improvementPercent: 0,
      }
    }

    // Calculate average accuracy
    const totalAccuracy = tests.reduce((sum, test) => sum + test.scorePercent, 0)
    const averageAccuracy = Math.round(totalAccuracy / tests.length)

    // Calculate accuracy trend (last 10 tests)
    const trendTests = tests.slice(0, 10).reverse()
    const accuracyTrend = trendTests.map((test) => ({
      date: new Date(test.createdAt).toISOString().split("T")[0],
      accuracy: test.scorePercent,
    }))

    // Calculate topic performance
    const topicMap = new Map<string, { totalCorrect: number; totalQuestions: number }>()
    
    tests.forEach((test) => {
      const existing = topicMap.get(test.subject) || { totalCorrect: 0, totalQuestions: 0 }
      topicMap.set(test.subject, {
        totalCorrect: existing.totalCorrect + test.correct,
        totalQuestions: existing.totalQuestions + test.total_questions,
      })
    })

    const topicPerformance = Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.totalCorrect / stats.totalQuestions) * 100),
      totalQuestions: stats.totalQuestions,
    }))

    // Calculate improvement (compare last 3 tests vs previous 3 tests)
    let improvementPercent = 0
    if (tests.length >= 6) {
      const recentThree = tests.slice(0, 3)
      const previousThree = tests.slice(3, 6)
      
      const recentAvg = recentThree.reduce((sum, t) => sum + t.scorePercent, 0) / 3
      const previousAvg = previousThree.reduce((sum, t) => sum + t.scorePercent, 0) / 3
      
      improvementPercent = Math.round(recentAvg - previousAvg)
    } else if (tests.length >= 2) {
      // If less than 6 tests, compare last test vs average of all previous
      const lastTest = tests[0]
      const previousTests = tests.slice(1)
      const previousAvg = previousTests.reduce((sum, t) => sum + t.scorePercent, 0) / previousTests.length
      
      improvementPercent = Math.round(lastTest.scorePercent - previousAvg)
    }

    // Format recent tests
    const recentTests = tests.slice(0, 5).map((test) => ({
      date: new Date(test.createdAt).toLocaleDateString(),
      subject: test.subject,
      score: `${test.correct}/${test.total_questions}`,
      difficulty: test.difficulty,
    }))

    return {
      user: {
        name: user?.name || "Student",
        totalTests: tests.length,
        averageAccuracy,
      },
      accuracyTrend,
      topicPerformance,
      recentTests,
      improvementPercent,
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch("http://localhost:8000/api/dashboard/recentTests", {
          method: "GET",
          credentials: "include", 
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const tests: TestHistory[] = await response.json()
        const dashboardData = calculateDashboardData(tests)
        setData(dashboardData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !data) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error || "Failed to load dashboard data"}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {data.user.name}!</h1>
              <p className="text-muted-foreground">Track your progress and continue learning</p>
            </div>
            <Button onClick={handleNewTest} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Test
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.user.totalTests}</div>
                <p className="text-xs text-muted-foreground mt-1">Tests completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.user.averageAccuracy}%</div>
                <p className="text-xs text-muted-foreground mt-1">Across all subjects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.improvementPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {data.improvementPercent >= 0 ? "+" : ""}{data.improvementPercent}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.user.totalTests < 2 ? "Complete more tests" : "vs previous average"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {data.accuracyTrend.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Trend</CardTitle>
                  <CardDescription>Your performance over recent tests</CardDescription>
                </CardHeader>
                <CardContent>
                  <AccuracyChart data={data.accuracyTrend} />
                </CardContent>
              </Card>

              {data.topicPerformance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Topic Performance</CardTitle>
                    <CardDescription>How you're doing in different topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopicPerformanceChart data={data.topicPerformance} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
              <CardDescription>Your latest test results</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentTests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tests yet. Take your first test to see results here!</p>
                  <Button onClick={handleNewTest} className="mt-4">
                    Start Learning
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentTests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{test.subject}</p>
                        <p className="text-sm text-muted-foreground">{test.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{test.score}</p>
                          <p className="text-xs text-muted-foreground">Difficulty {test.difficulty}/3</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}