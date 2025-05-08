"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // No redirigir si ya estamos en la página de login
    if (pathname === "/admin/login") return

    // Redirigir a login si no está autenticado
    if (!isAuthenticated()) {
      router.push("/admin/login")
    }
  }, [pathname, router])

  // Si estamos en la página de login, mostrar directamente el contenido
  if (pathname === "/admin/login") {
    return children
  }

  // Para otras páginas de admin, verificar autenticación
  return isAuthenticated() ? children : null
}
