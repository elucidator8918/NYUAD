"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface SensorStatusData {
  name: string
  value: number
  color: string
}

export function SensorStatusChart() {
  const [data, setData] = useState<SensorStatusData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSensorStatus = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/sensors")
        const sensors = await response.json()

        // Count sensors by status
        const statusCounts = sensors.reduce((acc: Record<string, number>, sensor: any) => {
          acc[sensor.status] = (acc[sensor.status] || 0) + 1
          return acc
        }, {})

        // Format data for pie chart
        const chartData = [
          {
            name: "Active",
            value: statusCounts.active || 0,
            color: "#22c55e", // green
          },
          {
            name: "Warning",
            value: statusCounts.warning || 0,
            color: "#eab308", // yellow
          },
          {
            name: "Inactive",
            value: statusCounts.inactive || 0,
            color: "#ef4444", // red
          },
        ]

        setData(chartData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching sensor status data:", error)
        setLoading(false)
      }
    }

    fetchSensorStatus()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchSensorStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <Skeleton className="w-full h-full" />
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          animationDuration={1000}
          animationBegin={200}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} sensors`, "Count"]}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            borderRadius: "8px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  )
}
