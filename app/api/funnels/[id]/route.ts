import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: funnel, error } = await supabaseAdmin
      .from("funnels")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 })
    }

    return NextResponse.json({ funnel })
  } catch (error) {
    console.error("Error fetching funnel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, config, status, ai_insights } = body

    const { data: funnel, error } = await supabaseAdmin
      .from("funnels")
      .update({
        title,
        description,
        config,
        status,
        ai_insights: ai_insights || {},
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 })
    }

    return NextResponse.json({ funnel })
  } catch (error) {
    console.error("Error updating funnel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: funnel, error } = await supabaseAdmin
      .from("funnels")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting funnel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
