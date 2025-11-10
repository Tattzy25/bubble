"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Area, AreaChart } from "recharts"
import { TrendingUp, Server, Users, Package, Code, Activity } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useHealthMonitor } from "@/hooks/use-health-monitor"

// Generate mock historical data for charts
const generateHistoricalData = () => {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000) // Every hour for 24 hours
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      connections: Math.floor(Math.random() * 5) + 1, // 1-5 connections
      uptime: Math.random() > 0.05 ? 100 : Math.floor(Math.random() * 50), // 95% uptime
    })
  }

  return data
}

const chartConfig = {
  responseTime: {
    label: "Response Time (ms)",
    color: "var(--chart-1)",
  },
  connections: {
    label: "Active Connections",
    color: "var(--chart-2)",
  },
  uptime: {
    label: "Uptime %",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartHealthMonitoring() {
  const { healthData, isLoading, isHydrated } = useHealthMonitor()
  const [historicalData] = React.useState(generateHistoricalData())

  const healthStatus = React.useMemo(() => {
    if (healthData.serverHealth === 'operational') return { status: 'Healthy', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' }
    if (healthData.serverHealth === 'degraded') return { status: 'Degraded', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' }
    return { status: 'Down', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' }
  }, [healthData.serverHealth])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Server Health Status Card */}
      <Card className={`border-2 ${healthStatus.bg}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Status</CardTitle>
          <Server className={`h-4 w-4 ${healthStatus.color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${healthStatus.color}`}>
            {healthStatus.status}
          </div>
          <p className="text-xs text-muted-foreground">
            Response: {healthData.responseTime}ms
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              healthData.serverHealth === 'operational' ? 'bg-green-500 animate-pulse' :
              healthData.serverHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-muted-foreground">
              Last checked: {isHydrated ? healthData.lastChecked.toLocaleTimeString() : 'Loading...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Connections Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{healthData.activeConnections}</div>
          <p className="text-xs text-muted-foreground">
            MCP clients connected
          </p>
        </CardContent>
      </Card>

      {/* Components Available Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Components</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{healthData.componentsAvailable}</div>
          <p className="text-xs text-muted-foreground">
            Available in registry
          </p>
        </CardContent>
      </Card>

      {/* Response Time Chart */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Response Time (24h)</CardTitle>
          <CardDescription>
            Server response times over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={historicalData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="responseTime"
                type="natural"
                fill="var(--color-responseTime)"
                fillOpacity={0.4}
                stroke="var(--color-responseTime)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Uptime Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Server Uptime</CardTitle>
          <CardDescription>
            24-hour uptime percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={historicalData.slice(-12)} // Last 12 hours
              margin={{
                left: 0,
                right: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 2)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="uptime" fill="var(--color-uptime)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Activity
          </CardTitle>
          <CardDescription>
            Real-time monitoring dashboard for your website builder MCP server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {healthData.serverHealth === 'operational' ? '99.9%' : '95.2%'}
              </div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {healthData.responseTime}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {healthData.activeConnections}
              </div>
              <div className="text-xs text-muted-foreground">Active Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {healthData.componentsAvailable}
              </div>
              <div className="text-xs text-muted-foreground">Components</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
