import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

// Agent Morphius - Prédiction de conversion
export async function POST(request: NextRequest) {
  try {
    const { funnelData, historicalData } = await request.json()

    // Appel à l'agent Python pour prédiction
    const prediction = await callPythonAgent("predict_funnel_conversion", {
      funnel_data: funnelData,
      historical_data: historicalData || [],
    })

    return NextResponse.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString(),
      agent: "Morphius v2.1",
      model: "gemini-2.5-pro",
    })
  } catch (error) {
    console.error("Erreur prédiction IA:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la prédiction",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

async function callPythonAgent(functionName: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      "-c",
      `
import sys
import json
import asyncio
sys.path.append('${path.join(process.cwd(), "scripts")}')

from agent_morphius import ${functionName}

async def main():
    data = json.loads('${JSON.stringify(data)}')
    result = await ${functionName}(data['funnel_data'], data['historical_data'])
    print(json.dumps(result, ensure_ascii=False))

asyncio.run(main())
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
          reject(new Error(`Erreur parsing JSON: ${parseError}`))
        }
      } else {
        reject(new Error(`Python script failed: ${errorOutput}`))
      }
    })
  })
}
