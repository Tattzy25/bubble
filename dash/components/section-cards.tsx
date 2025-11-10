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
          <CardDescription>Server Health</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 animate-pulse ${
              healthData.serverHealth === 'operational' ? 'bg-green-500' :
              healthData.serverHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></span>
            {healthData.serverHealth === 'operational' ? 'Operational' :
             healthData.serverHealth === 'degraded' ? 'Degraded' : 'Down'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconServer className="w-4 h-4 mr-1" />
              MCP Server
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {healthData.serverHealth === 'operational' ? 'All systems running' :
             healthData.serverHealth === 'degraded' ? 'Partial service' : 'Service unavailable'}
            <IconServer className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Response: {healthData.responseTime}ms • Last check: {isHydrated ? healthData.lastChecked.toLocaleTimeString() : 'Loading...'}
          </div>
          {error && (
            <div className="text-red-500 text-xs mt-1">
              Error: {error}
            </div>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Connections</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {healthData.activeConnections}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers className="w-4 h-4 mr-1" />
              MCP Clients
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Connected AI assistants & tools <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Real-time component access via SSE
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Components Available</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {healthData.componentsAvailable}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage className="w-4 h-4 mr-1" />
              Registry
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            From 60+ component libraries <IconPackage className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Hero sections, navigation, forms, etc.
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Projects Created</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {healthData.projectsCreated}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCode className="w-4 h-4 mr-1" />
              Drag & Drop
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Websites built via visual editor <IconCode className="size-4" />
          </div>
          <div className="text-muted-foreground">
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
