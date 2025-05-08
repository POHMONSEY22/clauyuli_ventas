export interface Product {
  id: string
  name: string
  description: string
  price: number
  priceWithDrink: number
  image: string
  category: "empanada" | "pastel" | "arepa"
  hasDrinkOption: boolean
}

export interface CartItem extends Product {
  quantity: number
  withDrink: boolean
}
