"use client"
import type { FunnelStep } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { MediaViewer } from "./media-viewer"
import { useState } from "react"

interface FunnelStepRendererProps {
  step: FunnelStep
  stepIndex: number
  totalSteps: number
  answers: Record<string, any>
  onAnswer: (stepId: string, answer: any) => void
  onNext: (answer?: any) => void
  onPrevious: () => void
  onSubmit?: (contactInfo: any) => void
  theme: {
    colors: {
      primary: string
      secondary: string
      accent: string
    }
  }
}

export function FunnelStepRenderer({
  step,
  stepIndex,
  totalSteps,
  answers,
  onAnswer,
  onNext,
  onPrevious,
  onSubmit,
  theme,
}: FunnelStepRendererProps) {
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const currentAnswer = answers && answers[step.id] ? answers[step.id] : ""
  const isFirstStep = stepIndex === 0

  const renderStepContent = () => {
    switch (step.type) {
      case "welcome":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            {step.media?.url && <MediaViewer media={step.media} isWelcomeScreen={true} className="absolute inset-0" />}
            <div className="relative z-10">
              <h1
                className="text-4xl md:text-5xl font-bold text-white mb-12"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
              >
                {step.title}
              </h1>
              <p className="text-xl text-white/90 mb-8" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                {step.content}
              </p>
              <Button
                onClick={() => onNext()}
                size="lg"
                className="text-lg px-8 py-4"
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: theme.colors.primary,
                }}
              >
                {step.buttonText || "Commencer"}
              </Button>
            </div>
          </div>
        )

      case "choice":
        return (
          <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>
                {step.title}
              </h2>
              <p className="text-gray-600 text-lg">{step.content}</p>
            </div>
            <RadioGroup value={currentAnswer} onValueChange={(value) => onAnswer(step.id, value)} className="space-y-3">
              {step.options?.map((option, index) => {
                const optionValue = typeof option === "string" ? option : option.value
                const optionLabel = typeof option === "string" ? option : option.label
                return (
                  <Label
                    key={index}
                    htmlFor={`option-${index}`}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      currentAnswer === optionValue ? "border-primary ring-2 ring-primary" : "hover:bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem value={optionValue} id={`option-${index}`} />
                    <span className="flex-1 text-lg">{optionLabel}</span>
                  </Label>
                )
              })}
            </RadioGroup>
          </div>
        )

      case "lead_capture":
        return (
          <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>
                {step.title}
              </h2>
              <p className="text-gray-600 text-lg">{step.content}</p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Votre nom"
                value={contactInfo.name}
                onChange={(e) => setContactInfo((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="email"
                placeholder="Votre email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="tel"
                placeholder="Votre téléphone (optionnel)"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <Button
                onClick={() => onNext(contactInfo)}
                disabled={!contactInfo.name || !contactInfo.email}
                className="w-full"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {step.buttonText || "Envoyer"}
              </Button>
            </div>
          </div>
        )

      case "thank_you":
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
              {step.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">{step.content}</p>
          </div>
        )

      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
            <p className="text-gray-600">{step.content}</p>
          </div>
        )
    }
  }

  return (
    <div className="relative w-full h-full min-h-screen">
      {step.type !== "welcome" && step.media?.url && (
        <MediaViewer media={step.media} isWelcomeScreen={false} className="absolute inset-0" />
      )}

      <div
        className={`relative z-10 flex flex-col justify-center items-center p-8 md:p-12 min-h-screen ${
          step.type !== "welcome" ? "bg-white/90 backdrop-blur-sm" : ""
        }`}
      >
        {step.type !== "welcome" && (
          <div className="absolute top-4 left-4 right-4 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Étape {stepIndex + 1} sur {totalSteps}
              </span>
              <span>{Math.round(((stepIndex + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: theme.colors.primary,
                  width: `${((stepIndex + 1) / totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="w-full">{renderStepContent()}</div>

        {step.type !== "welcome" && step.type !== "thank_you" && step.type !== "lead_capture" && (
          <div className="absolute bottom-8 left-8 right-8 flex justify-between max-w-md mx-auto">
            <Button variant="outline" onClick={onPrevious} disabled={isFirstStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              onClick={() => onNext(currentAnswer)}
              disabled={step.type === "choice" && !currentAnswer}
              style={{ backgroundColor: theme.colors.primary }}
              className="text-white"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
