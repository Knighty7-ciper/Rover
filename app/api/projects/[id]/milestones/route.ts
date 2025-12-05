import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data, error } = await supabase
      .from("milestones")
      .select(`
        *,
        creator:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .eq("project_id", params.id)
      .order("due_date", { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error fetching milestones:", error)
    return NextResponse.json({ error: "Failed to fetch milestones", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { title, description, due_date, budget_allocated } = body

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", params.id)
      .single()

    if (projectError) throw projectError

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        project_id: params.id,
        user_id: user.id,
        title,
        description,
        due_date: due_date || null,
        budget_allocated: budget_allocated || 0,
        status: "pending",
      })
      .select(`
        *,
        creator:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .single()

    if (error) throw error

    if (project.user_id !== user.id) {
      await supabase.rpc("create_notification", {
        p_user_id: project.user_id,
        p_actor_id: user.id,
        p_type: "project_update",
        p_title: "New Milestone Created",
        p_message: `${user.user_metadata.full_name || "Someone"} created a new milestone for your project`,
        p_entity_type: "project",
        p_entity_id: params.id,
      })
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json({ error: "Failed to create milestone", success: false }, { status: 500 })
  }
}
