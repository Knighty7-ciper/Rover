import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const { data, error } = await supabase
      .from("likes")
      .select(`
        *,
        profiles:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .eq("post_id", params.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error fetching likes:", error)
    return NextResponse.json({ error: "Failed to fetch likes", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 })
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", params.id)
      .single()

    if (postError) throw postError

    const { data: existingLike, error: likeCheckError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", params.id)
      .eq("user_id", user.id)
      .single()

    if (likeCheckError && likeCheckError.code !== "PGRST116") {
      throw likeCheckError
    }

    if (existingLike) {
      return NextResponse.json({ error: "Post already liked", success: false }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("likes")
      .insert({
        post_id: params.id,
        user_id: user.id,
      })
      .select(`
        *,
        profiles:user_id(
          id,
          full_name,
          title,
          avatar_url,
          department
        )
      `)
      .single()

    if (error) throw error

    if (post.user_id !== user.id) {
      await supabase.rpc("create_notification", {
        p_user_id: post.user_id,
        p_actor_id: user.id,
        p_type: "like",
        p_title: "Post Liked",
        p_message: `${user.user_metadata.full_name || "Someone"} liked your post`,
        p_entity_type: "post",
        p_entity_id: params.id,
      })
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error("Error creating like:", error)
    return NextResponse.json({ error: "Failed to like post", success: false }, { status: 500 })
  }
}
