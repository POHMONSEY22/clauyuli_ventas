// Sistema de base de datos interna con respaldo y restauración

// Clave para almacenar la copia de seguridad en localStorage
const BACKUP_KEY = "empanadas-arepas-backup"

// Estructura de la copia de seguridad
interface BackupData {
  orders: any[]
  timestamp: number
  version: number
}

// Función para crear una copia de seguridad de todos los datos
export async function createBackup(orders: any[]): Promise<BackupData> {
  const backup: BackupData = {
    orders,
    timestamp: Date.now(),
    version: 1, // Versión del formato de copia de seguridad
  }

  try {
    // Guardar la copia de seguridad en localStorage
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
    console.log("Copia de seguridad creada correctamente:", backup)
    return backup
  } catch (error) {
    console.error("Error al crear copia de seguridad:", error)
    throw new Error("No se pudo crear la copia de seguridad")
  }
}

// Función para obtener la copia de seguridad más reciente
export function getLatestBackup(): BackupData | null {
  try {
    const backupData = localStorage.getItem(BACKUP_KEY)
    if (!backupData) return null

    return JSON.parse(backupData) as BackupData
  } catch (error) {
    console.error("Error al obtener copia de seguridad:", error)
    return null
  }
}

// Función para restaurar datos desde la copia de seguridad
export async function restoreFromBackup(): Promise<any[]> {
  try {
    const backup = getLatestBackup()
    if (!backup) {
      console.warn("No se encontró ninguna copia de seguridad para restaurar")
      return []
    }

    console.log("Restaurando datos desde copia de seguridad del:", new Date(backup.timestamp).toLocaleString())
    return backup.orders
  } catch (error) {
    console.error("Error al restaurar desde copia de seguridad:", error)
    return []
  }
}

// Función para exportar todos los datos como JSON
export function exportDataAsJSON(data: any): string {
  return JSON.stringify(data, null, 2)
}

// Función para importar datos desde JSON
export function importDataFromJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error("Error al importar datos desde JSON:", error)
    throw new Error("El formato JSON no es válido")
  }
}

// Función para verificar si hay una copia de seguridad disponible
export function hasBackup(): boolean {
  return localStorage.getItem(BACKUP_KEY) !== null
}

// Función para obtener información sobre la copia de seguridad
export function getBackupInfo(): { exists: boolean; timestamp?: Date; orderCount?: number } {
  const backup = getLatestBackup()
  if (!backup) {
    return { exists: false }
  }

  return {
    exists: true,
    timestamp: new Date(backup.timestamp),
    orderCount: backup.orders.length,
  }
}
