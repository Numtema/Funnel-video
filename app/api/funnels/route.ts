import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: funnels, error } = await supabase
      .from("funnels")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ funnels })
  } catch (error) {
    console.error("Error fetching funnels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, config, ai_insights } = body

    const { data: funnel, error } = await supabase
      .from("funnels")
      .insert({
        user_id: user.id,
        title,
        description: description || "",
        config,
        ai_insights: ai_insights || {},
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ funnel })
  } catch (error) {
    console.error("Error creating funnel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
