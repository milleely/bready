"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { UserManagement } from "@/components/user-management"
import { KeyboardShortcutsCard } from "@/components/keyboard-shortcuts-card"
import { NotificationSettingsPreview } from "@/components/settings/notification-settings-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

export function SettingsPageContent() {
  const { user: clerkUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Find the current user from the household members
  const currentUser = users.find((u) => u.email === clerkUser?.primaryEmailAddress?.emailAddress)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <span className="sr-only">Loading settings</span>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-amber-600" />
            Household Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your household members and preferences
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-800">
          {users.length} / 4 Members
        </Badge>
      </div>

      {/* User Management Section */}
      <UserManagement users={users} onRefresh={fetchUsers} />

      {/* Settings Grid - Keyboard Shortcuts & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keyboard Shortcuts */}
        <KeyboardShortcutsCard />

        {/* Notification Settings */}
        {currentUser && (
          <NotificationSettingsPreview
            userEmail={currentUser.email}
          />
        )}
      </div>
    </div>
  )
}
