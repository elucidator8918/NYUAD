import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, AlertCircle, CheckCircle, Bell } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AlertsPage() {
  return (
    <main className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Alerts Management</h1>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Alerts</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Multiple sensors reporting significant magnetic field changes</p>
                    <Badge variant="destructive">critical</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                    <span>2025-04-23 04:05:11</span>
                    <span>Location: Region-wide</span>
                  </div>
                  <div className="mt-2">
                    <Button size="sm" variant="outline">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Magnetic field anomaly detected in Sensor B1</p>
                    <Badge variant="default">warning</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                    <span>2025-04-22 14:32:15</span>
                    <span>Location: 24.4851, 54.4346</span>
                  </div>
                  <div className="mt-2">
                    <Button size="sm" variant="outline">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Past alerts and their resolutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Minor fluctuation in quantum entanglement stability</p>
                        <Badge variant="secondary">info</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                        <span>2025-04-22 10:17:42</span>
                        <span>Location: 24.5133, 54.3773</span>
                        <span className="text-emerald-500">Resolved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Sensor C3 maintenance completed</p>
                        <Badge variant="secondary">info</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                        <span>2025-04-21 18:42:33</span>
                        <span>Location: 24.4992, 54.4346</span>
                        <span className="text-emerald-500">Resolved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Temporary loss of quantum coherence in Sensor A2</p>
                        <Badge variant="secondary">warning</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-4">
                        <span>2025-04-20 09:11:27</span>
                        <span>Location: 24.4851, 54.3773</span>
                        <span className="text-emerald-500">Resolved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure alert thresholds and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="critical-alerts-setting">Critical Alerts</Label>
                  </div>
                  <Switch id="critical-alerts-setting" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="warning-alerts-setting">Warning Alerts</Label>
                  </div>
                  <Switch id="warning-alerts-setting" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="info-alerts-setting">Info Alerts</Label>
                  </div>
                  <Switch id="info-alerts-setting" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="magnetic-threshold">Magnetic Field Anomaly Threshold (μT)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="warning-threshold" className="text-xs text-muted-foreground">
                      Warning
                    </Label>
                    <input
                      id="warning-threshold"
                      type="range"
                      min="42.5"
                      max="43.5"
                      step="0.1"
                      defaultValue="42.8"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs">
                      <span>42.5</span>
                      <span>43.5</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="critical-threshold" className="text-xs text-muted-foreground">
                      Critical
                    </Label>
                    <input
                      id="critical-threshold"
                      type="range"
                      min="42.5"
                      max="43.5"
                      step="0.1"
                      defaultValue="43.2"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs">
                      <span>42.5</span>
                      <span>43.5</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button>Save Alert Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
