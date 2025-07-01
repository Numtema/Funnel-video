"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, Play, BarChart3, Users, TrendingUp, LogOut } from "lucide-react"
import Link from "next/link"
import { AIFunnelGenerator } from "@/components/ai-funnel-generator"
import { QuizGenerator } from "@/components/quiz-generator"
import { signout } from "@/app/auth/actions"
import type { Funnel, Quiz, User, DashboardStats } from "@/lib/types"

interface DashboardClientProps {
  user: User
  funnels: Funnel[]
  quiz: Quiz[]
  stats: DashboardStats
}

export function DashboardClient({ user, funnels, quiz, stats }: DashboardClientProps) {
  const [showFunnelGenerator, setShowFunnelGenerator] = useState(false)
  const [showQuizGenerator, setShowQuizGenerator] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">FACEÀFACE</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bonjour, {user.email}</span>
              <form action={signout}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funnels</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnels.length}</div>
              <p className="text-xs text-muted-foreground">
                {funnels.filter((f) => f.status === "active").length} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quiz</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quiz.length}</div>
              <p className="text-xs text-muted-foreground">{quiz.filter((q) => q.status === "active").length} actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soumissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_submissions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.funnel_submissions} funnels, {stats.quiz_submissions} quiz
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button onClick={() => setShowFunnelGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Funnel IA
          </Button>
          <Button variant="outline" onClick={() => setShowQuizGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Quiz IA
          </Button>
        </div>

        {/* Funnels Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Funnels</h2>
          {funnels.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun funnel créé</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier funnel avec l'IA.</p>
              <div className="mt-6">
                <Button onClick={() => setShowFunnelGenerator(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Funnel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funnels.map((funnel) => (
                <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={funnel.status === "active" ? "default" : "secondary"}>{funnel.status}</Badge>
                    </div>
                    <CardTitle className="text-lg">{funnel.title}</CardTitle>
                    <CardDescription>{funnel.description || "Aucune description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <div>Vues: {funnel.views}</div>
                        <div>Conversions: {funnel.conversions}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/funnel/${funnel.id}/preview`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Play className="w-4 h-4 mr-2" />
                            Prévisualiser
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quiz Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Quiz</h2>
          {quiz.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Brain className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun quiz créé</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier quiz avec l'IA.</p>
              <div className="mt-6">
                <Button onClick={() => setShowQuizGenerator(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quiz.map((q) => (
                <Card key={q.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={q.status === "active" ? "default" : "secondary"}>{q.status}</Badge>
                    </div>
                    <CardTitle className="text-lg">{q.title}</CardTitle>
                    <CardDescription>{q.description || "Aucune description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <div>Complétions: {q.completions}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/quiz/${q.id}/preview`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Play className="w-4 h-4 mr-2" />
                            Prévisualiser
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AIFunnelGenerator open={showFunnelGenerator} onOpenChange={setShowFunnelGenerator} />
      <QuizGenerator open={showQuizGenerator} onOpenChange={setShowQuizGenerator} />
    </div>
  )
}
