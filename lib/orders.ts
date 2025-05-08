import type { CartItem } from "./types"

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: CartItem[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

// En una aplicación real, esto vendría de una base de datos
let orders: Order[] = []

// Función para guardar un pedido
export function saveOrder(order: Omit<Order, "id" | "createdAt" | "status">): Order {
  const newOrder: Order = {
    ...order,
    id: `order-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  orders = [...orders, newOrder]

  // En una aplicación real, aquí guardaríamos en la base de datos
  // Para esta demo, guardamos en localStorage para persistencia
  if (typeof window !== "undefined") {
    const savedOrders = localStorage.getItem("orders")
    const parsedOrders = savedOrders ? JSON.parse(savedOrders) : []
    localStorage.setItem("orders", JSON.stringify([...parsedOrders, newOrder]))
  }

  return newOrder
}

// Función para obtener todos los pedidos
export function getOrders(): Order[] {
  // En una aplicación real, aquí obtendríamos de la base de datos
  // Para esta demo, obtenemos de localStorage
  if (typeof window !== "undefined") {
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      orders = JSON.parse(savedOrders)
    }
  }

  return orders
}

// Función para actualizar el estado de un pedido
export function updateOrderStatus(orderId: string, status: Order["status"]): Order | null {
  const orderIndex = orders.findIndex((order) => order.id === orderId)

  if (orderIndex === -1) return null

  const updatedOrder = {
    ...orders[orderIndex],
    status,
  }

  orders = [...orders.slice(0, orderIndex), updatedOrder, ...orders.slice(orderIndex + 1)]

  // Actualizar en localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("orders", JSON.stringify(orders))
  }

  return updatedOrder
}

// Función para obtener estadísticas de ventas
export function getSalesStats() {
  const completedOrders = orders.filter((order) => order.status === "completed")

  const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = completedOrders.length

  // Ventas por producto
  const productSales: Record<string, { quantity: number; revenue: number }> = {}

  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = item.id

      if (!productSales[productId]) {
        productSales[productId] = { quantity: 0, revenue: 0 }
      }

      productSales[productId].quantity += item.quantity
      productSales[productId].revenue += item.price * item.quantity
    })
  })

  // Ventas por día (últimos 7 días)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split("T")[0]
  }).reverse()

  const salesByDay = last7Days.map((day) => {
    const dayOrders = completedOrders.filter((order) => order.createdAt.split("T")[0] === day)

    return {
      date: day,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
    }
  })

  return {
    totalSales,
    totalOrders,
    productSales,
    salesByDay,
  }
}
