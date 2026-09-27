import type React from "react"
import { RoverLogo } from "@/components/rover-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Bell, Home, MessageSquare, Users, BarChart3, Settings, Search as SearchIcon, Compass, PenLine, Bookmark, UserRound } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { TrendingTopics } from "./trending-topics"
import { SuggestedConnections } from "./suggested-connections"
import { SearchInput } from "@/components/search/search-input"
import type { Profile } from "@/lib/types"

interface FeedLayoutProps {
  children: React.ReactNode
  profile: Profile | null
  currentPath?: string
}

const navItems = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/write", label: "Write", icon: PenLine },
  { href: "/projects", label: "Projects", icon: BarChart3 },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function FeedLayout({ children, profile, currentPath = "/feed" }: FeedLayoutProps) {
  const supabase = createClient()

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <div className="min-h-svh bg-[#0b0b0c] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0b0b0c]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
          <Link href="/feed" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff5b22] shadow-[0_8px_24px_rgba(255,91,34,.24)]">
              <RoverLogo className="h-6 w-6 text-white" />
            </span>
            <span className="text-xl font-black tracking-[0.2em] text-white">ROVER</span>
          </Link>
          <div className="hidden w-full max-w-md md:block"><SearchInput placeholder="Search people, posts, ideas..." className="w-full" showSuggestions={true} /></div>
          <div className="flex items-center gap-2">
            <Link href="/notifications"><Button variant="ghost" size="icon" className="relative text-white/60 hover:bg-white/10 hover:text-white"><Bell className="h-5 w-5" /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff5b22]" /></Button></Link>
            <form action="/auth/signout" method="post"><Button variant="ghost" size="icon" type="submit" className="text-white/60 hover:bg-white/10 hover:text-white"><LogOut className="h-5 w-5" /></Button></form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-[72px] hidden h-[calc(100svh-72px)] w-[250px] shrink-0 border-r border-white/[0.08] p-5 md:block">
          <div className="mb-7 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
            <Avatar className="h-11 w-11 border-2 border-[#ff5b22]"><AvatarFallback className="bg-[#ff5b22] text-white">{initials}</AvatarFallback></Avatar>
            <div className="min-w-0"><h3 className="truncate text-sm font-semibold">{profile?.full_name || "User"}</h3><p className="truncate text-xs text-white/45">{profile?.title || "Rover member"}</p></div>
          </div>
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Explore</p>
          <nav className="space-y-1">
            {navItems.map((item) => { const isActive = currentPath === item.href; return <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? "bg-[#ff5b22] text-white shadow-[0_8px_24px_rgba(255,91,34,.18)]" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}><item.icon className="h-[18px] w-[18px]" />{item.label}</Link> })}
          </nav>
          <div className="mt-8 rounded-2xl border border-[#ff5b22]/25 bg-[#ff5b22]/10 p-4"><p className="text-sm font-semibold">Make your mark.</p><p className="mt-1 text-xs leading-5 text-white/50">Share what you are building with the Rover community.</p><Link href="/write"><Button className="mt-4 h-9 w-full rounded-lg bg-[#ff5b22] text-xs font-bold text-white hover:bg-[#e94f1b]">Start writing</Button></Link></div>
        </aside>

        <main className="min-w-0 flex-1 bg-[#0b0b0c] px-4 py-6 sm:px-6 lg:px-10">{children}</main>

        <aside className="sticky top-[72px] hidden h-[calc(100svh-72px)] w-[300px] shrink-0 space-y-5 p-5 xl:block">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="text-xs font-semibold text-white/45">Your library</p><div className="mt-3 flex flex-col gap-2"><Link href="/bookmarks" className="flex items-center gap-2 text-sm text-white/65 hover:text-white"><Bookmark className="size-4" /> Bookmarks</Link><Link href={profile ? `/profile/${profile.id}` : "/feed"} className="flex items-center gap-2 text-sm text-white/65 hover:text-white"><UserRound className="size-4" /> Your profile</Link></div></div>
          <TrendingTopics userId={profile?.id || ""} />
          {profile && <SuggestedConnections userId={profile.id} />}
        </aside>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-white/[0.08] bg-[#0b0b0c]/95 px-2 py-2 backdrop-blur-xl md:hidden">
        {navItems.slice(0, 5).map((item) => { const isActive = currentPath === item.href; return <Link key={item.href} href={item.href} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] ${isActive ? "text-[#ff5b22]" : "text-white/45"}`}><item.icon className="size-5" />{item.label}</Link> })}
      </nav>
    </div>
  )
}
