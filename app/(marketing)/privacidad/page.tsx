import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Privacidad - Distribuia",
  description: "Politica de privacidad de Distribuia. Como recopilamos, usamos y protegemos tus datos.",
};

export default function PrivacidadPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="font-heading text-3xl font-bold text-navy mb-2">
        Politica de Privacidad
      </h1>
      <p className="text-gray-500 mb-8">
        Ultima actualizacion: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <p className="lead text-lg text-gray-600 mb-8">
        En Distribuia nos tomamos muy en serio la privacidad de nuestros usuarios.
        Esta politica explica como recopilamos, usamos y protegemos tu informacion personal.
      </p>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          1. Datos que recopilamos
        </h2>
        <p className="text-gray-600 mb-4">
          Recopilamos la siguiente informacion cuando usas Distribuia:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>Informacion de cuenta:</strong> Email y contrasena cuando te registras.
          </li>
          <li>
            <strong>Contenido procesado:</strong> URLs de YouTube, articulos y textos que
            introduces para transformar. Este contenido se procesa pero no se almacena
            permanentemente despues de la conversion.
          </li>
          <li>
            <strong>Datos de uso:</strong> Numero de conversiones realizadas, fechas de uso
            y preferencias de configuracion.
          </li>
          <li>
            <strong>Informacion de pago:</strong> Procesada de forma segura a traves de Stripe.
            No almacenamos datos de tarjetas de credito.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          2. Como usamos tus datos
        </h2>
        <p className="text-gray-600 mb-4">
          Utilizamos tu informacion para:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Proporcionar y mejorar el servicio de Distribuia</li>
          <li>Gestionar tu cuenta y suscripcion</li>
          <li>Enviarte comunicaciones relacionadas con el servicio</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          3. Terceros con acceso a datos
        </h2>
        <p className="text-gray-600 mb-4">
          Utilizamos los siguientes servicios de terceros:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>Supabase:</strong> Para autenticacion y almacenamiento de datos.
            Los servidores estan ubicados en la Union Europea.
          </li>
          <li>
            <strong>Groq:</strong> Para el procesamiento de contenido con inteligencia artificial.
            El contenido se procesa de forma temporal y no se almacena.
          </li>
          <li>
            <strong>Stripe:</strong> Para el procesamiento seguro de pagos.
            Cumple con los estandares PCI-DSS.
          </li>
          <li>
            <strong>Vercel:</strong> Para el alojamiento de la aplicacion.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          4. Tus derechos
        </h2>
        <p className="text-gray-600 mb-4">
          De acuerdo con el RGPD, tienes derecho a:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Acceder a tus datos personales</li>
          <li>Rectificar datos incorrectos</li>
          <li>Solicitar la eliminacion de tus datos</li>
          <li>Exportar tus datos en un formato portable</li>
          <li>Oponerte al procesamiento de tus datos</li>
        </ul>
        <p className="text-gray-600 mt-4">
          Puedes ejercer estos derechos desde la configuracion de tu cuenta o contactandonos directamente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          5. Retencion de datos
        </h2>
        <p className="text-gray-600">
          Conservamos tus datos mientras mantengas una cuenta activa. Si cancelas tu cuenta,
          eliminaremos tus datos personales en un plazo de 30 dias, excepto aquellos que
          debamos conservar por obligaciones legales.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          6. Seguridad
        </h2>
        <p className="text-gray-600">
          Implementamos medidas de seguridad tecnicas y organizativas para proteger tus datos,
          incluyendo encriptacion en transito y en reposo, autenticacion segura y acceso
          restringido a los datos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          7. Contacto
        </h2>
        <p className="text-gray-600">
          Si tienes preguntas sobre esta politica de privacidad o quieres ejercer tus derechos,
          puedes contactarnos en:
        </p>
        <p className="text-gray-600 mt-2">
          <strong>Email:</strong> privacidad@distribuia.com
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          8. Cambios en esta politica
        </h2>
        <p className="text-gray-600">
          Podemos actualizar esta politica ocasionalmente. Te notificaremos cualquier cambio
          significativo por email o mediante un aviso en la aplicacion.
        </p>
      </section>
    </div>
  );
}
