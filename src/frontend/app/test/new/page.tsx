"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { mockApi } from "@/lib/mock-api"
import { useAuthStore } from "@/lib/auth-store"
import { Loader2, BookOpen, Target, ListOrdered } from "lucide-react"

const SUBJECTS = ["Math", "English", "Georgian"] as const
const QUESTION_COUNTS = [5, 10, 15, 20] as const

const DIFFICULTY_LABELS = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"]
const DIFFICULTY_COLORS = ["text-green-600", "text-green-500", "text-yellow-600", "text-orange-600", "text-red-600"]

export default function NewTestPage() {
  console.log("[v0] NewTestPage component rendering")

  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Math")
  const [difficulty, setDifficulty] = useState<number>(3)
  const [numQuestions, setNumQuestions] = useState<number>(10)
  const [loading, setLoading] = useState(false)

  console.log("[v0] NewTestPage - user:", user)

  const handleGenerateTest = async () => {
    if (!user) return

    setLoading(true)

    try {
      const response = await mockApi.generateTest(user.id, {
        subject,
        difficulty,
        numQuestions: numQuestions as 5 | 10 | 15 | 20,
      })

      router.push(`/test/${response.testId}`)
    } catch (error) {
      console.error("Failed to generate test:", error)
      setLoading(false)
    }
  }

  console.log("[v0] NewTestPage - about to return JSX")

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
            <p className="text-muted-foreground mt-2">
              Configure your personalized test. Our AI will generate questions based on your settings.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Subject Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Label htmlFor="subject" className="text-base font-semibold">
                    Subject
                  </Label>
                </div>
                <Select value={subject} onValueChange={(value) => setSubject(value as typeof subject)}>
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Difficulty Level</Label>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Level {difficulty}</span>
                    <span className={`text-sm font-medium ${DIFFICULTY_COLORS[difficulty - 1]}`}>
                      {DIFFICULTY_LABELS[difficulty - 1]}
                    </span>
                  </div>
                  <Slider
                    value={[difficulty]}
                    onValueChange={(value) => setDifficulty(value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Easier</span>
                    <span>Harder</span>
                  </div>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Number of Questions</Label>
                </div>
                <RadioGroup value={String(numQuestions)} onValueChange={(value) => setNumQuestions(Number(value))}>
                  <div className="grid grid-cols-2 gap-4">
                    {QUESTION_COUNTS.map((count) => (
                      <div key={count} className="relative">
                        <RadioGroupItem value={String(count)} id={`questions-${count}`} className="peer sr-only" />
                        <Label
                          htmlFor={`questions-${count}`}
                          className="flex items-center justify-center rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                        >
                          <span className="text-lg font-semibold">{count} Questions</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Estimated time: {Math.ceil(numQuestions * 1.5)} - {numQuestions * 2} minutes
                </p>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button onClick={handleGenerateTest} disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating your test...
                    </>
                  ) : (
                    "Generate Test"
                  )}
                </Button>
                {loading && (
                  <p className="text-sm text-center text-muted-foreground mt-3">
                    Our AI is finding relevant curriculum materials and creating personalized questions for you...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-accent/50 border-accent">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-semibold">How it works</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Questions are generated from official curriculum materials</li>
                  <li>Difficulty adapts to your performance over time</li>
                  <li>Each question includes detailed explanations and source references</li>
                  <li>Your progress is tracked to identify areas for improvement</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
