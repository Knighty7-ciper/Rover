import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoverLogo } from "@/components/rover-logo"

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo and branding */}
          <div className="flex flex-col items-center gap-3">
            <RoverLogo className="h-16 w-16 text-primary" />
            <span className="text-2xl font-bold tracking-wide text-primary">ROVER</span>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">Government Social Platform - Secure & Official</p>
        </div>
      </div>
    </div>
  )
}
