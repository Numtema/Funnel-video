"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Brain,
  Key,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Sparkles,
  ArrowLeft,
  Save,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AIProvider {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: "connected" | "disconnected" | "testing" | "error"
  apiKey: string
  model: string
  priority: number
  enabled: boolean
  features: string[]
  pricing: string
}

interface TestResult {
  provider: string
  success: boolean
  responseTime: number
  error?: string
  sampleResponse?: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("ai-config")
  const [isSaving, setIsSaving] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingAll, setIsTestingAll] = useState(false)
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([])
  const [generalSettings, setGeneralSettings] = useState({
    autoFallback: true,
    maxRetries: 3,
    timeoutSeconds: 30,
    enableLogging: true,
    demoMode: false,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.aiProviders) {
          setAiProviders(
            data.aiProviders.map((provider: any) => ({
              ...provider,
              icon: provider.id === "gemini" ? <Brain className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />,
            })),
          )
        }
        if (data.generalSettings) {
          setGeneralSettings(data.generalSettings)
        }
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error)
      toast.error("Erreur lors du chargement des paramètres")
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProviders: aiProviders.map((p) => ({ ...p, icon: undefined })), // Retirer l'icône pour la sauvegarde
          generalSettings,
        }),
      })

      if (response.ok) {
        toast.success("Paramètres sauvegardés avec succès!")
      } else {
        throw new Error("Erreur de sauvegarde")
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsSaving(false)
    }
  }

  const testProvider = async (providerId: string) => {
    const provider = aiProviders.find((p) => p.id === providerId)
    if (!provider || !provider.apiKey) {
      toast.error("Clé API manquante pour ce provider")
      return
    }

    // Mettre à jour le statut
    setAiProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "testing" } : p)))

    try {
      const startTime = Date.now()
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          apiKey: provider.apiKey,
          model: provider.model,
        }),
      })

      const responseTime = Date.now() - startTime
      const result = await response.json()

      const testResult: TestResult = {
        provider: providerId,
        success: result.success,
        responseTime,
        error: result.error,
        sampleResponse: result.sampleResponse,
      }

      setTestResults((prev) => [...prev.filter((r) => r.provider !== providerId), testResult])

      // Mettre à jour le statut du provider
      setAiProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, status: result.success ? "connected" : "error" } : p)),
      )

      if (result.success) {
        toast.success(`Test réussi pour ${provider.name}`)
      } else {
        toast.error(`Test échoué pour ${provider.name}: ${result.error}`)
      }
    } catch (error) {
      const testResult: TestResult = {
        provider: providerId,
        success: false,
        responseTime: 0,
        error: "Erreur de connexion",
      }

      setTestResults((prev) => [...prev.filter((r) => r.provider !== providerId), testResult])
      setAiProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "error" } : p)))
      toast.error(`Erreur de connexion pour ${provider.name}`)
    }
  }

  const testAllProviders = async () => {
    setIsTestingAll(true)
    const enabledProviders = aiProviders.filter((p) => p.enabled && p.apiKey)

    for (const provider of enabledProviders) {
      await testProvider(provider.id)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsTestingAll(false)
  }

  const updateProvider = (providerId: string, updates: Partial<AIProvider>) => {
    setAiProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, ...updates } : p)))
  }

  const getStatusIcon = (status: AIProvider["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "testing":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: AIProvider["status"]) => {
    const variants = {
      connected: "bg-green-100 text-green-800",
      testing: "bg-blue-100 text-blue-800",
      error: "bg-red-100 text-red-800",
      disconnected: "bg-gray-100 text-gray-800",
    }

    const labels = {
      connected: "Connecté",
      testing: "Test...",
      error: "Erreur",
      disconnected: "Non configuré",
    }

    return (
      <Badge className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    )
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
                  Paramètres
                </h1>
                <div className="text-xs text-gray-500">Configuration Agent Morphius</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="ai-config" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Configuration IA</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span>Tests & Diagnostics</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Paramètres Généraux</span>
            </TabsTrigger>
          </TabsList>

          {/* Configuration IA */}
          <TabsContent value="ai-config" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configuration des IA</h2>
                <p className="text-gray-600">Configurez vos clés API pour les différents providers d'IA</p>
              </div>
              <Button
                onClick={testAllProviders}
                disabled={isTestingAll}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
              >
                {isTestingAll ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Tester Tout
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiProviders.map((provider) => (
                <Card key={provider.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">{provider.icon}</div>
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{provider.name}</span>
                          </CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(provider.status)}
                        <Switch
                          checked={provider.enabled}
                          onCheckedChange={(enabled) => updateProvider(provider.id, { enabled })}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`${provider.id}-key`}>Clé API</Label>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          id={`${provider.id}-key`}
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value })}
                          placeholder="Entrez votre clé API..."
                          className="flex-1"
                        />
                        <Button
                          onClick={() => testProvider(provider.id)}
                          disabled={!provider.apiKey || provider.status === "testing"}
                          variant="outline"
                          size="sm"
                        >
                          {provider.status === "testing" ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Modèle</Label>
                      <Input
                        value={provider.model}
                        onChange={(e) => updateProvider(provider.id, { model: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Fonctionnalités</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {provider.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <strong>Tarification:</strong> {provider.pricing}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Guide d'obtention des clés */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Key className="w-5 h-5 mr-2" />
                  Comment obtenir vos clés API ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-blue-700">
                <div>
                  <strong>Google Gemini (Recommandé):</strong>
                  <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                    <li>
                      Allez sur{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        className="underline inline-flex items-center"
                        rel="noreferrer"
                      >
                        Google AI Studio <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </li>
                    <li>Connectez-vous avec votre compte Google</li>
                    <li>Cliquez sur "Create API Key"</li>
                    <li>Copiez la clé générée et collez-la ci-dessus</li>
                  </ol>
                </div>
                <div>
                  <strong>OpenAI (Optionnel):</strong>
                  <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                    <li>
                      Allez sur{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        className="underline inline-flex items-center"
                        rel="noreferrer"
                      >
                        OpenAI Platform <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </li>
                    <li>Créez un compte ou connectez-vous</li>
                    <li>Cliquez sur "Create new secret key"</li>
                    <li>Copiez la clé (elle ne sera plus visible après)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests & Diagnostics */}
          <TabsContent value="testing" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tests & Diagnostics</h2>
              <p className="text-gray-600">Testez vos configurations et diagnostiquez les problèmes</p>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Résultats des Tests</h3>
                {testResults.map((result) => {
                  const provider = aiProviders.find((p) => p.id === result.provider)
                  return (
                    <Card key={result.provider} className="bg-white/80 backdrop-blur-sm">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            {provider?.icon}
                            <div>
                              <h4 className="font-semibold">{provider?.name}</h4>
                              <p className="text-sm text-gray-600">Temps de réponse: {result.responseTime}ms</p>
                            </div>
                          </div>
                          <Badge className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {result.success ? "Succès" : "Échec"}
                          </Badge>
                        </div>

                        {result.error && (
                          <Alert className="mt-4 border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-red-700">{result.error}</AlertDescription>
                          </Alert>
                        )}

                        {result.sampleResponse && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Réponse d'exemple:</p>
                            <p className="text-sm text-gray-800">{result.sampleResponse}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {testResults.length === 0 && (
              <Card className="bg-gray-50 border-dashed border-2">
                <CardContent className="pt-6 text-center">
                  <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun test effectué pour le moment</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Configurez vos clés API et lancez un test pour voir les résultats ici
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Paramètres Généraux */}
          <TabsContent value="general" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres Généraux</h2>
              <p className="text-gray-600">Configuration avancée de l'Agent Morphius</p>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Comportement de l'IA</CardTitle>
                <CardDescription>Configurez comment l'Agent Morphius gère les erreurs et les fallbacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Fallback Automatique</Label>
                    <p className="text-sm text-gray-600">Utilise automatiquement le provider suivant en cas d'échec</p>
                  </div>
                  <Switch
                    checked={generalSettings.autoFallback}
                    onCheckedChange={(autoFallback) => setGeneralSettings((prev) => ({ ...prev, autoFallback }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nombre maximum de tentatives</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={generalSettings.maxRetries}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({ ...prev, maxRetries: Number.parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout (secondes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={generalSettings.timeoutSeconds}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({ ...prev, timeoutSeconds: Number.parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Logging Détaillé</Label>
                    <p className="text-sm text-gray-600">Enregistre tous les appels API pour le debugging</p>
                  </div>
                  <Switch
                    checked={generalSettings.enableLogging}
                    onCheckedChange={(enableLogging) => setGeneralSettings((prev) => ({ ...prev, enableLogging }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mode Démo</Label>
                    <p className="text-sm text-gray-600">Utilise des réponses simulées sans appeler les API</p>
                  </div>
                  <Switch
                    checked={generalSettings.demoMode}
                    onCheckedChange={(demoMode) => setGeneralSettings((prev) => ({ ...prev, demoMode }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations système */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-800">Informations Système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Agent Morphius:</span>
                  <span className="font-semibold">Ultimate v3.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Framework:</span>
                  <span className="font-semibold">Nümtema AGENCY</span>
                </div>
                <div className="flex justify-between">
                  <span>Support:</span>
                  <span className="font-semibold">07 45 43 42 40</span>
                </div>
                <div className="flex justify-between">
                  <span>Website:</span>
                  <a href="https://www.numtemaagency.com" className="font-semibold text-indigo-600 hover:underline">
                    numtemaagency.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
