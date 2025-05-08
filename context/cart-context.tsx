"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: CartItem) => void
  removeFromCart: (product: CartItem) => void
  updateQuantity: (product: CartItem, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      // Check if the product is already in the cart (including the withDrink option)
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.withDrink === product.withDrink,
      )

      if (existingItemIndex >= 0) {
        // If it exists, increase the quantity
        const newCart = [...prevCart]
        newCart[existingItemIndex].quantity += 1
        return newCart
      } else {
        // If it doesn't exist, add it with quantity 1
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (product: CartItem) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === product.id && item.withDrink === product.withDrink)))
  }

  const updateQuantity = (product: CartItem, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === product.id && item.withDrink === product.withDrink ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
