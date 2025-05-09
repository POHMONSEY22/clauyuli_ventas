"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, DatabaseIcon, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { syncOrders, getAllOrdersFromDB } from "@/lib/db"

export default function AdminSystemPage() {
  const [dbSupported, setDbSupported] = useState<boolean | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [dbOrderCount, setDbOrderCount] = useState<number | null>(null)
  const [localOrderCount, setLocalOrderCount] = useState<number | null>(null)

  useEffect(() => {
    // Verificar si IndexedDB es soportado
    const isIndexedDBSupported = typeof window !== "undefined" && "indexedDB" in window
    setDbSupported(isIndexedDBSupported)

    // Cargar datos
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Obtener conteo de pedidos de localStorage
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        try {
          const orders = JSON.parse(savedOrders)
          setLocalOrderCount(orders.length)
        } catch (error) {
          console.error("Error al parsear pedidos de localStorage:", error)
          setLocalOrderCount(0)
        }
      } else {
        setLocalOrderCount(0)
      }

      // Obtener conteo de pedidos de IndexedDB
      if (dbSupported) {
        try {
          const dbOrders = await getAllOrdersFromDB()
          setDbOrderCount(dbOrders.length)
          setOrderCount(dbOrders.length)
        } catch (error) {
          console.error("Error al obtener pedidos de IndexedDB:", error)
          setDbOrderCount(0)
          setOrderCount(localOrderCount)
        }
      } else {
        setDbOrderCount(0)
        setOrderCount(localOrderCount)
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
    }
  }

  const handleSync = async () => {
    setSyncStatus("syncing")
    try {
      await syncOrders()
      setSyncStatus("success")

      // Recargar datos
      await loadData()

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión del Sistema</h1>
        <div className="flex gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline">Volver al Dashboard</Button>
          </Link>
        </div>
      </div>

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
                <span>Pedidos en IndexedDB:</span>
                <span className="font-bold">{dbOrderCount === null ? "Cargando..." : dbOrderCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pedidos en localStorage:</span>
                <span className="font-bold">{localOrderCount === null ? "Cargando..." : localOrderCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total de pedidos:</span>
                <span className="font-bold">{orderCount === null ? "Cargando..." : orderCount}</span>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleSync}
                  disabled={syncStatus === "syncing"}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {syncStatus === "syncing" ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sincronizando...
                    </>
                  ) : syncStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      ¡Sincronización Exitosa!
                    </>
                  ) : syncStatus === "error" ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Error al Sincronizar
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sincronizar Datos
                    </>
                  )}
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
                Esta aplicación utiliza tecnologías modernas de almacenamiento para asegurar que los pedidos estén
                disponibles en todos los dispositivos.
              </p>
              <p>
                Si estás experimentando problemas con los pedidos no apareciendo en diferentes dispositivos, puedes usar
                el botón "Sincronizar Datos" para forzar una sincronización.
              </p>
              <Alert className="mt-4">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Para asegurar que los pedidos estén disponibles en todos tus dispositivos, recomendamos sincronizar
                  regularmente tus datos usando el botón "Sincronizar Datos".
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={loadData} className="bg-blue-500 hover:bg-blue-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Información
            </Button>
            <Button onClick={handleSync} className="bg-green-500 hover:bg-green-600">
              <DatabaseIcon className="mr-2 h-4 w-4" />
              Sincronizar Base de Datos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
