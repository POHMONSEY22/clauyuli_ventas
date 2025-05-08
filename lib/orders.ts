"use client"

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

// Función para obtener todos los pedidos
export function getOrders(): Order[] {
  if (typeof window === "undefined") return []

  try {
    const savedOrders = localStorage.getItem("orders")
    return savedOrders ? JSON.parse(savedOrders) : []
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return []
  }
}

// Función para actualizar el estado de un pedido
export function updateOrderStatus(orderId: string, status: Order["status"]): Order | null {
  if (typeof window === "undefined") return null

  try {
    const orders = getOrders()
    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) return null

    const updatedOrder = {
      ...orders[orderIndex],
      status,
    }

    const updatedOrders = [...orders.slice(0, orderIndex), updatedOrder, ...orders.slice(orderIndex + 1)]

    // Actualizar en localStorage
    localStorage.setItem("orders", JSON.stringify(updatedOrders))

    return updatedOrder
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error)
    return null
  }
}

// Función para obtener estadísticas de ventas
export function getSalesStats() {
  try {
    const orders = getOrders()
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
