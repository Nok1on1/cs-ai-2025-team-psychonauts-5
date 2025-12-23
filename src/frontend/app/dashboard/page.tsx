"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AccuracyChart } from "@/components/accuracy-chart"
import { TopicPerformanceChart } from "@/components/topic-performance-chart"
import { mockApi } from "@/lib/mock-api"
import { useAuthStore } from "@/lib/auth-store"
import { Loader2, TrendingUp, Target, BookOpen, Plus } from "lucide-react"

interface DashboardData {
  user: {
    name: string
    totalTests: number
    averageAccuracy: number
  }
  accuracyTrend: Array<{ date: string; accuracy: number }>
  topicPerformance: Array<{ topic: string; accuracy: number; totalQuestions: number }>
  recentTests: Array<{ date: string; subject: string; score: string; difficulty: number }>
}

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const handleNewTest = () => {
    console.log("[v0] Dashboard - New Test button clicked")
    console.log("[v0] Dashboard - Navigating to /test/new")
    router.push("/test/new")
    console.log("[v0] Dashboard - router.push called")
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const dashboardData = await mockApi.getDashboard(user.id)
        setData(dashboardData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
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

  if (!data) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
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
                <CardTitle className="text-sm font-medium">Improvement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+8%</div>
                <p className="text-xs text-muted-foreground mt-1">From last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trend</CardTitle>
                <CardDescription>Your performance over the last 10 tests</CardDescription>
              </CardHeader>
              <CardContent>
                <AccuracyChart data={data.accuracyTrend} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topic Performance</CardTitle>
                <CardDescription>How you're doing in different topics</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicPerformanceChart data={data.topicPerformance} />
              </CardContent>
            </Card>
          </div>

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
                          <p className="text-xs text-muted-foreground">Difficulty {test.difficulty}/5</p>
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
