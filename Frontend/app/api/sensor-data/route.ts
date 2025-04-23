import { NextResponse } from "next/server"

// Generate simulated sensor data
const generateSensorData = (anomaly = false) => {
  const baseValue = 42.5
  const noise = 0.2
  const anomalyFactor = anomaly ? 2 + Math.random() * 3 : 0

  return Array.from({ length: 20 }, (_, i) => {
    const time = new Date()
    time.setSeconds(time.getSeconds() - (20 - i) * 5)

    let value
    if (anomaly && i > 14) {
      // Create an anomaly spike in the last few data points
      value = baseValue + Math.random() * noise + anomalyFactor * (i - 14)
    } else {
      value = baseValue + (Math.random() * noise * 2 - noise)
    }

    return {
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      value: value.toFixed(3),
    }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const anomaly = searchParams.get("anomaly") === "true"

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(generateSensorData(anomaly))
}
