"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface AlertFrequencyData {
  name: string
  critical: number
  warning: number
  info: number
}

export function AlertFrequencyChart() {
  const [data, setData] = useState<AlertFrequencyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlertFrequency = async () => {
      try {
        setLoading(true)

        // This would normally come from an API, but we'll simulate it for now
        // In a real app, you'd have an endpoint that returns alert frequency data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate simulated data for the last 7 days
        const simulatedData: AlertFrequencyData[] = []
        const today = new Date()

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)

          simulatedData.push({
            name: date.toLocaleDateString(undefined, { weekday: "short" }),
            critical: Math.floor(Math.random() * 2), // 0-1 critical alerts per day
            warning: Math.floor(Math.random() * 4), // 0-3 warning alerts per day
            info: Math.floor(Math.random() * 5), // 0-4 info alerts per day
          })
        }

        setData(simulatedData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching alert frequency data:", error)
        setLoading(false)
      }
    }

    fetchAlertFrequency()
  }, [])

  if (loading) {
    return <Skeleton className="w-full h-full" />
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            borderRadius: "8px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="critical" name="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="warning" name="Warning" fill="#eab308" radius={[4, 4, 0, 0]} />
        <Bar dataKey="info" name="Info" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
