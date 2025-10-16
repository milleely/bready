"use client"

import { useEffect, useState } from "react"
import { UserManagement } from "@/components/user-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Download, Settings as SettingsIcon } from "lucide-react"

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-amber-200 rounded-full mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading settings...</p>
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

      {/* Future Features - Placeholder Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Settings - Coming Soon */}
        <Card className="opacity-60 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <Bell className="h-5 w-5" />
              Notification Settings
              <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>
              Configure email and push notifications for expenses and budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center justify-between">
                <span>Email notifications</span>
                <div className="h-5 w-9 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Budget alerts</span>
                <div className="h-5 w-9 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Settlement reminders</span>
                <div className="h-5 w-9 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Data - Coming Soon */}
        <Card className="opacity-60 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <Download className="h-5 w-5" />
              Export Data
              <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>
              Download your expense data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center justify-between">
                <span>Export as CSV</span>
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Export as JSON</span>
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Export as PDF</span>
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
