import { NextResponse } from "next/server"

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const statusData = {
    system: "operational",
    activeSensors: 24,
    totalSensors: 25,
    minorAnomalies: Math.floor(Math.random() * 5),
    criticalAlerts: Math.random() < 0.05 ? 1 : 0, // 5% chance of critical alert
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(statusData)
}
