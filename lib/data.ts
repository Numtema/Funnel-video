import type { Funnel } from "./types"

export const funnelsData: Funnel[] = [
  {
    id: "1",
    title: "Quiz Testostérone - Hommes 40+",
    description: "Un quiz pour aider les hommes de plus de 40 ans à évaluer leur niveau de testostérone.",
    type: "health_quiz",
    status: "active",
    views: 1247,
    conversions: 156,
    conversionRate: 12.5,
    lastUpdated: "2024-01-15",
    aiOptimized: true,
    theme: {
      colors: {
        primary: "#3B82F6",
        secondary: "#ffffff",
        accent: "#F59E0B",
      },
    },
    steps: [
      {
        id: "step-1",
        type: "welcome",
        title: "Êtes-vous prêt à reprendre le contrôle ?",
        content: "Découvrez en 2 minutes si vos niveaux de testostérone sont optimaux.",
        buttonText: "Commencer le Quiz",
        media: {
          type: "image",
          url: "/placeholder.svg?height=400&width=600&text=Quiz+Testostérone",
        },
        aiOptimized: true,
      },
      {
        id: "step-2",
        type: "choice",
        title: "Comment décririez-vous votre niveau d'énergie général ?",
        content: "Soyez honnête, cela nous aide à mieux vous comprendre.",
        options: [
          "Élevé, je suis toujours actif",
          "Variable, avec des hauts et des bas",
          "Plutôt bas, je me sens souvent fatigué",
        ],
        aiOptimized: true,
      },
      {
        id: "step-3",
        type: "lead_capture",
        title: "Vos résultats sont prêts !",
        content: "Entrez votre email pour recevoir votre analyse personnalisée et des conseils exclusifs.",
        buttonText: "Recevoir mes résultats",
        aiOptimized: true,
      },
    ],
    aiInsights: {
      conversionPrediction: "12-15%",
      engagementTips: ["Utilisez des questions directes.", "Ajoutez un sentiment d'urgence."],
      bestPractices: ["Gardez le design simple.", "Le CTA doit être clair."],
      optimizationScore: 88,
      recommendations: ["Ajouter un timer d'urgence", "Inclure des témoignages"],
      generatedBy: "Agent Morphius",
      confidence: 0.95,
      estimatedCompletionTime: "2 minutes",
    },
    config: {
      theme: {
        primary: "#3B82F6",
        secondary: "#ffffff",
        accent: "#F59E0B",
        style: "modern",
      },
      settings: {
        tone: "professionnel",
        urgency: "medium",
        includeVideo: false,
        estimatedConversion: "12-15%",
      },
    },
    template: "health_quiz",
    createdAt: "2024-01-10",
  },
]
