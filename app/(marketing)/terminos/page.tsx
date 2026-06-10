export const metadata = { title: 'Términos y Condiciones | Refugia' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Términos y Condiciones de Uso</h1>
        <p className="text-stone-500 mb-8">Última actualización: Abril 2026</p>

        <div className="space-y-6 text-stone-600">
          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">1. Naturaleza del Servicio</h2>
            <p>
              Refugia actúa como un intermediario tecnológico que facilita la conexión entre familias que requieren servicios de cuidado infantil (las "Familias") y profesionales independientes que ofrecen dichos servicios (las "Niñeras").
              Refugia no es el empleador directo de las niñeras. Las niñeras operan como profesionales independientes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">2. Pagos y Pasarela</h2>
            <p>
              Todos los pagos por concepto de servicios de cuidado se realizan a través de nuestra pasarela de pagos integrada (Flow). 
              El pago se solicita en el momento de crear la solicitud de servicio. 
              Refugia retiene los fondos de forma segura hasta que el servicio sea prestado o la solicitud sea procesada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">3. Reembolsos y Cancelaciones</h2>
            <p>
              Si una familia realiza el pago y la niñera no acepta la solicitud, el monto íntegro será reembolsado a la cuenta de origen. 
              Si la familia cancela el servicio con más de 24 horas de anticipación, se reembolsará el 100% del pago.
              Cancelaciones tardías (menos de 24 horas) podrán incurrir en un cobro proporcional al tiempo bloqueado de la niñera.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">4. Pagos a las Niñeras</h2>
            <p>
              Refugia realiza los pagos (payouts) a las niñeras de manera semanal, transfiriendo las ganancias de todos los servicios exitosamente completados y confirmados en la plataforma, descontando la comisión de uso de plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">5. Verificación de Perfiles</h2>
            <p>
              Aunque Refugia realiza procesos de verificación de antecedentes e identidad de las niñeras, la responsabilidad final de seleccionar a la persona adecuada recae en la familia. Recomendamos revisar las reseñas y calificaciones previas.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
