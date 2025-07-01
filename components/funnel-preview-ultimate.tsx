"use client"

import { useState } from "react"
import type { Funnel } from "@/lib/types"
import { FunnelStepRenderer } from "./funnel-step-renderer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FunnelPreviewUltimateProps {
  funnel: Funnel
}

export function FunnelPreviewUltimate({ funnel }: FunnelPreviewUltimateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const handleAnswer = (stepId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [stepId]: answer,
    }))
  }

  const handleNext = (answer?: any) => {
    const currentStepId = funnel.steps[currentStepIndex].id
    // Enregistre la réponse même si elle est vide (ex: simple clic sur "suivant")
    handleAnswer(currentStepId, answer)

    if (currentStepIndex < funnel.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      handleSubmit({ ...answers, [currentStepId]: answer })
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSubmit = (finalAnswers: Record<string, any>) => {
    console.log("Funnel soumis avec les réponses:", finalAnswers)
    setIsCompleted(true)
  }

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-lg text-center p-8">
          <CardContent>
            <h2 className="text-3xl font-bold mb-4">Merci !</h2>
            <p className="text-muted-foreground mb-6">Vos réponses ont été enregistrées.</p>
            <Link href="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepData = funnel.steps[currentStepIndex]

  return (
    <FunnelStepRenderer
      key={currentStepData.id}
      step={currentStepData}
      stepIndex={currentStepIndex}
      totalSteps={funnel.steps.length}
      answers={answers}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      theme={funnel.theme}
    />
  )
}
