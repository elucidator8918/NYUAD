import { NextResponse } from "next/server"

// Simulated alert data
const alertsData = [
  {
    id: 1,
    timestamp: "2025-04-22T14:32:15",
    level: "warning",
    message: "Magnetic field anomaly detected in Sensor B1",
    location: "24.4851, 54.4346",
    acknowledged: false,
  },
  {
    id: 2,
    timestamp: "2025-04-22T10:17:42",
    level: "info",
    message: "Minor fluctuation in quantum entanglement stability",
    location: "24.5133, 54.3773",
    acknowledged: true,
  },
  {
    id: 3,
    timestamp: "2025-04-21T23:05:11",
    level: "critical",
    message: "Multiple sensors reporting significant magnetic field changes",
    location: "Region-wide",
    acknowledged: true,
  },
  {
    id: 4,
    timestamp: "2025-04-21T18:42:33",
    level: "info",
    message: "Sensor C3 maintenance completed",
    location: "24.4992, 54.4346",
    acknowledged: true,
  },
  {
    id: 5,
    timestamp: "2025-04-20T09:11:27",
    level: "warning",
    message: "Temporary loss of quantum coherence in Sensor A2",
    location: "24.4851, 54.3773",
    acknowledged: true,
  },
]

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  return NextResponse.json(alertsData)
}

export async function POST(request: Request) {
  const data = await request.json()

  // Simulate acknowledging an alert
  if (data.action === "acknowledge" && data.id) {
    // In a real app, this would update a database
    console.log(`Alert ${data.id} acknowledged`)
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({ success: true })
}
