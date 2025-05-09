// Implementación de una capa de abstracción para IndexedDB
export interface DBSchema {
  orders: {
    key: string
    value: any
  }
}

const DB_NAME = "empanadas-arepas-db"
const DB_VERSION = 1

// Función para abrir la conexión a la base de datos
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB no está soportado en este navegador"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("Error al abrir la base de datos", event)
      reject(new Error("No se pudo abrir la base de datos"))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Crear el almacén de objetos para los pedidos si no existe
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id" })
      }
    }
  })
}

// Función para guardar un pedido en IndexedDB
export async function saveOrderToDB(order: any): Promise<void> {
  if (!window.indexedDB) {
    console.warn("IndexedDB no está soportado, usando localStorage como fallback")
    saveOrderToLocalStorage(order)
    return
  }

  try {
    const db = await openDB()
    const transaction = db.transaction(["orders"], "readwrite")
    const store = transaction.objectStore("orders")

    return new Promise((resolve, reject) => {
      const request = store.put(order)

      request.onsuccess = () => {
        // También guardar en localStorage como respaldo
        saveOrderToLocalStorage(order)
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error al guardar el pedido en IndexedDB", event)
        // Fallback a localStorage
        saveOrderToLocalStorage(order)
        reject(new Error("No se pudo guardar el pedido"))
      }
    })
  } catch (error) {
    console.error("Error en saveOrderToDB:", error)
    // Fallback a localStorage
    saveOrderToLocalStorage(order)
  }
}

// Función auxiliar para guardar en localStorage
function saveOrderToLocalStorage(order: any): void {
  try {
    const savedOrders = localStorage.getItem("orders")
    const existingOrders = savedOrders ? JSON.parse(savedOrders) : []

    // Verificar si el pedido ya existe
    const orderExists = existingOrders.some((o: any) => o.id === order.id)

    if (!orderExists) {
      localStorage.setItem("orders", JSON.stringify([...existingOrders, order]))
    } else {
      // Actualizar el pedido existente
      const updatedOrders = existingOrders.map((o: any) => (o.id === order.id ? order : o))
      localStorage.setItem("orders", JSON.stringify(updatedOrders))
    }
  } catch (error) {
    console.error("Error al guardar en localStorage:", error)
  }
}

// Función para obtener todos los pedidos de IndexedDB
export async function getAllOrdersFromDB(): Promise<any[]> {
  if (!window.indexedDB) {
    console.warn("IndexedDB no está soportado, usando localStorage como fallback")
    return getOrdersFromLocalStorage()
  }

  try {
    const db = await openDB()
    const transaction = db.transaction(["orders"], "readonly")
    const store = transaction.objectStore("orders")

    return new Promise((resolve, reject) => {
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        console.error("Error al obtener los pedidos de IndexedDB", event)
        // Fallback a localStorage
        resolve(getOrdersFromLocalStorage())
      }
    })
  } catch (error) {
    console.error("Error en getAllOrdersFromDB:", error)
    // Fallback a localStorage
    return getOrdersFromLocalStorage()
  }
}

// Función auxiliar para obtener pedidos de localStorage
function getOrdersFromLocalStorage(): any[] {
  try {
    const savedOrders = localStorage.getItem("orders")
    return savedOrders ? JSON.parse(savedOrders) : []
  } catch (error) {
    console.error("Error al obtener pedidos de localStorage:", error)
    return []
  }
}

// Función para actualizar un pedido en IndexedDB
export async function updateOrderInDB(order: any): Promise<void> {
  if (!window.indexedDB) {
    console.warn("IndexedDB no está soportado, usando localStorage como fallback")
    updateOrderInLocalStorage(order)
    return
  }

  try {
    const db = await openDB()
    const transaction = db.transaction(["orders"], "readwrite")
    const store = transaction.objectStore("orders")

    return new Promise((resolve, reject) => {
      const request = store.put(order)

      request.onsuccess = () => {
        // También actualizar en localStorage
        updateOrderInLocalStorage(order)
        resolve()
      }

      request.onerror = (event) => {
        console.error("Error al actualizar el pedido en IndexedDB", event)
        // Fallback a localStorage
        updateOrderInLocalStorage(order)
        reject(new Error("No se pudo actualizar el pedido"))
      }
    })
  } catch (error) {
    console.error("Error en updateOrderInDB:", error)
    // Fallback a localStorage
    updateOrderInLocalStorage(order)
  }
}

// Función auxiliar para actualizar en localStorage
function updateOrderInLocalStorage(order: any): void {
  try {
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      const orders = JSON.parse(savedOrders)
      const index = orders.findIndex((o: any) => o.id === order.id)
      if (index !== -1) {
        orders[index] = order
        localStorage.setItem("orders", JSON.stringify(orders))
      } else {
        // Si no existe, añadirlo
        orders.push(order)
        localStorage.setItem("orders", JSON.stringify(orders))
      }
    } else {
      // Si no hay pedidos, crear el array con este pedido
      localStorage.setItem("orders", JSON.stringify([order]))
    }
  } catch (error) {
    console.error("Error al actualizar en localStorage:", error)
  }
}

// Función para sincronizar pedidos entre localStorage e IndexedDB
export async function syncOrders(): Promise<void> {
  if (!window.indexedDB) {
    console.warn("IndexedDB no está soportado, no se puede sincronizar")
    return
  }

  try {
    // Obtener pedidos de localStorage
    const localOrders = getOrdersFromLocalStorage()

    // Si no hay pedidos en localStorage, no hay nada que sincronizar
    if (localOrders.length === 0) {
      return
    }

    // Obtener pedidos de IndexedDB
    const dbOrders = await getAllOrdersFromDB()

    // Crear un mapa de pedidos por ID para facilitar la búsqueda
    const orderMap = new Map()
    dbOrders.forEach((order) => {
      orderMap.set(order.id, order)
    })

    // Sincronizar pedidos de localStorage a IndexedDB
    const syncPromises = localOrders.map(async (order) => {
      if (!orderMap.has(order.id)) {
        // Si el pedido no existe en IndexedDB, añadirlo
        await saveOrderToDB(order)
      } else {
        // Si existe, verificar cuál es más reciente (por fecha de creación o actualización)
        const dbOrder = orderMap.get(order.id)

        // Si el pedido local es más reciente o tiene un estado diferente, actualizarlo en IndexedDB
        if (new Date(order.createdAt) > new Date(dbOrder.createdAt) || order.status !== dbOrder.status) {
          await updateOrderInDB(order)
        }
      }
    })

    await Promise.all(syncPromises)

    // Sincronizar pedidos de IndexedDB a localStorage
    // Esto asegura que localStorage tenga todos los pedidos que están en IndexedDB
    const allDbOrders = await getAllOrdersFromDB()
    localStorage.setItem("orders", JSON.stringify(allDbOrders))

    console.log("Sincronización completada con éxito")
  } catch (error) {
    console.error("Error al sincronizar pedidos:", error)
    throw error
  }
}

// Función para verificar si IndexedDB está disponible
export function isIndexedDBSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window
}
