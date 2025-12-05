import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // Redirect based on auth status
  if (data?.user) {
    redirect("/feed")
  } else {
    redirect("/auth/login")
  }
}
