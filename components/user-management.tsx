"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserForm } from "@/components/user-form"
import { Edit, Trash2, Users as UsersIcon } from "lucide-react"

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

interface UserManagementProps {
  users: User[]
  onRefresh: () => Promise<void>
}

export function UserManagement({ users, onRefresh }: UserManagementProps) {
  const [editingUser, setEditingUser] = useState<User | undefined>()

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (response.ok) {
      await onRefresh()
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to add user')
      throw new Error(error.error)
    }
  }

  const handleEditUser = async (userData: Omit<User, 'id'>) => {
    if (!editingUser) return

    const response = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (response.ok) {
      setEditingUser(undefined)
      await onRefresh()
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to update user')
      throw new Error(error.error)
    }
  }

  const handleDeleteUser = async (user: User) => {
    const confirmMessage = `Are you sure you want to delete ${user.name}? This will also delete all their expenses. This action cannot be undone.`

    if (!confirm(confirmMessage)) return

    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      const result = await response.json()
      alert(result.message)
      await onRefresh()
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to delete user')
    }
  }

  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription className="mt-1.5">
              Manage household members ({users.length} active)
            </CardDescription>
          </div>
          <UserForm onSubmit={handleAddUser} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white/60 backdrop-blur-sm border-2 border-golden-crust-primary/40 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-golden-crust-dark truncate">{user.name}</p>
                    {user.email && (
                      <p className="text-sm text-golden-crust-dark/70 truncate">{user.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                    className="h-11 w-11 hover:bg-amber-100 text-golden-crust-dark"
                    aria-label={`Edit ${user.name}`}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user)}
                    className="h-11 w-11 hover:bg-red-100 text-red-600 hover:text-red-700"
                    aria-label={`Delete ${user.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {editingUser && (
          <UserForm
            user={editingUser}
            onSubmit={handleEditUser}
            trigger={<Button className="hidden" />}
          />
        )}
      </CardContent>
    </Card>
  )
}
