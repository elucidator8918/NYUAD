"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, AlertCircle, Activity } from "lucide-react"
import { motion } from "framer-motion"

interface StatusOverviewProps {
  setActiveAlert: (active: boolean) => void
}

interface StatusData {
  system: string
  activeSensors: number
  totalSensors: number
  minorAnomalies: number
  criticalAlerts: number
  lastUpdated: string
}

export default function StatusOverview({ setActiveAlert }: StatusOverviewProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatusData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/status")
      const data = await response.json()
      setStatusData(data)
      setActiveAlert(data.criticalAlerts > 0)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching status data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatusData()

    // Refresh status data every 15 seconds
    const interval = setInterval(() => {
      fetchStatusData()
    }, 15000)

    return () => clearInterval(interval)
  }, [setActiveAlert])

  // Loading skeleton
  if (loading && !statusData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-100/50 dark:bg-slate-800/50 animate-pulse">
            <CardContent className="p-4 h-24"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!statusData) return null

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
        <Card
          className={`bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 
          shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-800 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">System Status</p>
              <p className="text-2xl font-bold capitalize">{statusData.system}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded-full">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Sensors</p>
              <p className="text-2xl font-bold">
                {statusData.activeSensors}/{statusData.totalSensors}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-800/30 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Minor Anomalies</p>
              <p className="text-2xl font-bold">{statusData.minorAnomalies}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={3}>
        <Card
          className={`${statusData.criticalAlerts > 0 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : ""}
          shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1
          ${statusData.criticalAlerts > 0 ? "animate-pulse" : ""}`}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical Alerts</p>
              <p className="text-2xl font-bold">{statusData.criticalAlerts}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
