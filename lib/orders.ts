"use client"

import type { CartItem } from "./types"
import { saveOrderToDB, getAllOrdersFromDB, updateOrderInDB, syncOrders } from "./db"

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

// Función para guardar un pedido
export async function saveOrder(order: Omit<Order, "id" | "createdAt" | "status">): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `order-${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  try {
    // Guardar en IndexedDB
    await saveOrderToDB(newOrder)

    // También guardar en localStorage como respaldo
    const savedOrders = localStorage.getItem("orders")
    const existingOrders = savedOrders ? JSON.parse(savedOrders) : []
    localStorage.setItem("orders", JSON.stringify([...existingOrders, newOrder]))

    return newOrder
  } catch (error) {
    console.error("Error al guardar el pedido:", error)

    // Si falla IndexedDB, al menos guardar en localStorage
    const savedOrders = localStorage.getItem("orders")
    const existingOrders = savedOrders ? JSON.parse(savedOrders) : []
    localStorage.setItem("orders", JSON.stringify([...existingOrders, newOrder]))

    return newOrder
  }
}

// Función para obtener todos los pedidos
export async function getOrders(): Promise<Order[]> {
  try {
    // Intentar sincronizar pedidos primero
    await syncOrders()

    // Obtener pedidos de IndexedDB
    const orders = await getAllOrdersFromDB()
    return orders
  } catch (error) {
    console.error("Error al obtener pedidos:", error)

    // Fallback a localStorage
    const savedOrders = localStorage.getItem("orders")
    return savedOrders ? JSON.parse(savedOrders) : []
  }
}

// Función para actualizar el estado de un pedido
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | null> {
  try {
    // Obtener todos los pedidos
    const orders = await getOrders()
    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) return null

    const updatedOrder = {
      ...orders[orderIndex],
      status,
    }

    // Actualizar en IndexedDB
    await updateOrderInDB(updatedOrder)

    // También actualizar en localStorage
    localStorage.setItem(
      "orders",
      JSON.stringify([...orders.slice(0, orderIndex), updatedOrder, ...orders.slice(orderIndex + 1)]),
    )

    return updatedOrder
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error)

    // Fallback a localStorage
    const savedOrders = localStorage.getItem("orders")
    if (!savedOrders) return null

    const orders = JSON.parse(savedOrders)
    const orderIndex = orders.findIndex((order: Order) => order.id === orderId)

    if (orderIndex === -1) return null

    const updatedOrder = {
      ...orders[orderIndex],
      status,
    }

    orders[orderIndex] = updatedOrder
    localStorage.setItem("orders", JSON.stringify(orders))

    return updatedOrder
  }
}

// Función para obtener estadísticas de ventas
export async function getSalesStats() {
  try {
    const orders = await getOrders()
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
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return {
      totalSales: 0,
      totalOrders: 0,
      productSales: {},
      salesByDay: [],
    }
  }
}
