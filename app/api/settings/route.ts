import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json")

async function ensureDataDir() {
  const dataDir = path.dirname(SETTINGS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

export async function GET() {
  try {
    await ensureDataDir()

    try {
      const data = await fs.readFile(SETTINGS_FILE, "utf-8")
      const settings = JSON.parse(data)

      // Masquer les clés API pour la sécurité (sauf les 4 derniers caractères)
      if (settings.aiProviders) {
        settings.aiProviders = settings.aiProviders.map((provider: any) => ({
          ...provider,
          apiKey: provider.apiKey ? "***" + provider.apiKey.slice(-4) : "",
        }))
      }

      return NextResponse.json(settings)
    } catch (error) {
      // Fichier n'existe pas, retourner les paramètres par défaut
      const defaultSettings = {
        aiProviders: [
          {
            id: "gemini",
            name: "Google Gemini",
            description: "Gemini 1.5 Flash - Rapide et efficace pour la génération de contenu",
            apiKey: "",
            model: "gemini-1.5-flash",
            priority: 1,
            enabled: true,
            status: "disconnected",
            features: ["Génération de quiz", "Génération de funnels", "Analyse de contenu"],
            pricing: "Gratuit jusqu'à 15 requêtes/minute",
          },
          {
            id: "openai",
            name: "OpenAI GPT-4",
            description: "GPT-4 - Excellent pour la génération de contenu créatif",
            apiKey: "",
            model: "gpt-4",
            priority: 2,
            enabled: false,
            status: "disconnected",
            features: ["Génération créative", "Analyse avancée", "Rédaction"],
            pricing: "$0.03 par 1K tokens",
          },
        ],
        generalSettings: {
          autoFallback: true,
          maxRetries: 3,
          timeoutSeconds: 30,
          enableLogging: true,
          demoMode: false,
        },
      }

      return NextResponse.json(defaultSettings)
    }
  } catch (error) {
    console.error("Erreur lecture paramètres:", error)
    return NextResponse.json({ error: "Erreur lecture paramètres" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    await ensureDataDir()

    // Sauvegarder les paramètres
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))

    return NextResponse.json({ success: true, message: "Paramètres sauvegardés avec succès" })
  } catch (error) {
    console.error("Erreur sauvegarde paramètres:", error)
    return NextResponse.json({ error: "Erreur sauvegarde paramètres" }, { status: 500 })
  }
}
