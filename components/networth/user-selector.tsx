"use client"

/**
 * User Selector Component
 *
 * Allows selecting which household member to view net worth for.
 * Displays user avatars with colors for easy identification.
 */

import { Card, CardContent } from "@/components/ui/card"
import { User } from "@prisma/client"

interface UserSelectorProps {
  users: User[]
  selectedUserId: string | null
  onSelectUser: (userId: string) => void
}

export function UserSelector({ users, selectedUserId, onSelectUser }: UserSelectorProps) {
  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">Select Household Member</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Choose whose net worth you'd like to view
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200
                ${
                  selectedUserId === user.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md"
                    : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-stone-700 dark:hover:bg-stone-900"
                }
              `}
            >
              {/* User Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* User Name */}
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{user.name}</span>

              {/* Selected Indicator */}
              {selectedUserId === user.id && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Selected</span>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
