"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, AlertTriangle, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import SensorMap from "@/components/sensor-map"
import SensorData from "@/components/sensor-data"
import AlertsPanel from "@/components/alerts-panel"
import StatusOverview from "@/components/status-overview"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertFrequencyChart } from "@/components/alert-frequency-chart"

export default function Dashboard() {
  const [activeAlert, setActiveAlert] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const { toast } = useToast()
  const router = useRouter()

  // Play alert sound when active alert changes to true
  useEffect(() => {
    if (activeAlert && soundEnabled) {
      const audio = new Audio("/alert.mp3")
      audio.play().catch((error) => {
        console.error("Error playing sound:", error)
      })

      // Show toast notification
      toast({
        title: "Alert Detected",
        description: "Anomaly detected in sensor network. Please check alerts tab.",
        variant: "destructive",
      })
    }
  }, [activeAlert, soundEnabled, toast])

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast({
      title: soundEnabled ? "Sound Disabled" : "Sound Enabled",
      description: soundEnabled ? "Alert sounds have been turned off" : "You will now hear sounds for alerts",
    })
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleNotificationsClick = () => {
    router.push("/alerts")
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <motion.header
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">
            Quantum Sensing Early Warning System
          </h1>
          <p className="text-muted-foreground">Team 16 Open Space - NYUAD Hackathon</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {activeAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Link href="/alerts">
                  <Badge variant="destructive" className="animate-pulse flex items-center gap-1 cursor-pointer">
                    <AlertTriangle className="h-3 w-3" />
                    Active Alert
                  </Badge>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleSound}>
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{soundEnabled ? "Disable alert sounds" : "Enable alert sounds"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="icon" onClick={handleNotificationsClick}>
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleSettingsClick}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatusOverview setActiveAlert={setActiveAlert} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sensors">Sensor Network</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Magnetic Field Anomalies</CardTitle>
                    <CardDescription>Real-time quantum sensor readings</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <SensorData />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Alert Frequency</CardTitle>
                    <CardDescription>Alerts by type over the past week</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <AlertFrequencyChart />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Recent Alerts</CardTitle>
                    <CardDescription>Detected anomalies and warnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertsPanel />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="sensors">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Quantum Sensor Network</CardTitle>
                  <CardDescription>Detailed view of all deployed quantum sensors and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <SensorMap detailed />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Quantum ML Analysis</CardTitle>
                  <CardDescription>Advanced analytics from quantum machine learning algorithms</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-12">
                    Quantum ML analytics visualization coming soon
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="alerts">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Alert History & Configuration</CardTitle>
                  <CardDescription>View past alerts and configure notification settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertsPanel extended />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.footer
        className="text-center text-sm text-muted-foreground pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p>© 2025 NYUAD Hackathon Team 16 - Quantum Sensing for Earthquake Detection</p>
      </motion.footer>
    </div>
  )
}
