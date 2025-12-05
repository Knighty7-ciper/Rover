import type React from "react"
import { RoverLogo } from "@/components/rover-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, LayoutDashboard, Users, FileText, Flag, Settings, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/lib/types"

interface AdminLayoutProps {
  children: React.ReactNode
  profile: Profile
  currentPath?: string
}

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/audit", label: "Audit Logs", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminLayout({ children, profile, currentPath = "/admin" }: AdminLayoutProps) {
  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "A"

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-primary text-primary-foreground">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <RoverLogo className="h-8 w-8 text-primary-foreground" />
              <span className="text-lg font-bold">ROVER Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/feed">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Platform
              </Button>
            </Link>
            <Avatar className="h-8 w-8 border border-primary-foreground/20">
              <AvatarFallback className="bg-primary-foreground text-primary text-xs">{initials}</AvatarFallback>
            </Avatar>
            <form action="/auth/signout" method="post">
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-14 h-[calc(100svh-3.5rem)] w-64 shrink-0 border-r border-border bg-card p-4">
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
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
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
