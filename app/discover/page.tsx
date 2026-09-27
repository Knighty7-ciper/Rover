import { redirect } from "next/navigation"
import { Compass, Flame, Hash, Users, ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/types"

const topics = ["Product design", "Public service", "Leadership", "Climate", "Technology", "Culture"]
const collections = [
  { title: "Ideas in motion", description: "The projects and essays shaping the week on Rover.", count: "128 posts", tone: "from-orange-500/30 to-amber-300/5" },
  { title: "Build in public", description: "Follow the messy, useful process behind ambitious work.", count: "84 posts", tone: "from-violet-500/30 to-fuchsia-300/5" },
  { title: "The field notes", description: "First-hand lessons from people doing the work.", count: "56 posts", tone: "from-cyan-500/25 to-sky-300/5" },
]

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  if (error || !userData.user) redirect("/auth/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  return <FeedLayout profile={profile as Profile | null} currentPath="/discover">
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div><div className="mb-3 flex items-center gap-2 text-[#ff5b22]"><Compass className="size-5" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Discover</span></div><h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Find your next<br /><span className="text-white/40">rabbit hole.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/50">Explore ideas, people, projects, and conversations from across the Rover community.</p></div>
        <Button variant="outline" className="hidden border-white/10 bg-white/[0.04] text-white hover:bg-white/10 sm:flex">View directory <ArrowUpRight className="ml-2 size-4" /></Button>
      </div>
      <div className="mt-10 flex gap-2 overflow-x-auto pb-2">{topics.map((topic) => <Badge key={topic} variant="outline" className="shrink-0 rounded-full border-white/10 bg-white/[0.04] px-4 py-2 text-white/65">{topic}</Badge>)}</div>
      <section className="mt-8"><div className="mb-4 flex items-center gap-2"><Flame className="size-4 text-[#ff5b22]" /><h2 className="font-bold">Trending collections</h2></div><div className="grid gap-4 md:grid-cols-3">{collections.map((collection) => <Card key={collection.title} className={`min-h-44 overflow-hidden border-white/[0.08] bg-gradient-to-br ${collection.tone} p-5`}><div className="flex h-full flex-col justify-between"><div><p className="text-lg font-bold">{collection.title}</p><p className="mt-2 text-sm leading-5 text-white/55">{collection.description}</p></div><p className="text-xs font-semibold text-white/40">{collection.count} <span className="px-1">·</span> Explore collection</p></div></Card>)}</div></section>
      <section className="mt-10 grid gap-4 md:grid-cols-2"><Card className="border-white/[0.08] bg-white/[0.04] p-5"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#ff5b22]/15 text-[#ff5b22]"><Hash className="size-5" /></div><div><h2 className="font-bold">Topics to follow</h2><p className="text-sm text-white/45">Shape your Rover feed</p></div></div><div className="mt-5 flex flex-wrap gap-2">{topics.slice(0, 4).map((topic) => <Button key={topic} variant="secondary" size="sm" className="rounded-full bg-white/10 text-white/70 hover:bg-white/15">+ {topic}</Button>)}</div></Card><Card className="border-white/[0.08] bg-white/[0.04] p-5"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-violet-400/15 text-violet-300"><Users className="size-5" /></div><div><h2 className="font-bold">People worth knowing</h2><p className="text-sm text-white/45">Creators active this week</p></div></div><p className="mt-6 text-sm leading-6 text-white/50">Discover people through their work, not just their follower count.</p><Button asChild variant="link" className="mt-2 px-0 text-[#ff5b22]"><a href="/directory">Browse directory <ArrowUpRight className="ml-1 size-4" /></a></Button></Card></section>
    </div>
  </FeedLayout>
}
