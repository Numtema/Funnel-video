"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuizGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuizGenerator({ open, onOpenChange }: QuizGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    topic: "",
    difficulty: "medium",
    questionCount: "5",
    quizType: "knowledge",
    description: "",
  })

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error("Veuillez spécifier le sujet du quiz")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la génération")
      }

      // Créer le quiz
      const createResponse = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          config: result.config,
          theme: result.theme,
          ai_insights: result.ai_insights,
        }),
      })

      if (!createResponse.ok) {
        const createResult = await createResponse.json()
        throw new Error(createResult.error || "Erreur lors de la création du quiz")
      }

      toast.success("Quiz généré avec succès!")
      onOpenChange(false)

      // Reset form
      setFormData({
        topic: "",
        difficulty: "medium",
        questionCount: "5",
        quizType: "knowledge",
        description: "",
      })

      // Refresh page to show new quiz
      window.location.reload()
    } catch (error) {
      console.error("Error generating quiz:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            Générateur de Quiz IA
          </DialogTitle>
          <DialogDescription>
            Décrivez le sujet de votre quiz et laissez l'IA créer des questions pertinentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Assurez-vous d'avoir configuré votre clé API Gemini dans les{" "}
              <a href="/settings" className="underline font-medium">
                paramètres
              </a>{" "}
              pour utiliser cette fonctionnalité.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="topic">Sujet du quiz *</Label>
            <Input
              id="topic"
              placeholder="Ex: Marketing digital, Histoire de France, etc."
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Niveau de difficulté</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionCount">Nombre de questions</Label>
              <Select
                value={formData.questionCount}
                onValueChange={(value) => setFormData({ ...formData, questionCount: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 questions</SelectItem>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quizType">Type de quiz</Label>
            <Select value={formData.quizType} onValueChange={(value) => setFormData({ ...formData, quizType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge">Quiz de connaissances</SelectItem>
                <SelectItem value="personality">Test de personnalité</SelectItem>
                <SelectItem value="assessment">Évaluation</SelectItem>
                <SelectItem value="survey">Sondage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description additionnelle</Label>
            <Textarea
              id="description"
              placeholder="Ajoutez des détails sur le contexte, l'objectif du quiz, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating || !formData.topic.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Générer le Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
