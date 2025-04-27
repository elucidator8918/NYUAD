"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Bell, Check, Copy, Loader2, Volume2, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { subscribeEmail } from "@/lib/emailService";
import { subscribeSMS } from "@/lib/notificationService";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingSMS, setIsSubmittingSMS] = useState(false);
  
  const copyApiKey = () => {
    const apiKey = document.getElementById("api-key") as HTMLInputElement;
    navigator.clipboard.writeText(apiKey.value);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingEmail(true);

    try {
      const result = await subscribeEmail(email);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setEmail("");
      } else {
        throw new Error(result.message || "Failed to subscribe");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleSMSSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic phone validation (adjust based on your needs)
    if (!phone || !/^\+?[\d\s-]{10,}$/.test(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingSMS(true);

    try {
      const result = await subscribeSMS(phone);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setPhone("");
      } else {
        throw new Error(result.message || "Failed to subscribe");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSMS(false);
    }
  };
  

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

              <div className="space-y-6">
                <form onSubmit={handleEmailSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Notifications</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="email" 
                        placeholder="your@email.com" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={isSubmittingEmail}>
                        {isSubmittingEmail ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                <form onSubmit={handleSMSSubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">SMS Notifications</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="phone" 
                        placeholder="+1 234 567 8900" 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={isSubmittingSMS}>
                        {isSubmittingSMS ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><Phone className="h-4 w-4 mr-2" /> Subscribe</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Standard messaging rates may apply
                    </p>
                  </div>
                </form>
              </div>
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
                  <Button variant="outline" onClick={copyApiKey}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
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
  );
}