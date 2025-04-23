"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface SensorDataPoint {
  time: string
  value: string
}

export default function SensorData() {
  const [data, setData] = useState<SensorDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [anomalyThreshold, setAnomalyThreshold] = useState(42.8)

  const fetchSensorData = async () => {
    try {
      // 10% chance of generating anomaly data
      const hasAnomaly = Math.random() < 0.1
      const response = await fetch(`/api/sensor-data?anomaly=${hasAnomaly}`)
      const data = await response.json()
      setData(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching sensor data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSensorData()

    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchSensorData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading && data.length === 0) {
    return <Skeleton className="w-full h-full" />
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => value.split(":")[0] + ":" + value.split(":")[1]}
        />
        <YAxis domain={[42, 44]} tick={{ fontSize: 10 }} tickFormatter={(value) => value.toFixed(1)} />
        <Tooltip
          formatter={(value) => [`${value} μT`, "Magnetic Field"]}
          labelFormatter={(label) => `Time: ${label}`}
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            borderRadius: "8px",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
        <ReferenceLine
          y={anomalyThreshold}
          stroke="red"
          strokeDasharray="3 3"
          label={{ value: "Anomaly Threshold", position: "insideTopRight", fill: "red", fontSize: 10 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 1 }}
          activeDot={{ r: 5, stroke: "#2563eb", strokeWidth: 2, fill: "#fff" }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
