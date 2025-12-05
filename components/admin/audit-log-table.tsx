import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { AuditLog } from "@/lib/types"

interface AuditLogTableProps {
  logs: AuditLog[]
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-slate-100 text-slate-700",
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const initials =
              log.user?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"

            const actionType = log.action.split("_")[0]

            return (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{log.user?.full_name || "System"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={actionColors[actionType] || "bg-slate-100 text-slate-700"} variant="secondary">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {log.entity_type}
                  {log.entity_id && (
                    <span className="text-xs text-muted-foreground ml-1">({log.entity_id.slice(0, 8)}...)</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {JSON.stringify(log.details)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
              </TableRow>
            )
          })}
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No audit logs yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
