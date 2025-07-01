"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Mic, Video } from "lucide-react"
import { type QuizStep, StepType, type Answers } from "@/lib/types"

interface QuizStepRendererProps {
  step: QuizStep
  stepIndex: number
  totalSteps: number
  answers: Answers
  onAnswer: (stepId: string, answer: any) => void
  onNext: (answer?: any) => void
  onPrevious: () => void
  onSubmit?: (data: any) => void
}

export function QuizStepRenderer({
  step,
  stepIndex,
  totalSteps,
  answers,
  onAnswer,
  onNext,
  onPrevious,
  onSubmit,
}: QuizStepRendererProps) {
  const [currentAnswer, setCurrentAnswer] = useState(answers[step.id] || "")
  const [isRecording, setIsRecording] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    subscribed: false,
  })

  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === totalSteps - 1

  const handleAnswerChange = (value: any) => {
    setCurrentAnswer(value)
    onAnswer(step.id, value)
  }

  const renderMedia = () => {
    if (!step.media) return null

    const { type, url } = step.media

    switch (type) {
      case "image":
        return (
          <div className="w-full h-64 mb-6 rounded-lg overflow-hidden">
            <img src={url || "/placeholder.svg"} alt="Step media" className="w-full h-full object-cover" />
          </div>
        )
      case "video":
        return (
          <div className="w-full h-64 mb-6 rounded-lg overflow-hidden">
            <video controls className="w-full h-full object-cover">
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )
      case "audio":
        return (
          <div className="w-full mb-6">
            <audio controls className="w-full">
              <source src={url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )
      default:
        return null
    }
  }

  const renderStepContent = () => {
    switch (step.type) {
      case StepType.Welcome:
        return (
          <div className="text-center space-y-6">
            {renderMedia()}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{step.title}</h1>
            <Button
              onClick={() => onNext()}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3"
            >
              {step.buttonText}
            </Button>
          </div>
        )

      case StepType.Question:
        return (
          <div className="space-y-6">
            {renderMedia()}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{step.question}</h2>

            {step.answerInput.type === "buttons" && step.options && (
              <div className="space-y-3">
                {step.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerChange(option.text)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      currentAnswer === option.text
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {step.answerInput.type === "text" && (
              <Textarea
                placeholder="Tapez votre réponse ici..."
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={4}
              />
            )}

            {step.answerInput.type === "voice" && (
              <div className="text-center">
                <Button
                  onClick={() => setIsRecording(!isRecording)}
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? "Arrêter l'enregistrement" : "Enregistrer une réponse"}
                </Button>
              </div>
            )}

            {step.answerInput.type === "video" && (
              <div className="text-center">
                <Button
                  onClick={() => setIsRecording(!isRecording)}
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {isRecording ? "Arrêter la vidéo" : "Enregistrer une vidéo"}
                </Button>
              </div>
            )}
          </div>
        )

      case StepType.Message:
        return (
          <div className="text-center space-y-6">
            {renderMedia()}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h2>
            <Button
              onClick={() => onNext()}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {step.buttonText}
            </Button>
          </div>
        )

      case StepType.LeadCapture:
        return (
          <div className="space-y-6">
            {renderMedia()}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600 mb-6">{step.subtitle}</p>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={step.namePlaceholder}
                value={contactInfo.name}
                onChange={(e) => setContactInfo((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="email"
                placeholder={step.emailPlaceholder}
                value={contactInfo.email}
                onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="tel"
                placeholder={step.phonePlaceholder}
                value={contactInfo.phone}
                onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscription"
                  checked={contactInfo.subscribed}
                  onCheckedChange={(checked) => setContactInfo((prev) => ({ ...prev, subscribed: checked as boolean }))}
                />
                <label htmlFor="subscription" className="text-sm text-gray-600">
                  {step.subscriptionText}
                </label>
              </div>

              <Button
                onClick={() => onSubmit?.(contactInfo)}
                disabled={!contactInfo.name || !contactInfo.email}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                size="lg"
              >
                {step.buttonText}
              </Button>

              {step.socialLinks && step.socialLinks.length > 0 && (
                <div className="flex justify-center space-x-4 pt-4">
                  {step.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {link.type}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Étape {stepIndex + 1} sur {totalSteps}
            </span>
            <span>{Math.round(((stepIndex + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">{renderStepContent()}</div>

        {/* Navigation */}
        {step.type !== StepType.Welcome && step.type !== StepType.Message && step.type !== StepType.LeadCapture && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onPrevious} disabled={isFirstStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              onClick={() => onNext(currentAnswer)}
              disabled={!currentAnswer && step.type === StepType.Question}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
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
