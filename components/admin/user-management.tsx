"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Shield, ShieldCheck, ShieldX, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Profile } from "@/lib/types"

interface UserManagementProps {
  users: Profile[]
  currentUserId: string
}

export function UserManagement({ users, currentUserId }: UserManagementProps) {
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleRoleChange = async (userId: string, newRole: "official" | "admin" | "moderator") => {
    if (userId === currentUserId) return
    setUpdating(userId)

    const supabase = createClient()
    await supabase.from("profiles").update({ role: newRole, updated_at: new Date().toISOString() }).eq("id", userId)

    setUpdating(null)
    router.refresh()
  }

  const handleVerify = async (userId: string, verified: boolean) => {
    setUpdating(userId)

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ is_verified: verified, updated_at: new Date().toISOString() })
      .eq("id", userId)

    setUpdating(null)
    router.refresh()
  }

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    moderator: "bg-orange-100 text-orange-700",
    official: "bg-blue-100 text-blue-700",
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const initials =
                user.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.department || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]} variant="secondary">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={updating === user.id || user.id === currentUserId}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "official")}>
                          <Shield className="mr-2 h-4 w-4" />
                          Set as Official
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "moderator")}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Set as Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                          <ShieldX className="mr-2 h-4 w-4" />
                          Set as Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVerify(user.id, !user.is_verified)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {user.is_verified ? "Remove Verification" : "Verify User"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
