"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, DatabaseIcon, SmartphoneIcon, ServerIcon } from "lucide-react"
import Link from "next/link"
import { syncOrders } from "@/lib/db"

export default function InfoPage() {
  const [dbSupported, setDbSupported] = useState<boolean | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [orderCount, setOrderCount] = useState<number | null>(null)

  useEffect(() => {
    // Verificar si IndexedDB es soportado
    const isIndexedDBSupported = typeof window !== "undefined" && "indexedDB" in window
    setDbSupported(isIndexedDBSupported)

    // Obtener conteo de pedidos
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders)
        setOrderCount(orders.length)
      } catch (error) {
        console.error("Error al parsear pedidos:", error)
        setOrderCount(0)
      }
    } else {
      setOrderCount(0)
    }
  }, [])

  const handleSync = async () => {
    setSyncStatus("syncing")
    try {
      await syncOrders()
      setSyncStatus("success")

      // Actualizar conteo de pedidos
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        const orders = JSON.parse(savedOrders)
        setOrderCount(orders.length)
      }

      setTimeout(() => {
        setSyncStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error al sincronizar:", error)
      setSyncStatus("error")
      setTimeout(() => {
        setSyncStatus("idle")
      }, 3000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-amber-900">Información del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DatabaseIcon className="mr-2 h-5 w-5" />
              Estado del Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>IndexedDB soportado:</span>
                <span className={`font-bold ${dbSupported ? "text-green-500" : "text-red-500"}`}>
                  {dbSupported === null ? "Verificando..." : dbSupported ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pedidos almacenados:</span>
                <span className="font-bold">{orderCount === null ? "Cargando..." : orderCount}</span>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleSync}
                  disabled={syncStatus === "syncing"}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {syncStatus === "syncing"
                    ? "Sincronizando..."
                    : syncStatus === "success"
                      ? "¡Sincronización Exitosa!"
                      : syncStatus === "error"
                        ? "Error al Sincronizar"
                        : "Sincronizar Datos"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <InfoIcon className="mr-2 h-5 w-5" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Esta aplicación utiliza tecnologías modernas de almacenamiento para asegurar que tus pedidos estén
                disponibles en todos tus dispositivos.
              </p>
              <p>
                Si estás experimentando problemas con los pedidos no apareciendo en diferentes dispositivos, puedes usar
                el botón "Sincronizar Datos" para forzar una sincronización.
              </p>
              <div className="mt-4">
                <Link href="/admin/dashboard">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Ir al Panel de Administración</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Para asegurar que tus pedidos estén disponibles en todos tus dispositivos, recomendamos sincronizar
          regularmente tus datos usando el botón "Sincronizar Datos".
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SmartphoneIcon className="mr-2 h-5 w-5" />
              Acceso Móvil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Puedes acceder a tu panel de administración desde cualquier dispositivo móvil. Los pedidos se
              sincronizarán automáticamente cuando abras la aplicación.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ServerIcon className="mr-2 h-5 w-5" />
              Almacenamiento Local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Tus datos se almacenan de forma segura en tu navegador utilizando tecnologías modernas como IndexedDB y
              localStorage para garantizar que no se pierdan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DatabaseIcon className="mr-2 h-5 w-5" />
              Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              El sistema intenta sincronizar automáticamente tus datos entre diferentes almacenamientos para maximizar
              la disponibilidad de tus pedidos en todos tus dispositivos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
