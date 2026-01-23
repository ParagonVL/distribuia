import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos de Servicio - Distribuia",
  description: "Terminos y condiciones de uso del servicio Distribuia.",
};

export default function TerminosPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="font-heading text-3xl font-bold text-navy mb-2">
        Terminos de Servicio
      </h1>
      <p className="text-gray-500 mb-8">
        Ultima actualizacion: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <p className="lead text-lg text-gray-600 mb-8">
        Al usar Distribuia, aceptas estos terminos de servicio. Por favor, leelos detenidamente
        antes de utilizar nuestra plataforma.
      </p>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          1. Uso del servicio
        </h2>
        <p className="text-gray-600 mb-4">
          Distribuia es una herramienta de repurposing de contenido que transforma videos,
          articulos y textos en publicaciones para redes sociales.
        </p>
        <p className="text-gray-600 mb-4">
          Al usar el servicio, te comprometes a:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Proporcionar informacion veraz al registrarte</li>
          <li>Mantener la seguridad de tu cuenta y contrasena</li>
          <li>No usar el servicio para fines ilegales o no autorizados</li>
          <li>No intentar acceder a cuentas de otros usuarios</li>
          <li>No sobrecargar ni interferir con el funcionamiento del servicio</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          2. Contenido y propiedad intelectual
        </h2>
        <p className="text-gray-600 mb-4">
          Eres responsable del contenido que introduces en Distribuia. Al usar el servicio:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            Garantizas que tienes los derechos necesarios sobre el contenido original
            o permiso para transformarlo.
          </li>
          <li>
            Mantienes todos los derechos sobre tu contenido original y el contenido generado.
          </li>
          <li>
            Nos concedes una licencia limitada para procesar tu contenido unicamente
            para proporcionarte el servicio.
          </li>
          <li>
            Eres responsable de verificar que el contenido generado no infringe
            derechos de terceros antes de publicarlo.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          3. Planes y pagos
        </h2>
        <p className="text-gray-600 mb-4">
          Distribuia ofrece diferentes planes de suscripcion:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>Plan Free:</strong> Limitado a 2 conversiones por mes. Sin coste.
          </li>
          <li>
            <strong>Plan Starter:</strong> 10 conversiones por mes. Facturacion mensual.
          </li>
          <li>
            <strong>Plan Pro:</strong> 30 conversiones por mes. Facturacion mensual.
          </li>
        </ul>
        <p className="text-gray-600 mt-4">
          Los pagos se procesan de forma segura a traves de Stripe. Los precios pueden
          cambiar con previo aviso de 30 dias.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          4. Renovacion y cancelacion
        </h2>
        <p className="text-gray-600 mb-4">
          Las suscripciones se renuevan automaticamente cada mes. Puedes cancelar en cualquier
          momento desde tu panel de configuracion o el portal de Stripe.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            Al cancelar, mantendras acceso hasta el final del periodo facturado.
          </li>
          <li>
            No ofrecemos reembolsos por periodos parciales no utilizados.
          </li>
          <li>
            Si bajas de plan, el cambio sera efectivo en el siguiente ciclo de facturacion.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          5. Limitaciones del servicio
        </h2>
        <p className="text-gray-600 mb-4">
          Distribuia se proporciona &quot;tal cual&quot;. No garantizamos:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Que el servicio este disponible de forma ininterrumpida</li>
          <li>La exactitud o calidad del contenido generado</li>
          <li>Que el contenido generado sea adecuado para cualquier proposito especifico</li>
          <li>Resultados especificos del uso del servicio</li>
        </ul>
        <p className="text-gray-600 mt-4">
          Nuestra responsabilidad se limita al importe pagado por el servicio en los
          ultimos 12 meses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          6. Contenido prohibido
        </h2>
        <p className="text-gray-600 mb-4">
          No puedes usar Distribuia para procesar contenido que:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Sea ilegal, difamatorio o fraudulento</li>
          <li>Infrinja derechos de propiedad intelectual de terceros</li>
          <li>Contenga material para adultos o violento</li>
          <li>Promueva discriminacion u odio</li>
          <li>Contenga malware o codigo danino</li>
        </ul>
        <p className="text-gray-600 mt-4">
          Nos reservamos el derecho de suspender cuentas que violen estas normas.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          7. Modificaciones del servicio
        </h2>
        <p className="text-gray-600">
          Podemos modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier
          momento. Te notificaremos con antelacion razonable cualquier cambio significativo que
          afecte a tu uso del servicio.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          8. Cambios en los terminos
        </h2>
        <p className="text-gray-600">
          Podemos actualizar estos terminos ocasionalmente. Te notificaremos cualquier cambio
          material por email. El uso continuado del servicio despues de los cambios constituye
          tu aceptacion de los nuevos terminos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          9. Ley aplicable
        </h2>
        <p className="text-gray-600">
          Estos terminos se rigen por las leyes de Espana. Cualquier disputa sera resuelta
          en los tribunales de Madrid, Espana.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          10. Contacto
        </h2>
        <p className="text-gray-600">
          Si tienes preguntas sobre estos terminos, contactanos en:
        </p>
        <p className="text-gray-600 mt-2">
          <strong>Email:</strong> legal@distribuia.com
        </p>
      </section>
    </div>
  );
}
