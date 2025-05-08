// En una aplicación real, usaríamos un sistema de autenticación más robusto
// y almacenaríamos las credenciales en una base de datos segura

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123" // En producción, usaríamos contraseñas hasheadas

export function authenticateAdmin(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  return localStorage.getItem("adminAuthenticated") === "true"
}

export function loginAdmin(): void {
  if (typeof window === "undefined") return

  localStorage.setItem("adminAuthenticated", "true")
}

export function logoutAdmin(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("adminAuthenticated")
}
