import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { PrivacySettings } from "@/components/settings/privacy-settings"
import { AccountSettings } from "@/components/settings/account-settings"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <SettingsLayout>
        <ProfileSettings initialProfile={profile} />
        <NotificationSettings userId={user.id} />
        <PrivacySettings userId={user.id} />
        <AccountSettings user={user} />
      </SettingsLayout>
    </div>
  )
}
