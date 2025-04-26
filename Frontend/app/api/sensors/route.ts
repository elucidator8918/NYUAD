import { NextResponse } from "next/server"

// Simulated sensor data with Turkey locations (around Istanbul)
const sensors = [
  {
    id: 1,
    lat: 41.0082,
    lng: 28.9784,
    name: "Sensor A1",
    status: "active",
    reading: 42.51,
    battery: 87,
    signalQuality: 98,
  },
  {
    id: 2,
    lat: 41.0151,
    lng: 29.0123,
    name: "Sensor A2",
    status: "active",
    reading: 42.48,
    battery: 92,
    signalQuality: 99,
  },
  {
    id: 3,
    lat: 41.0224,
    lng: 28.9456,
    name: "Sensor A3",
    status: "active",
    reading: 42.53,
    battery: 78,
    signalQuality: 97,
  },
  {
    id: 4,
    lat: 40.9921,
    lng: 28.9234,
    name: "Sensor B1",
    status: "warning",
    reading: 43.12,
    battery: 65,
    signalQuality: 91,
  },
  {
    id: 5,
    lat: 41.0055,
    lng: 28.9678,
    name: "Sensor B2",
    status: "active",
    reading: 42.49,
    battery: 81,
    signalQuality: 95,
  },
  {
    id: 6,
    lat: 40.9856,
    lng: 29.0345,
    name: "Sensor B3",
    status: "inactive",
    reading: 0,
    battery: 12,
    signalQuality: 0,
  },
  {
    id: 7,
    lat: 41.0189,
    lng: 29.0456,
    name: "Sensor C1",
    status: "active",
    reading: 42.47,
    battery: 90,
    signalQuality: 98,
  },
  {
    id: 8,
    lat: 41.0254,
    lng: 28.9876,
    name: "Sensor C2",
    status: "active",
    reading: 42.52,
    battery: 85,
    signalQuality: 96,
  },
  {
    id: 9,
    lat: 40.9987,
    lng: 28.8765,
    name: "Sensor C3",
    status: "active",
    reading: 42.5,
    battery: 79,
    signalQuality: 94,
  },
]

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(sensors)
}