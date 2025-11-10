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
    const baseUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000'

    try {
      // MULTIPLE HEALTH CHECKS - No silent fallbacks

      // 1. Basic connectivity check
      console.log(`🔍 Checking connectivity to ${baseUrl}`)
      const pingResponse = await fetch(`${baseUrl}/health/ping`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (!pingResponse.ok) {
        throw new Error(`Ping failed: ${pingResponse.status} ${pingResponse.statusText}`)
      }

      const pingData = await pingResponse.json()
      if (pingData.status !== 'pong') {
        throw new Error(`Invalid ping response: ${JSON.stringify(pingData)}`)
      }

      console.log('✅ Ping check passed')

      // 2. Comprehensive health check
      console.log('🔍 Checking comprehensive health')
      const healthResponse = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`)
      }

      const healthData = await healthResponse.json()
      if (healthData.status !== 'healthy') {
        throw new Error(`Server reported unhealthy: ${healthData.message || 'Unknown error'}`)
      }

      console.log('✅ Health check passed')

      // 3. Component API check
      console.log('🔍 Checking component API')
      const componentsResponse = await fetch(`${baseUrl}/list_components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!componentsResponse.ok) {
        throw new Error(`Component API failed: ${componentsResponse.status} ${componentsResponse.statusText}`)
      }

      const componentsData = await componentsResponse.json()
      if (componentsData.status !== 'success') {
        throw new Error(`Component API error: ${componentsData.message || 'Invalid response'}`)
      }

      const componentsCount = componentsData.count || 0
      if (componentsCount < 1) {
        throw new Error(`No components available: ${componentsCount} found`)
      }

      console.log(`✅ Component check passed: ${componentsCount} components`)

      // 4. Detailed system check (optional, doesn't fail if unavailable)
      let systemInfo = null
      try {
        console.log('🔍 Checking detailed system info')
        const detailedResponse = await fetch(`${baseUrl}/health/detailed`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        })

        if (detailedResponse.ok) {
          systemInfo = await detailedResponse.json()
          console.log('✅ Detailed check passed')
        }
      } catch (detailedError) {
        console.warn('⚠️ Detailed check failed, but continuing:', detailedError)
        // Don't fail the entire health check for detailed info
      }

      const responseTime = Date.now() - startTime

      // ALL CHECKS PASSED - Server is healthy
      setHealthData({
        serverHealth: 'operational',
        activeConnections: 1,
        componentsAvailable: componentsCount,
        projectsCreated: 0,
        lastChecked: new Date(),
        responseTime
      })

      console.log(`🎉 All health checks passed in ${responseTime}ms`)

    } catch (err) {
      const responseTime = Date.now() - startTime
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      console.error(`❌ Health check failed: ${errorMessage}`)

      setHealthData(prev => ({
        ...prev,
        serverHealth: 'down',
        lastChecked: new Date(),
        responseTime
      }))

      setError(`CRITICAL: ${errorMessage}`)
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
