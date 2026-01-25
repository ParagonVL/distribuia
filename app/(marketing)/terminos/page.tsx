import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos de Servicio - Distribuia",
  description: "Terminos y condiciones de uso de Distribuia.",
};

export default function TerminosPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="font-heading text-3xl font-bold text-navy mb-2">
        Terminos de Servicio
      </h1>
      <p className="text-gray-600 mb-8">
        Ultima actualizacion: Enero 2026
      </p>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          Identificacion del prestador
        </h2>
        <p className="text-gray-600">
          Distribuia es un servicio prestado por <strong>Paragonum S.L.U.</strong>, con CIF [PENDIENTE DE REGISTRO],
          domicilio en Carrer de Sant Vicent Martir 85, 8º dcha, 46007 Valencia,
          correo electronico: legal@distribuia.com.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          1. Aceptacion de los terminos
        </h2>
        <p className="text-gray-600 mb-4">
          Al acceder y utilizar Distribuia (&quot;el Servicio&quot;), aceptas estos Terminos de Servicio.
          Si no estas de acuerdo con alguna parte de estos terminos, no podras utilizar el Servicio.
        </p>
        <p className="text-gray-600">
          Estos terminos constituyen un acuerdo legal vinculante entre tu y el prestador del
          Servicio identificado anteriormente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          2. Descripcion del servicio
        </h2>
        <p className="text-gray-600 mb-4">
          Distribuia es una herramienta de repurposing de contenido que transforma videos,
          articulos y textos en publicaciones para redes sociales.
        </p>
        <p className="text-gray-600 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <strong>Uso de inteligencia artificial:</strong> Distribuia utiliza tecnologia de inteligencia
          artificial para transformar tu contenido. Los resultados generados son sugerencias automaticas
          que debes revisar antes de publicar. No garantizamos que el contenido generado sea preciso,
          original, o libre de errores.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          3. Registro y cuenta
        </h2>
        <p className="text-gray-600 mb-4">
          Para utilizar el Servicio debes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li>Proporcionar una direccion de correo electronico valida</li>
          <li>Ser mayor de 18 anos o tener capacidad legal para contratar</li>
          <li>Proporcionar informacion veraz y actualizada</li>
        </ul>
        <p className="text-gray-600">
          Eres responsable de mantener la confidencialidad de tu cuenta y contrasena,
          y de todas las actividades que ocurran bajo ella.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          4. Contenido y propiedad intelectual
        </h2>
        <p className="text-gray-600 mb-4">
          Eres responsable del contenido que introduces en Distribuia. Al usar el Servicio:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li><strong>Tu contenido:</strong> Garantizas que tienes los derechos necesarios sobre el contenido original o permiso para transformarlo.</li>
          <li><strong>Propiedad:</strong> Mantienes todos los derechos sobre tu contenido original y el contenido generado.</li>
          <li><strong>Licencia limitada:</strong> Nos concedes una licencia limitada para procesar tu contenido unicamente para proporcionarte el Servicio.</li>
          <li><strong>Verificacion:</strong> Eres responsable de verificar que el contenido generado no infringe derechos de terceros antes de publicarlo.</li>
          <li><strong>Contenido generado por IA:</strong> Los textos y materiales generados por Distribuia son sugerencias que debes revisar, verificar y adaptar antes de utilizarlos. No garantizamos su exactitud ni originalidad.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          5. Precios y pagos
        </h2>
        <p className="text-gray-600 mb-4">
          Distribuia ofrece diferentes planes de suscripcion:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li><strong>Plan Free:</strong> Limitado a 2 conversiones por mes. Sin coste.</li>
          <li><strong>Plan Starter:</strong> 10 conversiones por mes. Facturacion mensual.</li>
          <li><strong>Plan Pro:</strong> 30 conversiones por mes. Facturacion mensual.</li>
        </ul>
        <p className="text-gray-600">
          Todos los precios se muestran en euros (EUR) e incluyen IVA (21%).
          Los pagos se procesan de forma segura a traves de Stripe. Los precios pueden cambiar con previo aviso de 30 dias.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          6. Derecho de desistimiento y politica de reembolsos
        </h2>
        <p className="text-gray-600 mb-4">
          <strong>Derecho de desistimiento:</strong> Conforme a la normativa europea de proteccion al consumidor,
          dispones de 14 dias desde la contratacion de tu primera suscripcion de pago para ejercer el derecho
          de desistimiento y obtener el reembolso del primer pago.
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Renuncia al derecho de desistimiento:</strong> Si solicitas acceso inmediato al Servicio antes de
          que transcurra el plazo de 14 dias, al aceptar estos terminos y marcar la casilla correspondiente durante
          el proceso de pago, renuncias expresamente al derecho de desistimiento conforme al articulo 103.m) del
          Real Decreto Legislativo 1/2007.
        </p>
        <p className="text-gray-600">
          <strong>Suscripciones en curso:</strong> Para el segundo mes en adelante, no se realizan reembolsos
          por periodos parciales no utilizados.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          7. Renovacion y cancelacion
        </h2>
        <p className="text-gray-600 mb-4">
          Las suscripciones se renuevan automaticamente cada mes. Puedes cancelar en cualquier momento
          desde tu panel de configuracion o el portal de Stripe.
        </p>
        <p className="text-gray-600 mb-4">
          Al cancelar, mantendras acceso hasta el final del periodo facturado.
        </p>
        <p className="text-gray-600">
          Si bajas de plan, el cambio sera efectivo en el siguiente ciclo de facturacion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          8. Uso aceptable
        </h2>
        <p className="text-gray-600 mb-4">
          Te comprometes a no utilizar el Servicio para:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li>Actividades ilegales o fraudulentas</li>
          <li>Procesar contenido ilegal, difamatorio o fraudulento</li>
          <li>Infringir derechos de propiedad intelectual de terceros</li>
          <li>Procesar material para adultos o violento</li>
          <li>Promover discriminacion u odio</li>
          <li>Distribuir malware o codigo danino</li>
          <li>Sobrecargar ni interferir con el funcionamiento del Servicio</li>
          <li>Intentar acceder a cuentas de otros usuarios</li>
        </ul>
        <p className="text-gray-600">
          Nos reservamos el derecho de suspender o cancelar cuentas que violen estas normas,
          notificandote por email con 7 dias de antelacion salvo en casos de violaciones graves
          que requieran accion inmediata.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          9. Limitacion de responsabilidad
        </h2>
        <p className="text-gray-600 mb-4">
          Distribuia se proporciona &quot;tal cual&quot;. No garantizamos:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li>Que el Servicio este disponible de forma ininterrumpida</li>
          <li>La exactitud o calidad del contenido generado</li>
          <li>Que el contenido generado sea adecuado para cualquier proposito especifico</li>
          <li>Resultados especificos del uso del Servicio</li>
        </ul>
        <p className="text-gray-600">
          En la maxima medida permitida por la ley, nuestra responsabilidad total se limita al
          importe que hayas pagado por el Servicio en los ultimos 12 meses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          10. Disponibilidad del servicio
        </h2>
        <p className="text-gray-600">
          Nos esforzamos por mantener el Servicio disponible de forma continua, pero no garantizamos
          disponibilidad ininterrumpida. Podemos realizar mantenimientos, actualizaciones o suspender
          temporalmente el Servicio cuando sea necesario. Te notificaremos con antelacion cuando sea posible.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          11. Modificaciones
        </h2>
        <p className="text-gray-600">
          Podemos modificar estos terminos ocasionalmente. Te notificaremos cambios significativos
          por correo electronico o mediante aviso en la plataforma. El uso continuado del Servicio
          tras los cambios implica la aceptacion de los nuevos terminos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          12. Legislacion aplicable y resolucion de disputas
        </h2>
        <p className="text-gray-600 mb-4">
          Estos terminos se rigen por la legislacion espanola. Para cualquier controversia,
          las partes se someten a los juzgados y tribunales de Valencia, con renuncia a cualquier
          otro fuero que pudiera corresponderles.
        </p>
        <p className="text-gray-600">
          Como consumidor en la Union Europea, tambien puedes acudir a la plataforma de resolucion
          de litigios en linea de la Comision Europea:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark"
          >
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          13. Contacto
        </h2>
        <p className="text-gray-600 mb-4">
          Para cualquier consulta sobre estos terminos, contacta con nosotros en:{" "}
          <a href="mailto:legal@distribuia.com" className="text-primary hover:text-primary-dark">
            legal@distribuia.com
          </a>
        </p>
        <p className="text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg border">
          Al utilizar Distribuia, confirmas que has leido, entendido y aceptado estos Terminos de
          Servicio y nuestra{" "}
          <a href="/privacidad" className="text-primary hover:text-primary-dark">
            Politica de Privacidad
          </a>.
        </p>
      </section>
    </div>
  );
}
