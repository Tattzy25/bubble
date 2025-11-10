"use client"

import { useState, useEffect } from 'react'

interface HealthData {
  serverHealth: 'operational' | 'degraded' | 'down'
  activeConnections: number
  componentsAvailable: number
  projectsCreated: number
  lastChecked: Date
  responseTime: number
}

export function useHealthMonitor() {
  const [healthData, setHealthData] = useState<HealthData>({
    serverHealth: 'operational',
    activeConnections: 1,
    componentsAvailable: 2,
    projectsCreated: 0,
    lastChecked: new Date(),
    responseTime: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const checkHealth = async () => {
    setIsLoading(true)
    setError(null)

    const startTime = Date.now()

    try {
      // Check MCP server health by testing the list_components endpoint
      // This is more reliable than hitting the SSE endpoint directly
      const response = await fetch('http://localhost:8000/list_components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const componentsData = await response.json()
        const componentsCount = Array.isArray(componentsData) ? componentsData.length : 2

        setHealthData({
          serverHealth: 'operational',
          activeConnections: 1, // We'll track this later
          componentsAvailable: componentsCount,
          projectsCreated: 0, // We'll track this later
          lastChecked: new Date(),
          responseTime
        })
      } else {
        setHealthData(prev => ({
          ...prev,
          serverHealth: 'degraded',
          lastChecked: new Date(),
          responseTime
        }))
        setError(`Server responded with status ${response.status}`)
      }
    } catch (err) {
      const responseTime = Date.now() - startTime
      setHealthData(prev => ({
        ...prev,
        serverHealth: 'down',
        lastChecked: new Date(),
        responseTime
      }))
      setError('Unable to connect to MCP server')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Mark as hydrated on client side
    setIsHydrated(true)

    // Initial check
    checkHealth()

    // Set up polling every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    healthData,
    isLoading,
    error,
    isHydrated,
    refreshHealth: checkHealth
  }
}
