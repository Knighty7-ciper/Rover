import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.userId

    if (user.id === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .single()

    if (existingFollow) {
      return NextResponse.json({ error: "Already following" }, { status: 400 })
    }

    // Follow the user
    const { error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      })

    if (followError) {
      return NextResponse.json({ error: followError.message }, { status: 500 })
    }

    // Update follower counts using the database functions
    const { error: countError } = await supabase.rpc('increment_follower_count', {
      user_id: targetUserId
    })

    if (countError) {
      console.warn("Error incrementing follower count:", countError)
    }

    const { error: followingCountError } = await supabase.rpc('increment_following_count', {
      user_id: user.id
    })

    if (followingCountError) {
      console.warn("Error incrementing following count:", followingCountError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetUserId = params.userId

    // Unfollow the user
    const { error: unfollowError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)

    if (unfollowError) {
      return NextResponse.json({ error: unfollowError.message }, { status: 500 })
    }

    // Update follower counts using the database functions
    const { error: countError } = await supabase.rpc('decrement_follower_count', {
      user_id: targetUserId
    })

    if (countError) {
      console.warn("Error decrementing follower count:", countError)
    }

    const { error: followingCountError } = await supabase.rpc('decrement_following_count', {
      user_id: user.id
    })

    if (followingCountError) {
      console.warn("Error decrementing following count:", followingCountError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}