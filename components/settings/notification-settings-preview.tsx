"use client"

/**
 * Notification Settings Preview Component (Coming Soon)
 *
 * Non-functional preview of notification settings UI.
 * Shows the interface but all controls are disabled until domain verification is complete.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, Mail, ChevronDown, AlertCircle } from "lucide-react"

interface NotificationSettingsPreviewProps {
  userEmail?: string | null
}

export function NotificationSettingsPreview({ userEmail }: NotificationSettingsPreviewProps) {
  // Static preview values
  const selectedThresholds = [75, 90, 100]
  const selectedSettlementDays = ["first", "last"]
  const selectedRecurringDays = ["1", "3", "7"]

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
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
        {/* Coming Soon Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Coming Soon</p>
              <p className="text-sm text-amber-800 mt-1">
                This is a preview of the notification settings interface.
              </p>
            </div>
          </div>
        </div>

        {/* Budget Alerts */}
        <div className="space-y-3 opacity-60 pointer-events-none">
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
                    disabled
                  >
                    <div className="flex gap-1 flex-wrap">
                      {selectedThresholds.map(threshold => (
                        <Badge
                          key={threshold}
                          className="bg-amber-100 text-amber-800 border-amber-200"
                        >
                          {threshold}%
                        </Badge>
                      ))}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
              </Popover>
            </div>
            <p className="text-xs text-stone-500">
              Select one or more thresholds to receive alerts
            </p>
          </div>
        </div>

        {/* Settlement Reminders */}
        <div className="space-y-3 opacity-60 pointer-events-none">
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
                    disabled
                  >
                    <div className="flex gap-1 flex-wrap">
                      {selectedSettlementDays.map(day => (
                        <Badge
                          key={day}
                          className="bg-amber-100 text-amber-800 border-amber-200"
                        >
                          {day === 'first' ? 'First day' : 'Last day'}
                        </Badge>
                      ))}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
              </Popover>
            </div>
            <p className="text-xs text-stone-500">
              Send reminders on specific days each month
            </p>
          </div>
        </div>

        {/* Recurring Expense Reminders */}
        <div className="space-y-3 opacity-60 pointer-events-none">
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
                    disabled
                  >
                    <div className="flex gap-1 flex-wrap">
                      {selectedRecurringDays.map(day => (
                        <Badge
                          key={day}
                          className="bg-amber-100 text-amber-800 border-amber-200"
                        >
                          {day} {day === '1' ? 'day' : 'days'}
                        </Badge>
                      ))}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
              </Popover>
            </div>
            <p className="text-xs text-stone-500">
              Send reminder this many days before due date
            </p>
          </div>
        </div>

        {/* Email Delivery */}
        <div className="space-y-3 pt-4 border-t opacity-60 pointer-events-none">
          <div className="flex items-center gap-3">
            <Checkbox
              id="email-enabled"
              checked={true}
              disabled
              className="h-5 w-5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <div className="flex-1">
              <Label htmlFor="email-enabled" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-stone-600">
                Receive notifications via email
              </p>
            </div>
          </div>
        </div>

        {/* Disabled Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            disabled
            className="bg-amber-600 hover:bg-amber-700 text-white opacity-50 cursor-not-allowed"
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
