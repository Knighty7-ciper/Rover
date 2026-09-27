import { redirect } from "next/navigation"
import { ArrowLeft, ImagePlus, Save, Send, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/lib/types"

export default async function WritePage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  return <FeedLayout profile={profile as Profile | null} currentPath="/write">
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between"><Link href="/feed" className="flex items-center gap-2 text-sm text-white/45 hover:text-white"><ArrowLeft className="size-4" /> Back to home</Link><div className="flex items-center gap-2"><Button variant="ghost" className="text-white/55 hover:bg-white/10 hover:text-white"><Save className="mr-2 size-4" /> Save draft</Button><Button className="bg-[#ff5b22] text-white hover:bg-[#e94f1b]"><Send className="mr-2 size-4" /> Publish</Button></div></div>
      <div className="mt-12"><div className="mb-6 flex items-center gap-2 text-[#ff5b22]"><Sparkles className="size-4" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Create on Rover</span></div><Input placeholder="Title your story" className="h-auto border-0 bg-transparent px-0 text-4xl font-black tracking-tight text-white shadow-none placeholder:text-white/20 focus-visible:ring-0 sm:text-6xl" /><Input placeholder="Add a subtitle that pulls people in..." className="mt-4 h-auto border-0 bg-transparent px-0 text-lg text-white/50 shadow-none placeholder:text-white/20 focus-visible:ring-0" /><div className="mt-8 grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-xl bg-white/[0.06] text-white/45"><ImagePlus className="size-5" /></div><p className="mt-3 text-sm font-semibold text-white/70">Add a cover image</p><p className="mt-1 text-xs text-white/35">Make your story feel unmistakably yours.</p></div></div><Textarea placeholder="Tell the story..." className="mt-8 min-h-[360px] resize-none border-0 bg-transparent px-0 text-lg leading-8 text-white/80 shadow-none placeholder:text-white/20 focus-visible:ring-0" /><div className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-5"><Badge variant="outline" className="border-white/10 bg-white/[0.04] text-white/50">Draft</Badge><Badge variant="outline" className="border-white/10 bg-white/[0.04] text-white/50">Add tags</Badge><span className="text-xs text-white/30">Stories are saved to your library as you write.</span></div></div>
    </div>
  </FeedLayout>
}
