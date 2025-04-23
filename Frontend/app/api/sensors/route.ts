import { NextResponse } from "next/server"

// Simulated sensor data
const sensors = [
  {
    id: 1,
    lat: 24.5239,
    lng: 54.4346,
    name: "Sensor A1",
    status: "active",
    reading: 42.51,
    battery: 87,
    signalQuality: 98,
  },
  {
    id: 2,
    lat: 24.4851,
    lng: 54.3773,
    name: "Sensor A2",
    status: "active",
    reading: 42.48,
    battery: 92,
    signalQuality: 99,
  },
  {
    id: 3,
    lat: 24.5133,
    lng: 54.3773,
    name: "Sensor A3",
    status: "active",
    reading: 42.53,
    battery: 78,
    signalQuality: 97,
  },
  {
    id: 4,
    lat: 24.4851,
    lng: 54.4346,
    name: "Sensor B1",
    status: "warning",
    reading: 43.12,
    battery: 65,
    signalQuality: 91,
  },
  {
    id: 5,
    lat: 24.4851,
    lng: 54.406,
    name: "Sensor B2",
    status: "active",
    reading: 42.49,
    battery: 81,
    signalQuality: 95,
  },
  {
    id: 6,
    lat: 24.4992,
    lng: 54.406,
    name: "Sensor B3",
    status: "inactive",
    reading: 0,
    battery: 12,
    signalQuality: 0,
  },
  {
    id: 7,
    lat: 24.5133,
    lng: 54.406,
    name: "Sensor C1",
    status: "active",
    reading: 42.47,
    battery: 90,
    signalQuality: 98,
  },
  {
    id: 8,
    lat: 24.4992,
    lng: 54.3773,
    name: "Sensor C2",
    status: "active",
    reading: 42.52,
    battery: 85,
    signalQuality: 96,
  },
  {
    id: 9,
    lat: 24.4992,
    lng: 54.4346,
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
