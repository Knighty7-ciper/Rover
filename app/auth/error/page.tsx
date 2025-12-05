import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoverLogo } from "@/components/rover-logo"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <RoverLogo className="h-16 w-16 text-primary" />
            <span className="text-2xl font-bold tracking-wide text-primary">ROVER</span>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-foreground">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-sm text-muted-foreground">
                {params?.error || "An error occurred during authentication. Please try again."}
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
