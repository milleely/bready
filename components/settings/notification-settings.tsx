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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, Bell, Mail, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface NotificationPreference {
  id: string
  userId: string
  budgetAlertsEnabled: boolean
  budgetAlertThresholds: string
  settlementRemindersEnabled: boolean
  settlementReminderDays: string
  recurringRemindersEnabled: boolean
  recurringReminderDays: string
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
  const [selectedThresholds, setSelectedThresholds] = useState<number[]>([75, 90, 100])
  const [selectedSettlementDays, setSelectedSettlementDays] = useState<string[]>(["first", "last"])
  const [selectedRecurringDays, setSelectedRecurringDays] = useState<string[]>(["1", "3", "7"])
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
        // Parse comma-separated string to number array
        const thresholds = data.budgetAlertThresholds
          .split(',')
          .map(t => parseInt(t.trim()))
          .filter(t => !isNaN(t))
        setSelectedThresholds(thresholds)
        // Parse comma-separated string to day array
        const settlementDays = data.settlementReminderDays
          .split(',')
          .map(d => d.trim())
          .filter(d => d === 'first' || d === 'last')
        setSelectedSettlementDays(settlementDays)
        // Parse comma-separated string to recurring days array
        const recurringDays = data.recurringReminderDays
          .split(',')
          .map(d => d.trim())
          .filter(d => ['1', '3', '7'].includes(d))
        setSelectedRecurringDays(recurringDays)
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
          budgetAlertsEnabled: true,
          budgetAlertThresholds: selectedThresholds.join(','),
          settlementRemindersEnabled: true,
          settlementReminderDays: selectedSettlementDays.join(','),
          recurringRemindersEnabled: true,
          recurringReminderDays: selectedRecurringDays.join(','),
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

  const handleThresholdToggle = (threshold: number, checked: boolean | string) => {
    if (checked) {
      setSelectedThresholds(prev => [...prev, threshold].sort((a, b) => a - b))
    } else {
      setSelectedThresholds(prev => prev.filter(t => t !== threshold))
    }
  }

  const handleSettlementDayToggle = (day: string, checked: boolean | string) => {
    if (checked) {
      setSelectedSettlementDays(prev => [...prev, day])
    } else {
      setSelectedSettlementDays(prev => prev.filter(d => d !== day))
    }
  }

  const handleRecurringDayToggle = (day: string, checked: boolean | string) => {
    if (checked) {
      setSelectedRecurringDays(prev => [...prev, day].sort((a, b) => parseInt(a) - parseInt(b)))
    } else {
      setSelectedRecurringDays(prev => prev.filter(d => d !== day))
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription className="mt-1.5">Manage how you receive updates about your finances</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription className="mt-1.5">
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
          <div>
            <Label className="text-base font-medium">
              Budget Alerts
            </Label>
            <p className="text-sm text-stone-600">
              Get notified when you reach spending thresholds
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-stone-700 block">
              Alert Thresholds (%)
            </Label>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="max-w-xs w-full justify-between bg-white hover:bg-stone-50"
                  >
                    {selectedThresholds.length === 0 ? (
                      <span className="text-stone-500">Select thresholds...</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {selectedThresholds.map(threshold => (
                          <Badge
                            key={threshold}
                            className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
                          >
                            {threshold}%
                          </Badge>
                        ))}
                      </div>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3 bg-white" align="start">
                  <div className="space-y-2">
                    {[75, 90, 100].map(threshold => (
                      <div key={threshold} className="flex items-center gap-2">
                        <Checkbox
                          id={`threshold-${threshold}`}
                          checked={selectedThresholds.includes(threshold)}
                          onCheckedChange={(checked) => handleThresholdToggle(threshold, checked)}
                          className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <Label
                          htmlFor={`threshold-${threshold}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {threshold}%
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-stone-500">
              Select one or more thresholds to receive alerts
            </p>
          </div>
        </div>

        {/* Settlement Reminders */}
        <div className="space-y-3">
          <div>
            <Label className="text-base font-medium">
              Settlement Reminders
            </Label>
            <p className="text-sm text-stone-600">
              Remind you about pending payments
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-stone-700 block">
              Remind on
            </Label>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="max-w-xs w-full justify-between bg-white hover:bg-stone-50"
                  >
                    {selectedSettlementDays.length === 0 ? (
                      <span className="text-stone-500">Select days...</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {selectedSettlementDays.map(day => (
                          <Badge
                            key={day}
                            className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
                          >
                            {day === 'first' ? 'First day' : 'Last day'}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3 bg-white" align="start">
                  <div className="space-y-2">
                    {[
                      { value: 'first', label: 'First day of each month' },
                      { value: 'last', label: 'Last day of each month' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`settlement-${option.value}`}
                          checked={selectedSettlementDays.includes(option.value)}
                          onCheckedChange={(checked) => handleSettlementDayToggle(option.value, checked)}
                          className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <Label
                          htmlFor={`settlement-${option.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-stone-500">
              Send reminders on specific days each month
            </p>
          </div>
        </div>

        {/* Recurring Expense Reminders */}
        <div className="space-y-3">
          <div>
            <Label className="text-base font-medium">
              Recurring Expense Reminders
            </Label>
            <p className="text-sm text-stone-600">
              Get notified before recurring expenses are due
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-stone-700 block">
              Remind before (days)
            </Label>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="max-w-xs w-full justify-between bg-white hover:bg-stone-50"
                  >
                    {selectedRecurringDays.length === 0 ? (
                      <span className="text-stone-500">Select days...</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {selectedRecurringDays.map(day => (
                          <Badge
                            key={day}
                            className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
                          >
                            {day} {day === '1' ? 'day' : 'days'}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3 bg-white" align="start">
                  <div className="space-y-2">
                    {[
                      { value: '1', label: '1 day' },
                      { value: '3', label: '3 days' },
                      { value: '7', label: '7 days' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`recurring-${option.value}`}
                          checked={selectedRecurringDays.includes(option.value)}
                          onCheckedChange={(checked) => handleRecurringDayToggle(option.value, checked)}
                          className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <Label
                          htmlFor={`recurring-${option.value}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-stone-500">
              Send reminder this many days before due date
            </p>
          </div>
        </div>

        {/* Email Delivery */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-3">
            <Checkbox
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={(checked) => setEmailEnabled(checked === true)}
              className="h-5 w-5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <div className="flex-1">
              <Label htmlFor="email-enabled" className="text-base font-medium cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-sm text-stone-600">
                Receive notifications via email
              </p>
            </div>
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
