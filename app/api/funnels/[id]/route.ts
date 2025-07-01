import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import sql from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [funnel] = await sql`
      SELECT * FROM funnels 
      WHERE id = ${params.id} AND user_id = ${user.id}
    `

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

    const [funnel] = await sql`
      UPDATE funnels 
      SET title = ${title}, description = ${description}, config = ${JSON.stringify(config)}, 
          status = ${status}, ai_insights = ${JSON.stringify(ai_insights || {})}
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING *
    `

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

    const [funnel] = await sql`
      DELETE FROM funnels 
      WHERE id = ${params.id} AND user_id = ${user.id}
      RETURNING id
    `

    if (!funnel) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting funnel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
