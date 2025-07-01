import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

// Agent Morphius - Analyse complète du funnel
export async function POST(request: NextRequest) {
  try {
    const { funnelData, userId } = await request.json()

    // Appel à l'agent Python corrigé
    const analysis = await callPythonAgent("analyze_funnel_with_ai", {
      funnel_data: funnelData,
      user_id: userId,
    })

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      agent: "Morphius v2.1",
      model: "gemini-2.5-pro",
    })
  } catch (error) {
    console.error("Erreur analyse IA:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse IA",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

async function callPythonAgent(functionName: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "scripts", "agent_morphius_fixed.py")

    const pythonProcess = spawn("python", [
      "-c",
      `
import sys
import json
import asyncio
import os

# Ajouter le chemin des scripts
sys.path.append('${path.join(process.cwd(), "scripts")}')

try:
    from agent_morphius_fixed import ${functionName}
    
    async def main():
        try:
            data = json.loads('${JSON.stringify(data).replace(/'/g, "\\'")}')
            result = await ${functionName}(data.get('funnel_data', data))
            print(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e), "agent": "Morphius v2.1"}, ensure_ascii=False))
    
    asyncio.run(main())
    
except ImportError as e:
    print(json.dumps({"error": f"Import error: {str(e)}", "agent": "Morphius v2.1"}, ensure_ascii=False))
except Exception as e:
    print(json.dumps({"error": f"General error: {str(e)}", "agent": "Morphius v2.1"}, ensure_ascii=False))
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
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim())
          resolve(result)
        } catch (parseError) {
          // Si le parsing échoue, retourner une réponse de démonstration
          resolve({
            overall_score: 75,
            conversion_prediction: 22.5,
            agent: "Morphius v2.1 (Fallback)",
            error: "Parsing failed, using demo data",
          })
        }
      } else {
        // En cas d'erreur, retourner une réponse de démonstration
        resolve({
          overall_score: 70,
          conversion_prediction: 20.0,
          agent: "Morphius v2.1 (Error Fallback)",
          error: `Python process failed: ${errorOutput}`,
        })
      }
    })

    pythonProcess.on("error", (error) => {
      // En cas d'erreur de processus, retourner une réponse de démonstration
      resolve({
        overall_score: 65,
        conversion_prediction: 18.0,
        agent: "Morphius v2.1 (Process Fallback)",
        error: `Process error: ${error.message}`,
      })
    })
  })
}
