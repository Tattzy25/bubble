"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Copy, Download, Trash2, Activity } from "lucide-react"
import { useHealthMonitor } from "@/hooks/use-health-monitor"

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  source: string
  details?: any
}

export function RealTimeLogs() {
  const { healthData, isLoading, error } = useHealthMonitor()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Add log entry function
  const addLog = (level: LogEntry['level'], message: string, source: string, details?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      level,
      message,
      source,
      details
    }

    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 1000) // Keep last 1000 entries
      return updated
    })
  }

  // Health monitoring logs
  useEffect(() => {
    if (healthData.lastChecked) {
      addLog(
        healthData.serverHealth === 'operational' ? 'success' : 'error',
        `Health check: ${healthData.serverHealth} (${healthData.responseTime}ms)`,
        'Health Monitor',
        {
          responseTime: healthData.responseTime,
          components: healthData.componentsAvailable,
          connections: healthData.activeConnections
        }
      )
    }
  }, [healthData])

  // Error logs
  useEffect(() => {
    if (error) {
      addLog('error', `Connection error: ${error}`, 'Health Monitor')
    }
  }, [error])

  // Initial logs
  useEffect(() => {
    addLog('info', 'Dashboard initialized', 'System')
    addLog('info', 'Health monitoring started', 'Health Monitor')
    addLog('info', 'Real-time logging active', 'System')
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const copyLogs = () => {
    const logText = logs.map(log =>
      `[${log.timestamp.toLocaleTimeString()}] ${log.level.toUpperCase()} [${log.source}] ${log.message}`
    ).join('\n')

    navigator.clipboard.writeText(logText)
    addLog('info', 'Logs copied to clipboard', 'User Action')
  }

  const downloadLogs = () => {
    const logText = logs.map(log =>
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()} [${log.source}] ${log.message}${log.details ? ` | ${JSON.stringify(log.details)}` : ''}`
    ).join('\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `website-builder-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addLog('info', 'Logs downloaded', 'User Action')
  }

  const clearLogs = () => {
    setLogs([])
    addLog('info', 'Logs cleared', 'User Action')
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-950'
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'success': return 'text-green-600 bg-green-50 dark:bg-green-950'
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
    }
  }

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'success': return 'default'
      default: return 'outline'
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time System Logs
          </CardTitle>
          <CardDescription>
            Live monitoring of MCP server, health checks, and system events
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={autoScroll ? 'bg-primary/10' : ''}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={copyLogs}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div
          ref={scrollAreaRef}
          className="h-full px-6 overflow-y-auto"
          style={{ maxHeight: '500px' }}
        >
          <div className="space-y-2 pb-4">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs yet. System activity will appear here.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getLevelColor(log.level)}`}
                >
                  <Badge variant={getLevelBadge(log.level)} className="text-xs font-mono">
                    {log.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.source}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 break-words">{log.message}</p>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Show details
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      <div className="border-t px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{logs.length} log entries</span>
          <span>Last updated: {logs[0]?.timestamp.toLocaleTimeString() || 'Never'}</span>
        </div>
      </div>
    </Card>
  )
}
