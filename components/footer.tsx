export default function Footer() {
  return (
    <footer className="bg-amber-800 text-amber-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Empanadas & Arepas</h3>
            <p className="mb-2">Los mejores sabores tradicionales</p>
            <p>Hechos con ingredientes frescos y de calidad</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Horario</h3>
            <p className="mb-2">Lunes a Viernes: 10:00 AM - 8:00 PM</p>
            <p>Sábados y Domingos: 11:00 AM - 9:00 PM</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <p className="mb-2">Teléfono: (123) 456-7890</p>
            <p>Email: info@empanadasarepas.com</p>
          </div>
        </div>

        <div className="border-t border-amber-700 mt-8 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} Empanadas & Arepas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
