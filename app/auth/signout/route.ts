import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Get the origin from the request
  const url = new URL(request.url)
  return NextResponse.redirect(new URL("/auth/login", url.origin))
}
