"use client"

import type React from "react"

import { useState } from "react"
import type { QuizConfig, Answers, Submission } from "@/lib/types"
import { QuizStepRenderer } from "./quiz-step-renderer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuizPreviewProps {
  quiz: QuizConfig
  onComplete?: (submission: Submission) => void
}

export function QuizPreview({ quiz, onComplete }: QuizPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const handleAnswer = (stepId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [stepId]: answer,
    }))
  }

  const handleNext = (answer?: any) => {
    const currentStep = quiz.steps[currentStepIndex]

    if (answer !== undefined) {
      handleAnswer(currentStep.id, answer)
    }

    if (currentStepIndex < quiz.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSubmit = (contactInfo: any) => {
    const submission: Submission = {
      id: `submission-${Date.now()}`,
      timestamp: Date.now(),
      contactInfo,
      analyzedAnswers: Object.entries(answers).map(([stepId, answer]) => {
        const step = quiz.steps.find((s) => s.id === stepId)
        return {
          questionId: stepId,
          questionText: step?.type === 1 ? (step as any).question : step?.title || "",
          answer,
        }
      }),
    }

    onComplete?.(submission)
    setIsCompleted(true)
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Merci !</h2>
            <p className="text-gray-600 mb-6">Vos réponses ont été enregistrées avec succès.</p>
            <Button onClick={() => window.location.reload()}>Recommencer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = quiz.steps[currentStepIndex]

  return (
    <div
      style={
        {
          "--theme-bg": quiz.theme.colors.background,
          "--theme-primary": quiz.theme.colors.primary,
          "--theme-accent": quiz.theme.colors.accent,
          "--theme-text": quiz.theme.colors.text,
          "--theme-button-text": quiz.theme.colors.buttonText,
          "--theme-font": quiz.theme.font,
        } as React.CSSProperties
      }
    >
      <QuizStepRenderer
        step={currentStep}
        stepIndex={currentStepIndex}
        totalSteps={quiz.steps.length}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
