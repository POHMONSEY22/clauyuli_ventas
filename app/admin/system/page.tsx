"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  InfoIcon,
  DatabaseIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
  Save,
  Download,
  Upload,
  Clock,
  FileText,
} from "lucide-react"
import Link from "next/link"
import {
  syncOrders,
  getAllOrdersFromDB,
  performBackup,
  restoreDatabase,
  isIndexedDBSupported,
  saveOrderToDB,
  createBackup,
} from "@/lib/db"
import { getBackupInfo, exportDataAsJSON, importDataFromJSON } from "@/lib/internal-db"
import { exportOrdersToExcel } from "@/lib/excel-export"

export default function AdminSystemPage() {
  const [dbSupported, setDbSupported] = useState<boolean | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [backupStatus, setBackupStatus] = useState<"idle" | "creating" | "success" | "error">("idle")
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "restoring" | "success" | "error">("idle")
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error">("idle")
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [dbOrderCount, setDbOrderCount] = useState<number | null>(null)
  const [localOrderCount, setLocalOrderCount] = useState<number | null>(null)
  const [backupInfo, setBackupInfo] = useState<{ exists: boolean; timestamp?: Date; orderCount?: number }>({
    exists: false,
  })
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    // Verificar si IndexedDB es soportado
    const isIDBSupported = isIndexedDBSupported()
    setDbSupported(isIDBSupported)

    // Cargar datos
    loadData()

    // Limpiar URL de exportación al desmontar
    return () => {
      if (exportUrl) {
        URL.revokeObjectURL(exportUrl)
      }
    }
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
          setOrders(dbOrders)
        } catch (error) {
          console.error("Error al obtener pedidos de IndexedDB:", error)
          setDbOrderCount(0)
          setOrderCount(localOrderCount)
        }
      } else {
        setDbOrderCount(0)
        setOrderCount(localOrderCount)
      }

      // Obtener información de la copia de seguridad
      const info = getBackupInfo()
      setBackupInfo(info)
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

  const handleBackup = async () => {
    setBackupStatus("creating")
    try {
      const success = await performBackup()

      if (success) {
        setBackupStatus("success")
        // Recargar datos para actualizar la información de la copia de seguridad
        await loadData()
      } else {
        setBackupStatus("error")
      }

      setTimeout(() => {
        setBackupStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error al crear copia de seguridad:", error)
      setBackupStatus("error")
      setTimeout(() => {
        setBackupStatus("idle")
      }, 3000)
    }
  }

  const handleRestore = async () => {
    setRestoreStatus("restoring")
    try {
      const success = await restoreDatabase()

      if (success) {
        setRestoreStatus("success")
        // Recargar datos para mostrar los cambios
        await loadData()
      } else {
        setRestoreStatus("error")
      }

      setTimeout(() => {
        setRestoreStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error al restaurar base de datos:", error)
      setRestoreStatus("error")
      setTimeout(() => {
        setRestoreStatus("idle")
      }, 3000)
    }
  }

  const handleExportData = async () => {
    try {
      // Obtener todos los pedidos
      const orders = await getAllOrdersFromDB()

      // Crear un objeto con todos los datos a exportar
      const exportData = {
        orders,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      // Convertir a JSON
      const jsonString = exportDataAsJSON(exportData)

      // Crear un blob con los datos
      const blob = new Blob([jsonString], { type: "application/json" })

      // Crear URL para descargar
      const url = URL.createObjectURL(blob)
      setExportUrl(url)

      // Crear un elemento de enlace y simular clic para descargar
      const a = document.createElement("a")
      a.href = url
      a.download = `empanadas-arepas-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al exportar datos:", error)
      alert("Error al exportar datos. Por favor, intenta de nuevo.")
    }
  }

  const handleImportData = () => {
    // Crear un input de archivo oculto
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".json"

    fileInput.onchange = async (e: any) => {
      try {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = async (event) => {
          try {
            const jsonString = event.target?.result as string
            const importedData = importDataFromJSON(jsonString)

            if (!importedData.orders || !Array.isArray(importedData.orders)) {
              throw new Error("Formato de archivo inválido")
            }

            // Guardar cada pedido en la base de datos
            for (const order of importedData.orders) {
              await saveOrderToDB(order)
            }

            // Actualizar localStorage
            localStorage.setItem("orders", JSON.stringify(importedData.orders))

            // Crear una copia de seguridad con los datos importados
            await createBackup(importedData.orders)

            // Recargar datos
            await loadData()

            alert(`Importación exitosa. Se importaron ${importedData.orders.length} pedidos.`)
          } catch (error) {
            console.error("Error al procesar archivo importado:", error)
            alert("Error al importar datos. El archivo podría estar dañado o tener un formato incorrecto.")
          }
        }

        reader.readAsText(file)
      } catch (error) {
        console.error("Error al importar datos:", error)
        alert("Error al importar datos. Por favor, intenta de nuevo.")
      }
    }

    // Simular clic en el input
    fileInput.click()
  }

  const handleExportToExcel = async () => {
    try {
      setExportStatus("exporting")
      await exportOrdersToExcel(orders, "pedidos-empanadas-arepas-completo")
      setExportStatus("success")

      setTimeout(() => {
        setExportStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      setExportStatus("error")

      setTimeout(() => {
        setExportStatus("idle")
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
              <Save className="mr-2 h-5 w-5" />
              Copia de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Copia de seguridad disponible:</span>
                <span className={`font-bold ${backupInfo.exists ? "text-green-500" : "text-red-500"}`}>
                  {backupInfo.exists ? "Sí" : "No"}
                </span>
              </div>

              {backupInfo.exists && (
                <>
                  <div className="flex justify-between items-center">
                    <span>Fecha de la copia:</span>
                    <span className="font-bold">{backupInfo.timestamp?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pedidos en la copia:</span>
                    <span className="font-bold">{backupInfo.orderCount}</span>
                  </div>
                </>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2">
                <Button
                  onClick={handleBackup}
                  disabled={backupStatus !== "idle"}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {backupStatus === "creating" ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-pulse" />
                      Creando copia...
                    </>
                  ) : backupStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      ¡Copia creada!
                    </>
                  ) : backupStatus === "error" ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Error al crear copia
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Copia de Seguridad
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRestore}
                  disabled={!backupInfo.exists || restoreStatus !== "idle"}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {restoreStatus === "restoring" ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Restaurando...
                    </>
                  ) : restoreStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      ¡Restauración exitosa!
                    </>
                  ) : restoreStatus === "error" ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Error al restaurar
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Restaurar desde Copia
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Exportar e Importar Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Puedes exportar todos los datos de la aplicación a un archivo JSON o Excel para hacer una copia de seguridad
            externa. También puedes importar datos desde un archivo JSON previamente exportado.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleExportData} className="bg-blue-500 hover:bg-blue-600">
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos (JSON)
            </Button>
            <Button onClick={handleImportData} className="bg-green-500 hover:bg-green-600">
              <Upload className="mr-2 h-4 w-4" />
              Importar Datos (JSON)
            </Button>
            <Button
              onClick={handleExportToExcel}
              disabled={exportStatus !== "idle" || orders.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {exportStatus === "exporting" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : exportStatus === "success" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  ¡Exportación Exitosa!
                </>
              ) : exportStatus === "error" ? (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Error al Exportar
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Información Importante</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            El sistema utiliza múltiples capas de almacenamiento para garantizar que tus datos estén seguros:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IndexedDB: Base de datos principal del navegador</li>
            <li>localStorage: Almacenamiento de respaldo</li>
            <li>Copia de seguridad interna: Respaldo adicional que puedes restaurar manualmente</li>
            <li>Exportación: Te permite guardar tus datos en un archivo externo</li>
          </ul>
          <p className="mt-2">Para asegurar que tus datos estén disponibles en todos tus dispositivos, recomendamos:</p>
          <ol className="list-decimal pl-5 space-y-1 mt-1">
            <li>Crear copias de seguridad regularmente</li>
            <li>Exportar tus datos periódicamente</li>
            <li>Sincronizar la base de datos antes y después de realizar cambios importantes</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Acciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={loadData} className="bg-blue-500 hover:bg-blue-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Información
            </Button>
            <Button onClick={handleSync} className="bg-orange-500 hover:bg-orange-600">
              <DatabaseIcon className="mr-2 h-4 w-4" />
              Sincronizar Base de Datos
            </Button>
            <Button onClick={handleBackup} className="bg-green-500 hover:bg-green-600">
              <Save className="mr-2 h-4 w-4" />
              Crear Copia de Seguridad
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-gray-500">Última actualización: {new Date().toLocaleString()}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
