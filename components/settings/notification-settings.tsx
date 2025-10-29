"use client"

/**
 * Notification Settings Component
 *
 * Manages user notification preferences for budget alerts,
 * settlement reminders, and recurring expense reminders.
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, Mail } from "lucide-react"
import { toast } from "sonner"

interface NotificationPreference {
  id: string
  userId: string
  budgetAlertsEnabled: boolean
  budgetAlertThresholds: string
  settlementRemindersEnabled: boolean
  settlementReminderDays: number
  recurringRemindersEnabled: boolean
  recurringReminderDays: number
  emailEnabled: boolean
}

interface NotificationSettingsProps {
  userId: string
  userEmail?: string | null
}

export function NotificationSettings({ userId, userEmail }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Local state for form inputs
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true)
  const [budgetThresholds, setBudgetThresholds] = useState("75,90,100")
  const [settlementRemindersEnabled, setSettlementRemindersEnabled] = useState(true)
  const [settlementDays, setSettlementDays] = useState(7)
  const [recurringRemindersEnabled, setRecurringRemindersEnabled] = useState(true)
  const [recurringDays, setRecurringDays] = useState(3)
  const [emailEnabled, setEmailEnabled] = useState(true)

  // Fetch user preferences on mount
  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch preferences")

      const data: NotificationPreference | null = await response.json()

      if (data) {
        setPreferences(data)
        setBudgetAlertsEnabled(data.budgetAlertsEnabled)
        setBudgetThresholds(data.budgetAlertThresholds)
        setSettlementRemindersEnabled(data.settlementRemindersEnabled)
        setSettlementDays(data.settlementReminderDays)
        setRecurringRemindersEnabled(data.recurringRemindersEnabled)
        setRecurringDays(data.recurringReminderDays)
        setEmailEnabled(data.emailEnabled)
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error)
      toast.error("Failed to load notification settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          budgetAlertsEnabled,
          budgetAlertThresholds: budgetThresholds,
          settlementRemindersEnabled,
          settlementReminderDays: settlementDays,
          recurringRemindersEnabled,
          recurringReminderDays: recurringDays,
          emailEnabled,
        }),
      })

      if (!response.ok) throw new Error("Failed to save preferences")

      const updatedPreferences: NotificationPreference = await response.json()
      setPreferences(updatedPreferences)

      toast.success("Notification settings saved")
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast.error("Failed to save notification settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Manage how you receive updates about your finances</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive updates about your finances
          {userEmail && (
            <span className="block mt-1 text-stone-600">
              <Mail className="h-3 w-3 inline mr-1" />
              Notifications will be sent to: {userEmail}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="budget-alerts" className="text-base font-medium">
                Budget Alerts
              </Label>
              <p className="text-sm text-stone-600">
                Get notified when you reach spending thresholds
              </p>
            </div>
            <Switch
              id="budget-alerts"
              checked={budgetAlertsEnabled}
              onCheckedChange={setBudgetAlertsEnabled}
            />
          </div>
          {budgetAlertsEnabled && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="budget-thresholds" className="text-sm text-stone-700">
                Alert Thresholds (%)
              </Label>
              <Input
                id="budget-thresholds"
                type="text"
                value={budgetThresholds}
                onChange={(e) => setBudgetThresholds(e.target.value)}
                placeholder="75,90,100"
                className="max-w-xs"
              />
              <p className="text-xs text-stone-500">
                Comma-separated percentages (e.g., "75,90,100")
              </p>
            </div>
          )}
        </div>

        {/* Settlement Reminders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="settlement-reminders" className="text-base font-medium">
                Settlement Reminders
              </Label>
              <p className="text-sm text-stone-600">
                Remind you about pending payments
              </p>
            </div>
            <Switch
              id="settlement-reminders"
              checked={settlementRemindersEnabled}
              onCheckedChange={setSettlementRemindersEnabled}
            />
          </div>
          {settlementRemindersEnabled && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="settlement-days" className="text-sm text-stone-700">
                Remind after (days)
              </Label>
              <Input
                id="settlement-days"
                type="number"
                min={1}
                max={30}
                value={settlementDays}
                onChange={(e) => setSettlementDays(parseInt(e.target.value) || 7)}
                className="max-w-xs"
              />
              <p className="text-xs text-stone-500">
                Send reminder after this many days of inactivity
              </p>
            </div>
          )}
        </div>

        {/* Recurring Expense Reminders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="recurring-reminders" className="text-base font-medium">
                Recurring Expense Reminders
              </Label>
              <p className="text-sm text-stone-600">
                Get notified before recurring expenses are due
              </p>
            </div>
            <Switch
              id="recurring-reminders"
              checked={recurringRemindersEnabled}
              onCheckedChange={setRecurringRemindersEnabled}
            />
          </div>
          {recurringRemindersEnabled && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="recurring-days" className="text-sm text-stone-700">
                Remind before (days)
              </Label>
              <Input
                id="recurring-days"
                type="number"
                min={1}
                max={30}
                value={recurringDays}
                onChange={(e) => setRecurringDays(parseInt(e.target.value) || 3)}
                className="max-w-xs"
              />
              <p className="text-xs text-stone-500">
                Send reminder this many days before due date
              </p>
            </div>
          )}
        </div>

        {/* Email Delivery */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-stone-600">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
