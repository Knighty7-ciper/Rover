import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoverLogo } from "@/components/rover-logo"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-foreground">Check Your Email</CardTitle>
              <CardDescription>We sent a confirmation link to your email address</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-sm text-muted-foreground">
                Click the link in the email to verify your account and access the ROVER platform. This is a one-time
                verification for first-time sign up only.
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">Government Social Platform - Secure & Official</p>
        </div>
      </div>
    </div>
  )
}
