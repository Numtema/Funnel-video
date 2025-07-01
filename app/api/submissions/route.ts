import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { funnel_id, quiz_id, contact_info, responses, ai_analysis } = body

    // Validation
    if (!funnel_id && !quiz_id) {
      return NextResponse.json({ error: "Either funnel_id or quiz_id is required" }, { status: 400 })
    }

    if (funnel_id && quiz_id) {
      return NextResponse.json({ error: "Cannot specify both funnel_id and quiz_id" }, { status: 400 })
    }

    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        funnel_id: funnel_id || null,
        quiz_id: quiz_id || null,
        contact_info,
        responses,
        ai_analysis: ai_analysis || {},
        ip_address: request.ip || null,
        user_agent: request.headers.get("user-agent") || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Increment counters
    if (funnel_id) {
      await supabase.rpc("increment_funnel_conversions", { funnel_id })
    }

    if (quiz_id) {
      await supabase.rpc("increment_quiz_completions", { quiz_id })
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const funnel_id = searchParams.get("funnel_id")
    const quiz_id = searchParams.get("quiz_id")

    let query = supabase.from("submissions").select("*")

    if (funnel_id) {
      query = query.eq("funnel_id", funnel_id)
    } else if (quiz_id) {
      query = query.eq("quiz_id", quiz_id)
    } else {
      query = query.limit(100)
    }

    const { data: submissions, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
