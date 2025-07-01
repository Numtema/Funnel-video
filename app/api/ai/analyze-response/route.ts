import { type NextRequest, NextResponse } from "next/server"
import { analyzeTextResponse } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const analysis = await analyzeTextResponse(text)

    return NextResponse.json({
      success: true,
      analysis,
      analyzed_by: "Agent Morphius",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur analyse texte:", error)

    // Fallback analysis
    return NextResponse.json({
      success: true,
      analysis: {
        sentiment: "Neutral" as const,
        keywords: ["response", "user", "feedback"],
        summary: "User provided feedback that requires further analysis.",
      },
      analyzed_by: "Agent Morphius (Fallback)",
      timestamp: new Date().toISOString(),
      warning: "Used fallback analysis due to AI service error",
    })
  }
}
