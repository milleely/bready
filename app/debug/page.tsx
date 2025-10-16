"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, LayoutDashboard, RefreshCw } from "lucide-react"

export default function DebugPage() {
  const router = useRouter()
  const [currentLayout, setCurrentLayout] = useState<'v1' | 'v2' | 'auto'>('auto')
  const [envVariable, setEnvVariable] = useState<boolean>(false)

  useEffect(() => {
    // Check cookie
    const layoutCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('layout-version='))
      ?.split('=')[1]

    if (layoutCookie === 'v1') {
      setCurrentLayout('v1')
    } else if (layoutCookie === 'v2') {
      setCurrentLayout('v2')
    } else {
      setCurrentLayout('auto')
    }

    // Check env variable
    setEnvVariable(process.env.NEXT_PUBLIC_USE_NEW_LAYOUT === 'true')
  }, [])

  const setLayoutVersion = (version: 'v1' | 'v2' | 'auto') => {
    if (version === 'auto') {
      // Clear cookie
      document.cookie = 'layout-version=; path=/; max-age=0'
    } else {
      // Set cookie for 30 days
      const expires = new Date()
      expires.setDate(expires.getDate() + 30)
      document.cookie = `layout-version=${version}; path=/; expires=${expires.toUTCString()}`
    }
    setCurrentLayout(version)
  }

  const handleApplyAndGo = (version: 'v1' | 'v2') => {
    setLayoutVersion(version)
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-amber-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Debug Settings</h1>
            <p className="text-sm text-gray-600">Toggle between old and new layout</p>
          </div>
        </div>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Environment Variable</p>
                <p className="text-sm text-gray-600">NEXT_PUBLIC_USE_NEW_LAYOUT</p>
              </div>
              <Badge variant={envVariable ? "default" : "secondary"}>
                {envVariable ? "Enabled (v2)" : "Disabled (v1)"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Cookie Override</p>
                <p className="text-sm text-gray-600">layout-version cookie</p>
              </div>
              <Badge variant={currentLayout === 'auto' ? "outline" : "default"}>
                {currentLayout === 'auto' ? 'Not Set' : currentLayout.toUpperCase()}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Active Layout</p>
                <Badge variant="default" className="text-base px-3 py-1">
                  {currentLayout === 'auto'
                    ? (envVariable ? 'V2 (New Sidebar)' : 'V1 (Old Dashboard)')
                    : currentLayout === 'v2'
                    ? 'V2 (New Sidebar)'
                    : 'V1 (Old Dashboard)'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toggle Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>Layout Controls</CardTitle>
            <CardDescription>
              Set a cookie to override the default layout. This is useful for testing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Toggle Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={currentLayout === 'v1' ? "default" : "outline"}
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => handleApplyAndGo('v1')}
              >
                <span className="text-lg font-semibold">Old Layout (V1)</span>
                <span className="text-xs opacity-80">Single page dashboard</span>
              </Button>

              <Button
                variant={currentLayout === 'v2' ? "default" : "outline"}
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => handleApplyAndGo('v2')}
              >
                <span className="text-lg font-semibold">New Layout (V2)</span>
                <span className="text-xs opacity-80">Sidebar navigation</span>
              </Button>
            </div>

            {/* Clear Override Button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setLayoutVersion('auto')
                  router.refresh()
                }}
                disabled={currentLayout === 'auto'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Override (Use Default)
              </Button>
              {currentLayout === 'auto' && (
                <p className="text-xs text-gray-600 mt-2 text-center">
                  No cookie override set. Using environment variable default.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How This Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <p><strong>Priority Order:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Cookie override (set on this page)</li>
              <li>Environment variable (NEXT_PUBLIC_USE_NEW_LAYOUT)</li>
              <li>Default (V1 old layout)</li>
            </ol>
            <p className="pt-2">
              <strong>To test on production:</strong> Set the environment variable in Vercel dashboard
              to enable the new layout for all users.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/')}
          >
            Go to Home
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard (V2)
          </Button>
        </div>
      </div>
    </div>
  )
}
