"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function Header() {
  const { cart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-orange-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Empanadas & Arepas
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-amber-200 transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-amber-200 transition-colors">
              Productos
            </Link>
            <Link href="/carrito">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-orange-700 hover:text-white bg-orange-500"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Carrito
                {totalItems > 0 && (
                  <span className="ml-1 bg-white text-amber-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-orange-700 hover:text-white bg-orange-500"
              >
                <User className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <Link href="/carrito" className="mr-4">
              <Button
                variant="outline"
                size="icon"
                className="text-white border-white hover:bg-orange-700 hover:text-white bg-orange-500 relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-amber-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/admin/login" className="mr-4">
              <Button
                variant="outline"
                size="icon"
                className="text-white border-white hover:bg-orange-700 hover:text-white bg-orange-500"
              >
                <User className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white border-white hover:bg-orange-700 hover:text-white bg-orange-500"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden absolute w-full bg-orange-700 z-50 shadow-lg transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-screen py-4" : "max-h-0 overflow-hidden py-0",
        )}
      >
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link
            href="/"
            className="hover:text-amber-200 transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className="hover:text-amber-200 transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Productos
          </Link>
        </div>
      </div>
    </header>
  )
}
