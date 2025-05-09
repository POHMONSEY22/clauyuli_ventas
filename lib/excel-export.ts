import { utils, write } from "xlsx"
import type { Order } from "./orders"

// Función para formatear la fecha en un formato legible
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Función para convertir el estado a un texto en español
function formatStatus(status: Order["status"]): string {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "completed":
      return "Completado"
    case "cancelled":
      return "Cancelado"
    default:
      return status
  }
}

// Función para exportar pedidos a Excel
export function exportOrdersToExcel(orders: Order[], fileName = "pedidos"): void {
  try {
    // Crear una hoja de cálculo para la información general de pedidos
    const ordersWorksheet = utils.json_to_sheet(
      orders.map((order) => ({
        "ID Pedido": order.id.split("-")[1],
        Fecha: formatDate(order.createdAt),
        Cliente: order.customerName,
        Teléfono: order.customerPhone,
        Dirección: order.customerAddress || "N/A",
        Total: `$${order.total.toLocaleString()}`,
        Estado: formatStatus(order.status),
        Productos: order.items.length,
      })),
    )

    // Ajustar el ancho de las columnas
    const ordersCols = [
      { wch: 10 }, // ID Pedido
      { wch: 20 }, // Fecha
      { wch: 20 }, // Cliente
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Dirección
      { wch: 12 }, // Total
      { wch: 12 }, // Estado
      { wch: 10 }, // Productos
    ]
    ordersWorksheet["!cols"] = ordersCols

    // Crear una hoja de cálculo para los detalles de productos
    const productsData: any[] = []

    orders.forEach((order) => {
      order.items.forEach((item) => {
        productsData.push({
          "ID Pedido": order.id.split("-")[1],
          Fecha: formatDate(order.createdAt),
          Cliente: order.customerName,
          Producto: item.name,
          Categoría: item.category,
          Cantidad: item.quantity,
          "Precio Unitario": `$${item.price.toLocaleString()}`,
          "Con Bebida": item.withDrink ? "Sí" : "No",
          Subtotal: `$${(item.price * item.quantity).toLocaleString()}`,
          Estado: formatStatus(order.status),
        })
      })
    })

    const productsWorksheet = utils.json_to_sheet(productsData)

    // Ajustar el ancho de las columnas
    const productsCols = [
      { wch: 10 }, // ID Pedido
      { wch: 20 }, // Fecha
      { wch: 20 }, // Cliente
      { wch: 20 }, // Producto
      { wch: 12 }, // Categoría
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Precio Unitario
      { wch: 10 }, // Con Bebida
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Estado
    ]
    productsWorksheet["!cols"] = productsCols

    // Crear una hoja de cálculo para las estadísticas
    const completedOrders = orders.filter((order) => order.status === "completed")
    const pendingOrders = orders.filter((order) => order.status === "pending")
    const cancelledOrders = orders.filter((order) => order.status === "cancelled")

    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0)
    const averageTicket = completedOrders.length > 0 ? totalSales / completedOrders.length : 0

    // Agrupar ventas por categoría de producto
    const salesByCategory: Record<string, number> = {}
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!salesByCategory[item.category]) {
          salesByCategory[item.category] = 0
        }
        salesByCategory[item.category] += item.price * item.quantity
      })
    })

    const statsData = [
      { Estadística: "Total de Pedidos", Valor: orders.length },
      { Estadística: "Pedidos Completados", Valor: completedOrders.length },
      { Estadística: "Pedidos Pendientes", Valor: pendingOrders.length },
      { Estadística: "Pedidos Cancelados", Valor: cancelledOrders.length },
      { Estadística: "Ventas Totales", Valor: `$${totalSales.toLocaleString()}` },
      { Estadística: "Ticket Promedio", Valor: `$${Math.round(averageTicket).toLocaleString()}` },
    ]

    // Añadir ventas por categoría
    Object.entries(salesByCategory).forEach(([category, sales]) => {
      statsData.push({
        Estadística: `Ventas de ${category}`,
        Valor: `$${sales.toLocaleString()}`,
      })
    })

    const statsWorksheet = utils.json_to_sheet(statsData)

    // Ajustar el ancho de las columnas
    const statsCols = [
      { wch: 25 }, // Estadística
      { wch: 15 }, // Valor
    ]
    statsWorksheet["!cols"] = statsCols

    // Crear un libro de Excel con múltiples hojas
    const workbook = {
      SheetNames: ["Pedidos", "Productos", "Estadísticas"],
      Sheets: {
        Pedidos: ordersWorksheet,
        Productos: productsWorksheet,
        Estadísticas: statsWorksheet,
      },
    }

    // Generar el archivo Excel
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" })

    // Crear un Blob con los datos
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    // Crear un enlace para descargar el archivo
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`
    document.body.appendChild(a)
    a.click()

    // Limpiar
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)

    return true
  } catch (error) {
    console.error("Error al exportar a Excel:", error)
    return false
  }
}

// Función para exportar estadísticas de ventas a Excel
export function exportSalesStatsToExcel(stats: any, fileName = "estadisticas-ventas"): void {
  try {
    // Datos generales
    const generalData = [
      { Estadística: "Ventas Totales", Valor: `$${stats.totalSales.toLocaleString()}` },
      { Estadística: "Pedidos Completados", Valor: stats.totalOrders },
      {
        Estadística: "Ticket Promedio",
        Valor: `$${Math.round(stats.totalSales / stats.totalOrders).toLocaleString()}`,
      },
    ]

    const generalWorksheet = utils.json_to_sheet(generalData)

    // Ventas por día
    const salesByDayWorksheet = utils.json_to_sheet(
      stats.salesByDay.map((day: any) => ({
        Fecha: day.date,
        Pedidos: day.orders,
        Ventas: `$${day.revenue.toLocaleString()}`,
      })),
    )

    // Ventas por producto
    const productSalesData = Object.entries(stats.productSales).map(([productId, data]: [string, any]) => ({
      Producto: productId,
      Cantidad: data.quantity,
      Ventas: `$${data.revenue.toLocaleString()}`,
    }))

    const productSalesWorksheet = utils.json_to_sheet(productSalesData)

    // Crear un libro de Excel con múltiples hojas
    const workbook = {
      SheetNames: ["General", "Ventas por Día", "Ventas por Producto"],
      Sheets: {
        General: generalWorksheet,
        "Ventas por Día": salesByDayWorksheet,
        "Ventas por Producto": productSalesWorksheet,
      },
    }

    // Generar el archivo Excel
    const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" })

    // Crear un Blob con los datos
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

    // Crear un enlace para descargar el archivo
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`
    document.body.appendChild(a)
    a.click()

    // Limpiar
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)

    return true
  } catch (error) {
    console.error("Error al exportar estadísticas a Excel:", error)
    return false
  }
}
