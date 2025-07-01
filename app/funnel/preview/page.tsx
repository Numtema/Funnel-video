"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FunnelStepRenderer } from "@/components/funnel-step-renderer"

const defaultFunnel = {
  title: "Questionnaire Démo",
  description: "Un exemple de funnel interactif avec médias",
  theme: {
    colors: {
      primary: "#6366f1",
      secondary: "#f1f5f9",
      accent: "#3b82f6",
    },
  },
  steps: [
    {
      id: "1",
      type: "welcome",
      title: "Bienvenue dans notre Funnel !",
      content: "Découvrez une expérience interactive unique",
      media: {
        type: "video",
        url: "/placeholder.mp4", // Remplacez par votre URL
      },
      buttonText: "Commencer l'expérience",
    },
    {
      id: "2",
      type: "choice",
      title: "Votre Secteur d'Activité",
      content: "Dans quel domaine travaillez-vous ?",
      options: ["Technologie", "Santé", "Finance", "Éducation", "Marketing", "Autre"],
      media: {
        type: "image",
        url: "/placeholder.svg?height=600&width=800",
      },
    },
    {
      id: "3",
      type: "text",
      title: "Parlez-nous de vous",
      content: "Décrivez votre expérience ou enregistrez un message",
      media: {
        type: "audio",
        url: "/placeholder.mp3", // Remplacez par votre URL
      },
    },
    {
      id: "4",
      type: "rating",
      title: "Évaluez notre Service",
      content: "Comment noteriez-vous votre expérience jusqu'à présent ?",
      media: {
        type: "video",
        url: "/placeholder.mp4",
      },
    },
    {
      id: "5",
      type: "lead_capture",
      title: "Restons en Contact",
      content: "Laissez-nous vos coordonnées pour recevoir vos résultats personnalisés",
      media: {
        type: "image",
        url: "/placeholder.svg?height=600&width=800",
      },
    },
    {
      id: "6",
      type: "thank_you",
      title: "Merci !",
      content: "Vos réponses ont été enregistrées. Nous vous recontacterons bientôt avec vos résultats personnalisés.",
      media: {
        type: "video",
        url: "/placeholder.mp4",
      },
    },
  ],
}

export default function FunnelPreview() {
  const searchParams = useSearchParams()
  const [funnel, setFunnel] = useState(defaultFunnel)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const parsedFunnel = JSON.parse(decodeURIComponent(data))
        setFunnel(parsedFunnel)
      } catch (e) {
        console.error("Erreur parsing funnel data:", e)
      }
    }
  }, [searchParams])

  const handleAnswer = (stepId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [stepId]: answer,
    }))
  }

  const handleNext = () => {
    if (currentStep < funnel.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (contactInfo: any) => {
    console.log("Soumission complète:", { answers, contactInfo })
    setIsSubmitted(true)

    // Ici vous pourriez envoyer les données à votre API
    // fetch('/api/submissions', { method: 'POST', body: JSON.stringify({ answers, contactInfo }) })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-green-800">Merci pour votre participation !</h2>
            <p className="text-gray-600">
              Vos réponses ont été enregistrées avec succès. Nous vous recontacterons bientôt.
            </p>
            <Link href="/">
              <Button className="w-full">Retour au Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepData = funnel.steps[currentStep]

  return (
    <div className="min-h-screen">
      <FunnelStepRenderer
        step={currentStepData}
        stepIndex={currentStep}
        totalSteps={funnel.steps.length}
        answers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
        theme={funnel.theme}
      />
    </div>
  )
}
