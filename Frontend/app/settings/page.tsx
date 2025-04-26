import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Bell, Volume2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <main className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you want to receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="critical-alerts">Critical Alerts</Label>
                  </div>
                  <Switch id="critical-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="warning-alerts">Warning Alerts</Label>
                  </div>
                  <Switch id="warning-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="info-alerts">Info Alerts</Label>
                  </div>
                  <Switch id="info-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="sound-alerts">Sound Alerts</Label>
                  </div>
                  <Switch id="sound-alerts" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Notifications</Label>
                <Input id="email" placeholder="Enter your email" type="email" />
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage API keys and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" value="sk_live_quantum_sensing_key_123456789" readOnly />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="api-access">API Access</Label>
                <Switch id="api-access" defaultChecked />
              </div>
              <Button>Regenerate API Key</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}