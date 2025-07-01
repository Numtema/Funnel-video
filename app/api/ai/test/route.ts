import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json()

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Clé API manquante",
      })
    }

    if (provider === "gemini") {
      try {
        const { text } = await generateText({
          model: google("gemini-1.5-flash", { apiKey }),
          prompt: "Répondez simplement 'Test réussi' pour confirmer que l'API fonctionne.",
          maxTokens: 50,
        })

        return NextResponse.json({
          success: true,
          sampleResponse: text.trim(),
          provider: "gemini",
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : "Erreur de connexion à Gemini",
        })
      }
    }

    // Pour les autres providers (OpenAI, Anthropic, etc.)
    return NextResponse.json({
      success: false,
      error: "Provider non supporté pour le moment",
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur lors du test de l'API",
    })
  }
}
