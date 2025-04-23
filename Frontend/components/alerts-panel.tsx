"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, AlertCircle, CheckCircle, Bell, BellOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Alert {
  id: number
  timestamp: string
  level: string
  message: string
  location: string
  acknowledged: boolean
}

interface AlertsPanelProps {
  extended?: boolean
}

export default function AlertsPanel({ extended = false }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/alerts")
      const data = await response.json()
      setAlerts(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching alerts:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()

    // Refresh alerts every 30 seconds
    const interval = setInterval(() => {
      fetchAlerts()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const acknowledgeAlert = async (id: number) => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "acknowledge", id }),
      })

      // Update local state
      setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert)))

      // Show toast
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been acknowledged and will be archived.",
      })
    } catch (error) {
      console.error("Error acknowledging alert:", error)
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "info":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      default:
        return <Bell className="h-5 w-5 text-slate-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleViewAllAlerts = () => {
    router.push("/alerts")
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-full h-24" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {extended && (
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-medium">Notification Settings</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Switch id="critical-alerts" defaultChecked />
              <Label htmlFor="critical-alerts">Critical Alerts</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="warning-alerts" defaultChecked />
              <Label htmlFor="warning-alerts">Warning Alerts</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="info-alerts" defaultChecked />
              <Label htmlFor="info-alerts">Info Alerts</Label>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {alerts.slice(0, extended ? undefined : 3).map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`
                  ${alert.level === "critical" && !alert.acknowledged ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : ""}
                  ${alert.level === "warning" && !alert.acknowledged ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : ""}
                  transition-all duration-300 hover:shadow-md
                  ${!alert.acknowledged ? "animate-pulse" : ""}
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAlertIcon(alert.level)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{alert.message}</p>
                        <Badge
                          variant={
                            alert.level === "critical"
                              ? "destructive"
                              : alert.level === "warning"
                                ? "default"
                                : "secondary"
                          }
                          className="transition-all duration-300 hover:scale-105"
                        >
                          {alert.level}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                        <span>{formatDate(alert.timestamp)}</span>
                        <span>Location: {alert.location}</span>
                      </div>
                      {!alert.acknowledged && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Acknowledge
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {!extended && alerts.length > 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button
              variant="outline"
              className="w-full transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleViewAllAlerts}
            >
              View All Alerts
            </Button>
          </motion.div>
        )}

        {alerts.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BellOff className="h-8 w-8 mb-2" />
            <p>No alerts to display</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
