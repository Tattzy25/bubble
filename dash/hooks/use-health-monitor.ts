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

    // Use Railway URL if available, otherwise localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000'

    try {
      // Check MCP server health using the same endpoint Railway uses
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        // Server is healthy, now get component count
        try {
          const componentsResponse = await fetch(`${baseUrl}/list_components`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
          })

          let componentsCount = 2 // fallback
          if (componentsResponse.ok) {
            const componentsData = await componentsResponse.json()
            componentsCount = componentsData.count || 2
          }

          setHealthData({
            serverHealth: 'operational',
            activeConnections: 1, // We'll track this later
            componentsAvailable: componentsCount,
            projectsCreated: 0, // We'll track this later
            lastChecked: new Date(),
            responseTime
          })
        } catch (componentError) {
          // Health check passed but component count failed - still operational
          setHealthData({
            serverHealth: 'operational',
            activeConnections: 1,
            componentsAvailable: 2,
            projectsCreated: 0,
            lastChecked: new Date(),
            responseTime
          })
        }
      } else {
        setHealthData(prev => ({
          ...prev,
          serverHealth: 'down',
          lastChecked: new Date(),
          responseTime
        }))
        setError(`Health check failed: ${response.status}`)
      }
    } catch (err) {
      const responseTime = Date.now() - startTime
      setHealthData(prev => ({
        ...prev,
        serverHealth: 'down',
        lastChecked: new Date(),
        responseTime
      }))
      setError(`Unable to connect to MCP server: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
