"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Battery, AlertTriangle, Check, X } from "lucide-react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Use your mapbox token here
mapboxgl.accessToken = "pk.eyJ1IjoicmFtZWVzbW9oZCIsImEiOiJjbG4xZ281djIwMHJ1MnFvaHBuZDV5ZWVzIn0.B39GohhPOcIvsb33_BDXGA"

interface Sensor {
  id: number
  lat: number
  lng: number
  name: string
  status: string
  reading: number
  battery: number
  signalQuality: number
}

interface SensorMapProps {
  detailed?: boolean
}

export default function SensorMap({ detailed = false }: SensorMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSensor, setSelectedSensor] = useState<number | null>(null)
  const [lng, setLng] = useState(28.979530)
  const [lat, setLat] = useState(41.015137)
  const [zoom, setZoom] = useState(13)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const fetchSensors = async () => {
    try {
      const response = await fetch("/api/sensors")
      const data = await response.json()
      setSensors(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching sensors:", error)
      setSensors([])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSensors()
  }, [])

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12?optimize=true", // You can try other styles like 'mapbox://styles/mapbox/light-v11'
      center: [lng, lat],
      zoom: zoom,
      attributionControl: true, // Ensure attribution is visible as required by Mapbox
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Set up move event listener
    map.current.on("move", () => {
      if (!map.current) return;
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });

    // Ensure map is visible by using an event handler
    map.current.on("load", () => {
      console.log("Map loaded successfully");
      if (sensors.length > 0) {
        addMarkersToMap();
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapContainer.current]);

  // Add markers when sensors data is available and map is initialized
  const addMarkersToMap = () => {
    if (!map.current || sensors.length === 0) return;
    
    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    sensors.forEach((sensor) => {
      // Create marker element
      const el = document.createElement("div");
      
      // Apply tailwind classes via className
      el.className = "relative cursor-pointer transition-transform duration-300 ease-in-out group";
      
      // Status-specific marker content
      let bgColor = "bg-red-500";
      let pulseClass = "";
      let iconSvg = "";
      
      if (sensor.status === "active") {
        bgColor = "bg-green-500";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      } else if (sensor.status === "warning") {
        bgColor = "bg-yellow-500";
        pulseClass = "animate-pulse";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`;
      } else {
        bgColor = "bg-red-500";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`;
      }
      
      // Create the marker HTML
      el.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center ${sensor.status === 'active' ? 'bg-green-100' : sensor.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'} ${pulseClass}">
          <div class="w-7 h-7 rounded-full ${bgColor} flex items-center justify-center shadow-md">
            ${iconSvg}
          </div>
        </div>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50 pointer-events-none">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 text-xs whitespace-nowrap border border-slate-200 dark:border-slate-700">
            <div class="font-bold">${sensor.name}</div>
            <div class="flex items-center gap-1 mt-1">
              <span class="w-2 h-2 rounded-full ${bgColor}"></span>
              <span class="uppercase">${sensor.status}</span>
            </div>
          </div>
        </div>
      `;
      
      // Apply scale effect if selected
      if (sensor.id === selectedSensor) {
        el.classList.add("scale-125");
      }

      el.addEventListener("click", () => {
        setSelectedSensor(sensor.id === selectedSensor ? null : sensor.id);

        if (detailed && map.current) {
          map.current.flyTo({
            center: [sensor.lng, sensor.lat],
            zoom: 15,
            essential: true,
            duration: 1000,
          });
        }
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([sensor.lng, sensor.lat])
        .addTo(map.current!);
        
      markersRef.current.push(marker);
    });
  };

  // Update markers when sensors or selectedSensor changes
  useEffect(() => {
    if (map.current && sensors.length > 0) {
      addMarkersToMap();
    }
  }, [sensors, selectedSensor, detailed]);

  // Get the selected sensor data
  const selectedSensorData = sensors.find((s) => s.id === selectedSensor);

  // Function to get battery status color
  const getBatteryColor = (level: number) => {
    if (level > 70) return "text-green-500";
    if (level > 30) return "text-yellow-500";
    return "text-red-500";
  };

  // Function to get signal quality color
  const getSignalColor = (level: number) => {
    if (level > 70) return "text-green-500";
    if (level > 40) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 p-4 flex flex-col gap-4">
        <Skeleton className="w-full h-full rounded-lg" />
        <div className="flex justify-between items-center px-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Map container - ensure this takes up full space */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full bg-slate-200 dark:bg-slate-800" />
      
      {/* Map Info Panel */}
      <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-md shadow-md border border-slate-200 dark:border-slate-800 text-xs font-mono z-10">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">GPS:</span>
          <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
        </div>
      </div>
      
      {/* Sensor count badge */}
      <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-slate-200 dark:border-slate-800 flex items-center gap-2 z-10">
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
        <span className="text-xs font-medium">{sensors.length} Sensors</span>
      </div>

      {detailed && selectedSensorData && (
        <Card className="absolute bottom-4 left-4 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-slate-800 rounded-lg z-10 overflow-hidden">
          <div className="flex flex-col">
            {/* Header with status color */}
            <div className={`p-3 ${
              selectedSensorData.status === 'active' 
                ? 'bg-green-500/10' 
                : selectedSensorData.status === 'warning' 
                  ? 'bg-yellow-500/10' 
                  : 'bg-red-500/10'
            } border-b border-slate-200 dark:border-slate-800`}>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{selectedSensorData.name}</h3>
                <Badge
                  variant={
                    selectedSensorData.status === "active"
                      ? "outline"
                      : selectedSensorData.status === "warning"
                        ? "destructive"
                        : "secondary"
                  }
                  className="font-mono text-xs"
                >
                  {selectedSensorData.status === "active" ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : selectedSensorData.status === "warning" ? (
                    <AlertTriangle className="mr-1 h-3 w-3" />
                  ) : (
                    <X className="mr-1 h-3 w-3" />
                  )}
                  {selectedSensorData.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            {/* Sensor details */}
            <div className="p-3 space-y-3">
              {/* Reading with visualization */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Magnetic Field Reading</span>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{selectedSensorData.reading.toFixed(2)} <span className="text-xs font-normal text-slate-500">μT</span></span>
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(selectedSensorData.reading / 10 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Signal quality */}
                <div className="flex items-center gap-2">
                  <Wifi className={`h-4 w-4 ${getSignalColor(selectedSensorData.signalQuality)}`} />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Signal</span>
                    <span className="text-sm font-medium">{selectedSensorData.signalQuality}%</span>
                  </div>
                </div>
                
                {/* Battery */}
                <div className="flex items-center gap-2">
                  <Battery className={`h-4 w-4 ${getBatteryColor(selectedSensorData.battery)}`} />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Battery</span>
                    <span className="text-sm font-medium">{selectedSensorData.battery}%</span>
                  </div>
                </div>
              </div>
              
              {/* Coordinates */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-slate-400">GPS Coordinates</span>
                  <span className="font-mono text-xs">{selectedSensorData.lat.toFixed(5)}, {selectedSensorData.lng.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
