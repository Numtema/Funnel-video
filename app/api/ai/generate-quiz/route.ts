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

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, questionCount, quizType, description } = await request.json()

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

    const difficultyMap = {
      easy: "facile",
      medium: "moyen",
      hard: "difficile",
    }

    const typeMap = {
      knowledge: "quiz de connaissances",
      personality: "test de personnalité",
      assessment: "évaluation",
      survey: "sondage",
    }

    const prompt = `
Créez un ${typeMap[quizType as keyof typeof typeMap] || "quiz"} complet sur le sujet: "${topic}"

Paramètres:
- Niveau de difficulté: ${difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty}
- Nombre de questions: ${questionCount}
- Description additionnelle: ${description || "Aucune"}

Instructions:
1. Créez des questions variées et engageantes
2. Pour les questions à choix multiples, proposez 4 options avec une seule bonne réponse
3. Adaptez le ton selon le type de quiz
4. Assurez-vous que les questions sont progressives en difficulté

Retournez UNIQUEMENT un objet JSON valide avec cette structure exacte:
{
  "title": "Titre accrocheur du quiz",
  "description": "Description courte et engageante",
  "config": {
    "questions": [
      {
        "id": "q1",
        "type": "multiple",
        "question": "Texte de la question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "required": true,
        "scoring": {
          "points": 10,
          "correctAnswer": "Option A"
        }
      }
    ],
    "settings": {
      "showProgress": true,
      "allowBack": true,
      "showResults": true,
      "timeLimit": null
    }
  },
  "theme": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "fontFamily": "Inter",
    "layout": "card"
  },
  "ai_insights": {
    "optimizationScore": 85,
    "suggestions": [
      "Suggestion d'amélioration 1",
      "Suggestion d'amélioration 2"
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

    // Supprimer les balises markdown si présentes
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Trouver le JSON dans la réponse
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Réponse JSON invalide de l'IA")
    }

    const result = JSON.parse(jsonMatch[0])

    // Validation basique
    if (!result.title || !result.config || !result.config.questions) {
      throw new Error("Structure de réponse invalide")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating quiz:", error)

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
        error: "Erreur inconnue lors de la génération du quiz",
      },
      { status: 500 },
    )
  }
}
