import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import fs from "fs/promises"
import path from "path"

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json")

async function getApiKey(): Promise<string | null> {
  // D'abord essayer les variables d'environnement
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (envKey) return envKey

  // Ensuite essayer les paramètres sauvegardés
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8")
    const settings = JSON.parse(data)
    const geminiProvider = settings.aiProviders?.find((p: any) => p.id === "gemini")
    return geminiProvider?.apiKey || null
  } catch {
    return null
  }
}

const FUNNEL_TEMPLATES = {
  health_quiz: {
    name: "Quiz Santé/Bien-être",
    conversionRate: "25-35%",
    description: "Questionnaire personnalisé pour identifier les besoins santé",
    steps: [
      {
        title: "Accueil engageant",
        type: "welcome",
        description: "Page d'accueil avec promesse de valeur claire",
      },
      {
        title: "Questions personnalisées",
        type: "choice",
        description: "3-5 questions pour qualifier le prospect",
      },
      {
        title: "Capture lead",
        type: "lead_capture",
        description: "Formulaire pour recevoir le rapport détaillé",
      },
    ],
  },
  business_consultation: {
    name: "Consultation Business",
    conversionRate: "15-25%",
    description: "Qualification de prospects pour services B2B",
    steps: [
      {
        title: "Problématique business",
        type: "welcome",
        description: "Identification du défi principal",
      },
      {
        title: "Qualification entreprise",
        type: "choice",
        description: "Questions sur la taille et secteur d'activité",
      },
      {
        title: "Capture lead",
        type: "lead_capture",
        description: "Coordonnées pour recevoir l'audit complet",
      },
    ],
  },
  lead_magnet: {
    name: "Lead Magnet",
    conversionRate: "35-50%",
    description: "Contenu gratuit en échange des coordonnées",
    steps: [
      {
        title: "Promesse valeur",
        type: "welcome",
        description: "Présentation du contenu gratuit",
      },
      {
        title: "Formulaire simple",
        type: "lead_capture",
        description: "Email uniquement pour téléchargement",
      },
    ],
  },
  ecommerce: {
    name: "E-commerce",
    conversionRate: "8-18%",
    description: "Funnel de vente pour produits physiques/digitaux",
    steps: [
      {
        title: "Présentation produit",
        type: "welcome",
        description: "Mise en avant des bénéfices clés",
      },
      {
        title: "Offre limitée",
        type: "choice",
        description: "Promotion avec urgence/rareté",
      },
      {
        title: "Commande",
        type: "lead_capture",
        description: "Processus de commande simplifié",
      },
    ],
  },
  fitness_coaching: {
    name: "Coaching Fitness",
    conversionRate: "20-30%",
    description: "Acquisition clients pour coaching sportif",
    steps: [
      {
        title: "Transformation promise",
        type: "welcome",
        description: "Avant/après et promesse de résultats",
      },
      {
        title: "Évaluation fitness",
        type: "choice",
        description: "Questions sur objectifs et niveau actuel",
      },
      {
        title: "Consultation gratuite",
        type: "lead_capture",
        description: "Réservation d'un appel découverte",
      },
    ],
  },
  real_estate: {
    name: "Immobilier",
    conversionRate: "12-22%",
    description: "Génération de leads pour agents immobiliers",
    steps: [
      {
        title: "Estimation gratuite",
        type: "welcome",
        description: "Promesse d'estimation de bien",
      },
      {
        title: "Détails du bien",
        type: "choice",
        description: "Questions sur le type et localisation",
      },
      {
        title: "Contact agent",
        type: "lead_capture",
        description: "Coordonnées pour estimation détaillée",
      },
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    const { objective, targetAudience, industry, funnelType, additionalInfo } = await request.json()

    const apiKey = await getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Clé API Gemini manquante. Configurez-la dans les paramètres ou ajoutez GEMINI_API_KEY dans vos variables d'environnement.",
        },
        { status: 400 },
      )
    }

    const prompt = `
Créez un funnel de conversion complet pour:

Objectif: ${objective}
Audience cible: ${targetAudience}
Secteur d'activité: ${industry}
Type de funnel: ${funnelType}
Informations additionnelles: ${additionalInfo || "Aucune"}

Instructions:
1. Créez une séquence logique d'étapes pour convertir les visiteurs
2. Chaque étape doit avoir un objectif clair
3. Adaptez le contenu à l'audience et au secteur
4. Incluez des éléments de persuasion appropriés

Retournez UNIQUEMENT un objet JSON valide avec cette structure:
{
  "title": "Titre du funnel",
  "description": "Description du funnel",
  "config": {
    "steps": [
      {
        "id": "step1",
        "type": "landing",
        "title": "Titre de l'étape",
        "content": "Contenu de l'étape",
        "fields": [
          {
            "id": "field1",
            "type": "email",
            "label": "Email",
            "required": true
          }
        ],
        "styling": {
          "backgroundColor": "#ffffff",
          "textColor": "#333333"
        }
      }
    ],
    "settings": {
      "redirectUrl": "",
      "emailNotifications": true,
      "trackingEnabled": true
    }
  },
  "ai_insights": {
    "optimizationScore": 90,
    "suggestions": [
      "Suggestion 1",
      "Suggestion 2"
    ]
  }
}
`

    const { text } = await generateText({
      model: google("gemini-1.5-flash", { apiKey }),
      prompt,
      maxTokens: 3000,
      temperature: 0.7,
    })

    // Nettoyer et parser la réponse JSON
    let cleanText = text.trim()

    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Réponse JSON invalide de l'IA")
    }

    const result = JSON.parse(jsonMatch[0])

    if (!result.title || !result.config || !result.config.steps) {
      throw new Error("Structure de réponse invalide")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating funnel:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: `Erreur lors de la génération: ${error.message}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Erreur inconnue lors de la génération du funnel",
      },
      { status: 500 },
    )
  }
}

function generateOptimizedFunnel(params: any) {
  const { goal, audience, sector, tone, template, urgency, includeVideo } = params
  const templateData = FUNNEL_TEMPLATES[template as keyof typeof FUNNEL_TEMPLATES]

  if (!templateData) {
    throw new Error("Template non trouvé")
  }

  // Génération intelligente basée sur les paramètres
  const optimizedSteps = templateData.steps.map((step, index) => ({
    id: `step-${index + 1}`,
    title: personalizeTitle(step.title, { goal, audience, tone }),
    description: step.description,
    content: generateStepContent(step, { goal, audience, sector, tone, urgency }),
    type: step.type,
    media: includeVideo && index === 0 ? generateVideoSuggestion(goal, template) : null,
    aiOptimized: true,
    options: step.type === "choice" ? generateOptions(goal, audience, template) : undefined,
    buttonText: generateButtonText(step.type, tone, urgency),
  }))

  return {
    title: `${goal} - ${audience}`,
    type: template,
    description: `${templateData.description} optimisé pour ${audience}`,
    steps: optimizedSteps,
    config: {
      theme: getThemeForTemplate(template),
      settings: {
        tone,
        urgency: urgency || "medium",
        includeVideo: includeVideo || false,
        estimatedConversion: templateData.conversionRate,
      },
    },
    aiInsights: {
      conversionPrediction: templateData.conversionRate,
      optimizationScore: calculateOptimizationScore(params),
      recommendations: generateRecommendations(template, params),
      generatedBy: "Agent Morphius Ultimate v3.0",
      confidence: 0.89,
      estimatedCompletionTime: "2-3 minutes",
    },
  }
}

function personalizeTitle(baseTitle: string, params: any) {
  const { goal, audience, tone } = params

  const personalizations: { [key: string]: string } = {
    "Accueil engageant": `Découvrez ${goal}`,
    "Problématique business": `Optimisez ${goal}`,
    "Promesse valeur": `Obtenez ${goal}`,
    "Présentation produit": `${goal} pour ${audience}`,
    "Transformation promise": `Atteignez ${goal}`,
    "Estimation gratuite": `Évaluez ${goal}`,
  }

  return personalizations[baseTitle] || baseTitle
}

function generateStepContent(step: any, params: any) {
  const { goal, audience, sector, tone, urgency } = params

  const contentTemplates: { [key: string]: string } = {
    welcome: `Bienvenue ! Découvrez comment ${goal.toLowerCase()} spécialement conçu pour ${audience}. ${
      urgency === "high" ? "Offre limitée dans le temps !" : ""
    }`,
    choice: `Quelques questions rapides pour personnaliser votre expérience et vous proposer la meilleure solution.`,
    lead_capture: `Entrez vos coordonnées pour recevoir votre ${
      step.title.includes("consultation") ? "consultation gratuite" : "guide personnalisé"
    }.`,
  }

  return contentTemplates[step.type] || `Contenu optimisé pour ${step.title}`
}

function generateOptions(goal: string, audience: string, template: string) {
  const optionSets: { [key: string]: string[] } = {
    health_quiz: ["Améliorer mon énergie", "Perdre du poids", "Mieux dormir", "Réduire le stress"],
    business_consultation: [
      "Augmenter mes ventes",
      "Optimiser mes processus",
      "Développer mon équipe",
      "Améliorer ma stratégie",
    ],
    fitness_coaching: [
      "Perdre du poids",
      "Gagner en muscle",
      "Améliorer ma condition physique",
      "Me préparer pour une compétition",
    ],
    real_estate: [
      "Vendre mon bien",
      "Acheter ma résidence principale",
      "Investir dans l'immobilier",
      "Estimer la valeur de mon bien",
    ],
    ecommerce: ["Découvrir le produit", "Comparer les options", "Profiter de l'offre", "Commander maintenant"],
  }

  return optionSets[template] || ["Option A", "Option B", "Option C", "Option D"]
}

function generateButtonText(stepType: string, tone: string, urgency: string) {
  const buttonTexts: { [key: string]: { [key: string]: string } } = {
    welcome: {
      professionnel: "Commencer",
      amical: "C'est parti !",
      urgent: "Démarrer maintenant",
      expert: "Accéder au diagnostic",
      decontracte: "On y va !",
    },
    choice: {
      professionnel: "Continuer",
      amical: "Suivant",
      urgent: "Valider rapidement",
      expert: "Analyser",
      decontracte: "Suite",
    },
    lead_capture: {
      professionnel: "Recevoir mes résultats",
      amical: "Obtenir mon guide",
      urgent: "Accès immédiat",
      expert: "Télécharger l'analyse",
      decontracte: "Je veux ça !",
    },
  }

  return buttonTexts[stepType]?.[tone] || "Continuer"
}

function generateVideoSuggestion(goal: string, template: string) {
  const videoSuggestions: { [key: string]: any } = {
    health_quiz: {
      type: "video",
      url: "/placeholder.svg?height=400&width=600&text=Vidéo+Santé",
      description: `Vidéo d'accroche personnalisée expliquant l'importance de ${goal}`,
    },
    business_consultation: {
      type: "video",
      url: "/placeholder.svg?height=400&width=600&text=Vidéo+Business",
      description: "Présentation de l'expertise et résultats clients",
    },
    lead_magnet: {
      type: "video",
      url: "/placeholder.svg?height=400&width=600&text=Vidéo+Lead+Magnet",
      description: "Aperçu du contenu gratuit",
    },
  }

  return (
    videoSuggestions[template] || {
      type: "video",
      url: "/placeholder.svg?height=400&width=600&text=Vidéo+Funnel",
      description: `Vidéo d'introduction pour ${goal}`,
    }
  )
}

function getThemeForTemplate(template: string) {
  const themes: { [key: string]: any } = {
    health_quiz: {
      primary: "#10b981",
      secondary: "#f0fdf4",
      accent: "#059669",
      style: "medical_trust",
    },
    business_consultation: {
      primary: "#3b82f6",
      secondary: "#eff6ff",
      accent: "#1d4ed8",
      style: "professional_authority",
    },
    lead_magnet: {
      primary: "#8b5cf6",
      secondary: "#faf5ff",
      accent: "#7c3aed",
      style: "creative_engaging",
    },
    ecommerce: {
      primary: "#f59e0b",
      secondary: "#fffbeb",
      accent: "#d97706",
      style: "commercial_urgent",
    },
    fitness_coaching: {
      primary: "#ef4444",
      secondary: "#fef2f2",
      accent: "#dc2626",
      style: "energetic_motivational",
    },
    real_estate: {
      primary: "#6366f1",
      secondary: "#f8fafc",
      accent: "#4f46e5",
      style: "trustworthy_premium",
    },
  }

  return themes[template] || themes.health_quiz
}

function calculateOptimizationScore(params: any) {
  let score = 70 // Score de base

  // Bonus pour les paramètres optimisés
  if (params.tone && params.tone !== "neutral") score += 5
  if (params.urgency === "high") score += 8
  if (params.urgency === "medium") score += 5
  if (params.includeVideo) score += 10
  if (params.sector && params.sector !== "general") score += 5
  if (params.audience && params.audience.length > 10) score += 7

  return Math.min(score, 95) // Maximum 95%
}

function generateRecommendations(template: string, params: any) {
  const baseRecommendations: { [key: string]: string[] } = {
    health_quiz: [
      "Ajouter des témoignages de transformation pour renforcer la crédibilité",
      "Utiliser des questions progressives pour maintenir l'engagement",
      "Intégrer des éléments de gamification (barre de progression, scores)",
      "Proposer un suivi personnalisé après la capture de lead",
    ],
    business_consultation: [
      "Mettre en avant les certifications et références clients",
      "Créer un sentiment d'urgence avec des places limitées",
      "Proposer un audit gratuit comme lead magnet",
      "Utiliser des études de cas spécifiques au secteur",
    ],
    lead_magnet: [
      "Optimiser le titre avec des chiffres et bénéfices concrets",
      "Ajouter une preview du contenu pour augmenter la valeur perçue",
      "Simplifier le formulaire au maximum (email uniquement)",
      "Créer une séquence email de nurturing post-téléchargement",
    ],
  }

  const recommendations = baseRecommendations[template] || [
    "Tester différentes variantes du titre principal",
    "Optimiser les couleurs des boutons d'action",
    "Ajouter des éléments de preuve sociale",
    "Implémenter un système de suivi des conversions",
  ]

  // Recommandations personnalisées
  if (params.includeVideo) {
    recommendations.push("Optimiser la vidéo pour mobile et temps de chargement rapide")
  }
  if (params.urgency === "high") {
    recommendations.push("Ajouter un timer countdown pour renforcer l'urgence")
  }

  return recommendations
}
