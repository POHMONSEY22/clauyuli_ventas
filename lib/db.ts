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
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error("Error al abrir la base de datos")
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
  try {
    const db = await openDB()
    const transaction = db.transaction(["orders"], "readwrite")
    const store = transaction.objectStore("orders")

    return new Promise((resolve, reject) => {
      const request = store.put(order)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error("Error al guardar el pedido en IndexedDB")
        reject(new Error("No se pudo guardar el pedido"))
      }
    })
  } catch (error) {
    console.error("Error en saveOrderToDB:", error)
    // Fallback a localStorage si IndexedDB falla
    const savedOrders = localStorage.getItem("orders")
    const existingOrders = savedOrders ? JSON.parse(savedOrders) : []
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]))
  }
}

// Función para obtener todos los pedidos de IndexedDB
export async function getAllOrdersFromDB(): Promise<any[]> {
  try {
    const db = await openDB()
    const transaction = db.transaction(["orders"], "readonly")
    const store = transaction.objectStore("orders")

    return new Promise((resolve, reject) => {
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        console.error("Error al obtener los pedidos de IndexedDB")
        reject(new Error("No se pudieron obtener los pedidos"))
      }
    })
  } catch (error) {
    console.error("Error en getAllOrdersFromDB:", error)
    // Fallback a localStorage si IndexedDB falla
    const savedOrders = localStorage.getItem("orders")
    return savedOrders ? JSON.parse(savedOrders) : []
  }
}

// Función para actualizar un pedido en IndexedDB
export async function updateOrderInDB(order: any): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction(["orders"], "readwrite")
    const store = transaction.objectStore("orders")

    return new Promise((resolve, reject) => {
      const request = store.put(order)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error("Error al actualizar el pedido en IndexedDB")
        reject(new Error("No se pudo actualizar el pedido"))
      }
    })
  } catch (error) {
    console.error("Error en updateOrderInDB:", error)
    // Fallback a localStorage si IndexedDB falla
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      const orders = JSON.parse(savedOrders)
      const index = orders.findIndex((o: any) => o.id === order.id)
      if (index !== -1) {
        orders[index] = order
        localStorage.setItem("orders", JSON.stringify(orders))
      }
    }
  }
}

// Función para sincronizar pedidos entre localStorage e IndexedDB
export async function syncOrders(): Promise<void> {
  try {
    // Obtener pedidos de localStorage
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      const localOrders = JSON.parse(savedOrders)

      // Obtener pedidos de IndexedDB
      const dbOrders = await getAllOrdersFromDB()

      // Crear un mapa de pedidos por ID para facilitar la búsqueda
      const orderMap = new Map()
      dbOrders.forEach((order) => {
        orderMap.set(order.id, order)
      })

      // Sincronizar pedidos de localStorage a IndexedDB
      for (const order of localOrders) {
        if (!orderMap.has(order.id)) {
          await saveOrderToDB(order)
        }
      }

      // Actualizar localStorage con todos los pedidos
      const allOrders = await getAllOrdersFromDB()
      localStorage.setItem("orders", JSON.stringify(allOrders))
    }
  } catch (error) {
    console.error("Error al sincronizar pedidos:", error)
  }
}
