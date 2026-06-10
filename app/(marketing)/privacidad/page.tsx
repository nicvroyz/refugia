export const metadata = { title: 'Políticas de Privacidad | Refugia' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Políticas de Privacidad</h1>
        <p className="text-stone-500 mb-8">Última actualización: Abril 2026</p>

        <div className="space-y-6 text-stone-600">
          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">1. Recopilación de Datos</h2>
            <p>
              Recopilamos información necesaria para proporcionar un entorno seguro, incluyendo nombres, correos electrónicos, identificaciones oficiales (para niñeras) y direcciones aproximadas. Nunca publicamos su dirección exacta; solo se comparte de forma privada con la niñera una vez confirmado el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">2. Perfiles de Menores</h2>
            <p>
              La información sobre los niños (edades, condiciones especiales, rutinas) proporcionada en el "Perfil del Niño" se mantiene estrictamente confidencial. Esta información únicamente se comparte con la niñera seleccionada para garantizar un cuidado personalizado y seguro. Usted no está obligado a ingresar el nombre real del menor si prefiere usar un alias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">3. Procesamiento de Pagos</h2>
            <p>
              La información de sus tarjetas de crédito o débito no es almacenada en nuestros servidores. Todo el procesamiento de pagos se delega a pasarelas de pago certificadas (Flow), las cuales cumplen con los más altos estándares de seguridad PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">4. Comunicaciones</h2>
            <p>
              Al registrarse, acepta recibir correos electrónicos transaccionales sobre sus solicitudes de servicio. Los mensajes enviados a través de nuestra plataforma de chat interna pueden ser monitoreados automatizadamente por razones de seguridad para prevenir fraudes o abusos.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
