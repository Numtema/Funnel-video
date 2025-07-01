"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface AIAssistantProps {
  funnelData?: any
  userData?: any
  onOptimizationApplied?: (optimization: any) => void
}

export function AIAssistant({ funnelData, userData, onOptimizationApplied }: AIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [prediction, setPrediction] = useState<any>(null)

  const analyzeWithMorphius = async () => {
    if (!funnelData) return

    setIsAnalyzing(true)
    try {
      // Analyse complète
      const analysisResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelData, userId: userData?.id }),
      })
      const analysisResult = await analysisResponse.json()
      setAnalysis(analysisResult.analysis)

      // Génération d'insights
      const insightsResponse = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData }),
      })
      const insightsResult = await insightsResponse.json()
      setInsights(insightsResult.insights || [])

      // Prédiction de conversion
      const predictionResponse = await fetch("/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelData, historicalData: [] }),
      })
      const predictionResult = await predictionResponse.json()
      setPrediction(predictionResult.prediction)
    } catch (error) {
      console.error("Erreur analyse IA:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const optimizeStep = async (stepData: any) => {
    try {
      const response = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepData,
          funnelContext: funnelData,
          userId: userData?.id,
        }),
      })
      const result = await response.json()

      if (result.success && onOptimizationApplied) {
        onOptimizationApplied(result.optimization)
      }
    } catch (error) {
      console.error("Erreur optimisation:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Target className="w-5 h-5" />
      case "trend":
        return <TrendingUp className="w-5 h-5" />
      case "alert":
        return <AlertTriangle className="w-5 h-5" />
      case "recommendation":
        return <Lightbulb className="w-5 h-5" />
      case "prediction":
        return <BarChart3 className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Agent Morphius */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-800">Agent Morphius</CardTitle>
                <p className="text-sm text-purple-600">Powered by Gemini 2.5 Pro • Nümtema AGENCY</p>
              </div>
            </div>
            <Button
              onClick={analyzeWithMorphius}
              disabled={isAnalyzing || !funnelData}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyser avec IA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analyse Globale */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analyse Globale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{analysis.overall_score}/100</div>
                <div className="text-sm text-blue-500">Score Global</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{analysis.conversion_prediction?.toFixed(1)}%</div>
                <div className="text-sm text-green-500">Conversion Prédite</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {analysis.confidence_level ? (analysis.confidence_level * 100).toFixed(0) : "N/A"}%
                </div>
                <div className="text-sm text-purple-500">Confiance IA</div>
              </div>
            </div>

            {/* Points Forts */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Points Forts
                </h4>
                <div className="space-y-1">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <div key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problèmes Détectés */}
            {analysis.issues && analysis.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Problèmes Détectés
                </h4>
                <div className="space-y-2">
                  {analysis.issues.map((issue: any, index: number) => (
                    <div key={index} className="border border-red-200 bg-red-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-red-800">{issue.problem}</h5>
                        <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                      </div>
                      <p className="text-sm text-red-700 mb-2">{issue.solution}</p>
                      <div className="text-xs text-red-600">Impact estimé: {issue.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prédiction de Conversion */}
      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Prédiction de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {prediction.predicted_conversion_rate?.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Taux de conversion prédit</div>
              {prediction.confidence_interval && (
                <div className="text-xs text-gray-500 mt-1">
                  Intervalle: {prediction.confidence_interval.min?.toFixed(1)}% -{" "}
                  {prediction.confidence_interval.max?.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Scénarios */}
            {prediction.scenarios && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">
                    {prediction.scenarios.pessimistic?.rate?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-red-500">Pessimiste</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {prediction.scenarios.realistic?.rate?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-blue-500">Réaliste</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {prediction.scenarios.optimistic?.rate?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-500">Optimiste</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insights Personnalisés */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Insights Personnalisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(insight.priority)}>{insight.priority}</Badge>
                          {insight.confidence && (
                            <Badge variant="outline">{(insight.confidence * 100).toFixed(0)}% confiance</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{insight.message}</p>
                      {insight.impact && <div className="text-xs text-blue-600 mb-2">Impact: {insight.impact}</div>}
                      {insight.action_required && (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            {insight.action_required}
                          </Button>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(insight.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
