"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { UserManagement } from "@/components/user-management"
import { KeyboardShortcutsCard } from "@/components/keyboard-shortcuts-card"
import { NotificationSettingsPreview } from "@/components/settings/notification-settings-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
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
        {/* PageHeader skeleton with members badge in actions slot */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="space-y-2 min-w-0 flex-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>

        {/* UserManagement card — header (title + Add User button) + member rows */}
        <div className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="px-6 pb-6 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-col secondary cards: KeyboardShortcuts + NotificationPreview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800 p-6 space-y-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-60" />
              </div>
              <div className="space-y-3 pt-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Your household, your rules."
        actions={
          <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
            {users.length} / 4 members
          </Badge>
        }
      />


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
