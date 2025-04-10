import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <SettingsForm />
    </div>
  )
}
