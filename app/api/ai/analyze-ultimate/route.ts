import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

// Agent Morphius Ultimate - Analyse complète inspirée des funnels premium
export async function POST(request: NextRequest) {
  try {
    const { funnelData, userId } = await request.json()

    // Installation automatique des dépendances si nécessaire
    await ensureDependencies()

    // Appel à l'agent Python Ultimate
    const analysis = await callPythonAgentUltimate("analyze_funnel_ultimate", {
      funnel_data: funnelData,
      user_id: userId,
    })

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      agent: "Morphius Ultimate v3.0",
      provider: analysis.ai_provider || "demo",
      inspiration: "Funnels Premium Testosterone/Healing",
    })
  } catch (error) {
    console.error("Erreur analyse Ultimate:", error)

    // Fallback avec données de démonstration inspirées des captures
    const fallbackAnalysis = {
      overall_score: 78,
      conversion_prediction: 24.5,
      engagement_factors: ["Vidéo d'accroche immersive", "Questions personnalisées", "Design professionnel"],
      friction_points: ["Formulaire potentiellement trop long", "Manque de preuve sociale"],
      copy_effectiveness: 75.0,
      visual_impact: 82.0,
      psychological_triggers: ["Curiosité (découvrez votre niveau)", "Personnalisation (résultats sur mesure)"],
      recommendations: [
        {
          type: "video",
          priority: "high",
          description: "Ajouter une vidéo d'accroche de 45-60s comme dans les funnels testosterone",
          expected_improvement: "+40% engagement",
          implementation: "Créer une vidéo avec promesse claire et call-to-action",
        },
        {
          type: "urgency",
          priority: "high",
          description: "Ajouter un élément d'urgence ou de rareté",
          expected_improvement: "+25% conversion",
          implementation: "Timer de 15 minutes ou places limitées",
        },
      ],
      confidence_level: 0.85,
      processing_time: "0.5s",
      agent_version: "Morphius Ultimate v3.0 (Fallback)",
    }

    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString(),
      agent: "Morphius Ultimate v3.0",
      provider: "fallback",
      note: "Analyse de démonstration basée sur les patterns premium",
    })
  }
}

async function ensureDependencies(): Promise<void> {
  return new Promise((resolve) => {
    const pythonProcess = spawn("python", [path.join(process.cwd(), "scripts", "auto_installer.py")])

    pythonProcess.on("close", (code) => {
      console.log(`Installation des dépendances terminée avec le code: ${code}`)
      resolve()
    })

    pythonProcess.on("error", (error) => {
      console.warn(`Erreur installation dépendances: ${error.message}`)
      resolve() // Continue même en cas d'erreur
    })
  })
}

async function callPythonAgentUltimate(functionName: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      "-c",
      `
import sys
import json
import asyncio
import os
import traceback

# Ajouter le chemin des scripts
sys.path.append('${path.join(process.cwd(), "scripts")}')

try:
    from agent_morphius_ultimate import ${functionName}
    
    async def main():
        try:
            data = json.loads('${JSON.stringify(data).replace(/'/g, "\\'")}')
            result = await ${functionName}(data.get('funnel_data', data))
            print(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            error_result = {
                "error": str(e),
                "traceback": traceback.format_exc(),
                "agent": "Morphius Ultimate v3.0",
                "fallback_mode": True
            }
            print(json.dumps(error_result, ensure_ascii=False))
    
    asyncio.run(main())
    
except ImportError as e:
    error_result = {
        "error": f"Import error: {str(e)}",
        "agent": "Morphius Ultimate v3.0",
        "suggestion": "Exécuter auto_installer.py",
        "fallback_mode": True
    }
    print(json.dumps(error_result, ensure_ascii=False))
except Exception as e:
    error_result = {
        "error": f"General error: {str(e)}",
        "agent": "Morphius Ultimate v3.0",
        "fallback_mode": True
    }
    print(json.dumps(error_result, ensure_ascii=False))
      `,
    ])

    let output = ""
    let errorOutput = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on("close", (code) => {
      try {
        const result = JSON.parse(output.trim())
        resolve(result)
      } catch (parseError) {
        // Fallback en cas d'erreur de parsing
        resolve({
          overall_score: 75,
          conversion_prediction: 20.0,
          agent: "Morphius Ultimate v3.0 (Parse Fallback)",
          error: "Parsing failed",
          raw_output: output,
          stderr: errorOutput,
        })
      }
    })

    pythonProcess.on("error", (error) => {
      resolve({
        overall_score: 70,
        conversion_prediction: 18.0,
        agent: "Morphius Ultimate v3.0 (Process Fallback)",
        error: `Process error: ${error.message}`,
      })
    })
  })
}
