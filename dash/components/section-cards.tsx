"use client"

import { IconServer, IconUsers, IconPackage, IconCode, IconRefresh } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useHealthMonitor } from "@/hooks/use-health-monitor"

export function SectionCards() {
  const { healthData, isLoading, error, isHydrated, refreshHealth } = useHealthMonitor()

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-lg">Server Health</CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums @[250px]/card:text-5xl">
            <span className={`inline-block w-6 h-6 rounded-full mr-3 animate-pulse ${
              healthData.serverHealth === 'operational' ? 'bg-green-500' :
              healthData.serverHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></span>
            {healthData.serverHealth === 'operational' ? 'Operational' :
             healthData.serverHealth === 'degraded' ? 'Degraded' : 'Down'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <IconServer className="w-5 h-5 mr-2" />
              MCP Server
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-lg">
          <div className="flex gap-3 font-semibold text-xl">
            {healthData.serverHealth === 'operational' ? '✅ All systems running' :
             healthData.serverHealth === 'degraded' ? '⚠️ Partial service' : '❌ Service unavailable'}
            <IconServer className="size-6" />
          </div>
          <div className="text-muted-foreground text-lg">
            Response: {healthData.responseTime}ms • Last check: {isHydrated ? healthData.lastChecked.toLocaleTimeString() : 'Loading...'}
          </div>
          {error && (
            <div className="text-red-600 text-lg font-semibold mt-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              🚨 Error: {error}
            </div>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-lg">Active Connections</CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums @[250px]/card:text-5xl">
            {healthData.activeConnections}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <IconUsers className="w-5 h-5 mr-2" />
              MCP Clients
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-lg">
          <div className="flex gap-3 font-semibold text-xl">
            🔗 Connected AI assistants & tools
            <IconUsers className="size-6" />
          </div>
          <div className="text-muted-foreground text-lg">
            Real-time component access via SSE
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-lg">Components Available</CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums @[250px]/card:text-5xl">
            {healthData.componentsAvailable}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <IconPackage className="w-5 h-5 mr-2" />
              Registry
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-lg">
          <div className="flex gap-3 font-semibold text-xl">
            📦 From 60+ component libraries
            <IconPackage className="size-6" />
          </div>
          <div className="text-muted-foreground text-lg">
            Hero sections, navigation, forms, etc.
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-lg">Projects Created</CardDescription>
          <CardTitle className="text-4xl font-bold tabular-nums @[250px]/card:text-5xl">
            {healthData.projectsCreated}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-lg px-3 py-1">
              <IconCode className="w-5 h-5 mr-2" />
              Drag & Drop
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-lg">
          <div className="flex gap-3 font-semibold text-xl">
            🚀 Websites built via visual editor
            <IconCode className="size-6" />
          </div>
          <div className="text-muted-foreground text-lg">
            Auto-generates production HTML/CSS/JS
          </div>
        </CardFooter>
      </Card>

      {/* Manual Refresh Button */}
      <div className="col-span-full flex justify-center mt-4">
        <Button
          onClick={refreshHealth}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <IconRefresh className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Checking...' : 'Refresh Health Data'}
        </Button>
      </div>
    </div>
  )
}
