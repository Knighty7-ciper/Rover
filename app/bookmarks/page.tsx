import { redirect } from "next/navigation"
import { Bookmark, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { Card } from "@/components/ui/card"
import type { Profile } from "@/lib/types"

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()
  return <FeedLayout profile={profile as Profile | null} currentPath="/bookmarks"><div className="mx-auto max-w-3xl"><Link href="/feed" className="flex items-center gap-2 text-sm text-white/45 hover:text-white"><ArrowLeft className="size-4" /> Back to home</Link><div className="mt-10 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-[#ff5b22]/15 text-[#ff5b22]"><Bookmark className="size-5" /></div><div><h1 className="text-3xl font-black">Your library</h1><p className="mt-1 text-sm text-white/45">Save ideas worth returning to.</p></div></div><Card className="mt-8 border-white/[0.08] bg-white/[0.04] p-12 text-center"><Bookmark className="mx-auto size-8 text-white/25" /><h2 className="mt-4 font-bold">Your saved stories will live here</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">When you find something worth keeping, bookmark it and come back when you have more time.</p></Card></div></FeedLayout>
}
