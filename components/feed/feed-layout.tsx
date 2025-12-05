import type React from "react"
import { RoverLogo } from "@/components/rover-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Search, Bell, Home, MessageSquare, Users, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/lib/types"

interface FeedLayoutProps {
  children: React.ReactNode
  profile: Profile | null
  currentPath?: string
}

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/projects", label: "Projects", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function FeedLayout({ children, profile, currentPath = "/feed" }: FeedLayoutProps) {
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/feed" className="flex items-center gap-2">
              <RoverLogo className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold text-primary">ROVER</span>
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search posts, people..." className="w-64 bg-muted/50 pl-9" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 border-r border-border bg-card p-4 md:block">
          {/* Profile Summary */}
          <div className="mb-6 flex flex-col items-center rounded-lg bg-muted/30 p-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
            </Avatar>
            <h3 className="mt-3 font-semibold text-foreground">{profile?.full_name || "User"}</h3>
            <p className="text-sm text-muted-foreground">{profile?.title || "Official"}</p>
            <p className="text-xs text-muted-foreground">{profile?.department}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">{children}</main>

        {/* Right Sidebar - Trending/Suggestions */}
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-72 shrink-0 p-4 lg:block">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 font-semibold text-foreground">Trending Topics</h3>
            <div className="space-y-3">
              {["#BudgetReview2025", "#InfrastructureUpdate", "#PublicHealth"].map((tag) => (
                <div key={tag} className="text-sm">
                  <p className="font-medium text-primary">{tag}</p>
                  <p className="text-xs text-muted-foreground">24 posts</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 font-semibold text-foreground">Suggested Connections</h3>
            <div className="space-y-3">
              {[
                { name: "Jane Mwangi", dept: "Finance" },
                { name: "Peter Ochieng", dept: "Health" },
              ].map((person) => (
                <div key={person.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-xs">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">{person.name}</p>
                    <p className="text-xs text-muted-foreground">{person.dept}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
