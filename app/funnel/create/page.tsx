"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Palette,
  Brain,
  Sparkles,
  Wand2,
  Target,
  Save,
  Settings,
  Lightbulb,
  MessageSquare,
  CheckSquare,
  Star,
  Mail,
  Phone,
  ThumbsUp,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const stepTypes = [
  { value: "welcome", label: "Message de Bienvenue", icon: MessageSquare, color: "bg-blue-500" },
  { value: "question", label: "Question Ouverte", icon: MessageSquare, color: "bg-green-500" },
  { value: "choice", label: "Choix Multiple", icon: CheckSquare, color: "bg-purple-500" },
  { value: "text", label: "Texte Libre", icon: MessageSquare, color: "bg-indigo-500" },
  { value: "email", label: "Capture Email", icon: Mail, color: "bg-red-500" },
  { value: "phone", label: "Capture Téléphone", icon: Phone, color: "bg-orange-500" },
  { value: "rating", label: "Note/Évaluation", icon: Star, color: "bg-yellow-500" },
  { value: "thank_you", label: "Remerciement", icon: ThumbsUp, color: "bg-emerald-500" },
]

const themes = [
  {
    name: "Corporate",
    colors: { primary: "#1e40af", secondary: "#f1f5f9", accent: "#3b82f6" },
    description: "Professionnel et moderne",
  },
  {
    name: "Nature",
    colors: { primary: "#059669", secondary: "#f0fdf4", accent: "#10b981" },
    description: "Naturel et apaisant",
  },
  {
    name: "Sunset",
    colors: { primary: "#d97706", secondary: "#fffbeb", accent: "#f59e0b" },
    description: "Chaleureux et énergique",
  },
  {
    name: "Ocean",
    colors: { primary: "#0284c7", secondary: "#f0f9ff", accent: "#0ea5e9" },
    description: "Frais et dynamique",
  },
  {
    name: "Purple",
    colors: { primary: "#7c3aed", secondary: "#faf5ff", accent: "#8b5cf6" },
    description: "Créatif et innovant",
  },
]

const aiSuggestions = [
  "Ajouter une étape de qualification pour améliorer la qualité des leads",
  "Utiliser une question de rating avant la capture d'email pour augmenter l'engagement",
  "Personnaliser le message de bienvenue selon la source de trafic",
  "Ajouter une étape de confirmation pour réduire les abandons",
]

export default function CreateFunnel() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("design")
  const [aiMode, setAiMode] = useState(false)
  const [funnel, setFunnel] = useState({
    title: "",
    description: "",
    category: "lead_gen",
    language: "fr",
    theme: themes[0],
    steps: [
      {
        id: "1",
        type: "welcome",
        title: "Bienvenue !",
        content: "Merci de prendre quelques minutes pour répondre à nos questions.",
        options: [],
        aiOptimized: false,
      },
    ],
  })

  // Agent Morphius - Auto-suggestions
  useEffect(() => {
    if (aiMode && funnel.steps.length > 1) {
      // Simulation d'analyse IA
      const timer = setTimeout(() => {
        console.log("🧠 Agent Morphius analyse votre funnel...")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [aiMode, funnel.steps])

  const addStep = (type = "question") => {
    const stepType = stepTypes.find((t) => t.value === type)
    const newStep = {
      id: Date.now().toString(),
      type,
      title: stepType?.label || "Nouvelle étape",
      content: "",
      options: type === "choice" || type === "rating" ? [""] : [],
      aiOptimized: false,
    }
    setFunnel((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }))
  }

  const updateStep = (stepId: string, field: string, value: any) => {
    setFunnel((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === stepId ? { ...step, [field]: value } : step)),
    }))
  }

  const deleteStep = (stepId: string) => {
    setFunnel((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }))
  }

  const optimizeWithAI = (stepId: string) => {
    // Simulation optimisation IA
    updateStep(stepId, "aiOptimized", true)
    // Ici on appellerait l'API Agent Morphius
    console.log("🧠 Optimisation IA appliquée à l'étape", stepId)
  }

  const saveFunnel = () => {
    console.log("💾 Funnel sauvegardé:", funnel)
    router.push("/")
  }

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find((t) => t.value === type)
    return stepType ? stepType.icon : MessageSquare
  }

  const getStepColor = (type: string) => {
    const stepType = stepTypes.find((t) => t.value === type)
    return stepType ? stepType.color : "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-white/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Créateur de Funnel
                </h1>
                <div className="text-xs text-gray-500">Powered by Agent Morphius</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiMode(!aiMode)}
                className={aiMode ? "bg-purple-100 border-purple-300 text-purple-700" : ""}
              >
                <Brain className="w-4 h-4 mr-2" />
                Mode IA {aiMode ? "ON" : "OFF"}
              </Button>
              <Link href={`/funnel/preview?data=${encodeURIComponent(JSON.stringify(funnel))}`}>
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Prévisualiser
                </Button>
              </Link>
              <Button
                onClick={saveFunnel}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="design" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Design</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Étapes</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>IA Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="sticky top-24 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="title">Titre du Funnel</Label>
                      <Input
                        id="title"
                        value={funnel.title}
                        onChange={(e) => setFunnel((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Questionnaire Satisfaction B2B"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={funnel.description}
                        onChange={(e) => setFunnel((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez l'objectif de ce funnel"
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Catégorie</Label>
                        <Select
                          value={funnel.category}
                          onValueChange={(value) => setFunnel((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead_gen">Lead Generation</SelectItem>
                            <SelectItem value="satisfaction">Satisfaction</SelectItem>
                            <SelectItem value="survey">Enquête</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Langue</Label>
                        <Select
                          value={funnel.language}
                          onValueChange={(value) => setFunnel((prev) => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Thème</Label>
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        {themes.map((theme, index) => (
                          <button
                            key={index}
                            onClick={() => setFunnel((prev) => ({ ...prev, theme }))}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              funnel.theme.name === theme.name
                                ? "border-indigo-500 bg-indigo-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex space-x-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.colors.primary }} />
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.colors.accent }} />
                              </div>
                              <div className="font-medium">{theme.name}</div>
                            </div>
                            <div className="text-xs text-gray-600">{theme.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {aiMode && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">IA Suggestions</span>
                        </div>
                        <div className="text-xs text-purple-700">
                          Thème recommandé: <strong>{themes[1].name}</strong> pour votre catégorie
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Aperçu du Thème</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="p-8 rounded-lg border-2 border-dashed"
                      style={{
                        backgroundColor: funnel.theme.colors.secondary,
                        borderColor: funnel.theme.colors.primary + "40",
                      }}
                    >
                      <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold" style={{ color: funnel.theme.colors.primary }}>
                          {funnel.title || "Titre de votre Funnel"}
                        </h2>
                        <p className="text-gray-600">{funnel.description || "Description de votre funnel"}</p>
                        <Button style={{ backgroundColor: funnel.theme.colors.primary }} className="text-white">
                          Commencer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Steps Tab */}
          <TabsContent value="steps" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Étapes du Funnel</h2>
              <div className="flex space-x-2">
                <Select onValueChange={(value) => addStep(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ajouter une étape" />
                  </SelectTrigger>
                  <SelectContent>
                    {stepTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {funnel.steps.map((step, index) => {
                const StepIcon = getStepIcon(step.type)
                return (
                  <Card key={step.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-lg ${getStepColor(step.type)} flex items-center justify-center`}
                          >
                            <StepIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">Étape {index + 1}</Badge>
                              {step.aiOptimized && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Optimisé IA
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {stepTypes.find((t) => t.value === step.type)?.label}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!step.aiOptimized && aiMode && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => optimizeWithAI(step.id)}
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Wand2 className="w-4 h-4 mr-1" />
                              Optimiser
                            </Button>
                          )}
                          {funnel.steps.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteStep(step.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Titre</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(step.id, "title", e.target.value)}
                            placeholder="Titre de cette étape"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={step.type} onValueChange={(value) => updateStep(step.id, "type", value)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stepTypes.map((type) => {
                                const Icon = type.icon
                                return (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded ${type.color}`} />
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Contenu</Label>
                        <Textarea
                          value={step.content}
                          onChange={(e) => updateStep(step.id, "content", e.target.value)}
                          placeholder="Question ou message à afficher"
                          rows={3}
                          className="mt-2"
                        />
                      </div>

                      {(step.type === "choice" || step.type === "rating") && (
                        <div>
                          <Label>Options de Réponse</Label>
                          <div className="space-y-2 mt-2">
                            {(step.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(step.options || [])]
                                    newOptions[optionIndex] = e.target.value
                                    updateStep(step.id, "options", newOptions)
                                  }}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = (step.options || []).filter((_, i) => i !== optionIndex)
                                    updateStep(step.id, "options", newOptions)
                                  }}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(step.options || []), ""]
                                updateStep(step.id, "options", newOptions)
                              }}
                              className="w-full border-dashed"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter une Option
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Brain className="w-6 h-6 mr-2" />
                  Agent Morphius - Assistant IA
                </CardTitle>
                <CardDescription className="text-purple-600">
                  Optimisations intelligentes pour maximiser vos conversions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-purple-100"
                  >
                    <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-700">{suggestion}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Appliquer
                        </Button>
                        <Button size="sm" variant="outline">
                          Plus d'infos
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paramètres Avancés</h3>
              <p className="text-gray-600 mb-6">Configuration SEO, intégrations, webhooks...</p>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">Bientôt Disponible</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
