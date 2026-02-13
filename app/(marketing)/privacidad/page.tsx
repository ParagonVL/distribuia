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
      <p className="text-gray-600 mb-8">
        Ultima actualizacion: Enero 2026
      </p>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          1. Responsable del tratamiento
        </h2>
        <p className="text-gray-600 mb-4">
          El responsable del tratamiento de tus datos personales es <strong>Paragonum S.L.U.</strong>,
          con CIF B26660944, domicilio en Carrer de Sant Vicent Màrtir 85, 8º dcha, 46007 Valencia.
        </p>
        <p className="text-gray-600">
          Para cualquier consulta relacionada con la privacidad, puedes contactarnos en:{" "}
          <a href="mailto:legal@distribuia.com" className="text-primary hover:text-primary-dark">
            legal@distribuia.com
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          2. Datos que recopilamos
        </h2>
        <p className="text-gray-600 mb-4">
          Recopilamos la siguiente información cuando usas Distribuia:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li><strong>Información de cuenta:</strong> Email y contraseña cuando te registras.</li>
          <li><strong>Contenido procesado:</strong> URLs de YouTube, artículos y textos que introduces para transformar. Este contenido se procesa mediante inteligencia artificial pero no se almacena permanentemente despues de la conversion.</li>
          <li><strong>Datos de uso:</strong> Numero de conversiones realizadas, fechas de uso y preferencias de configuración.</li>
          <li><strong>Información de pago:</strong> Procesada de forma segura a traves de Stripe. No almacenamos datos de tarjetas de credito en nuestros servidores.</li>
          <li><strong>Datos técnicos:</strong> Dirección IP y tipo de navegador, para el funcionamiento del servicio.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          3. Finalidad del tratamiento
        </h2>
        <p className="text-gray-600 mb-4">
          Utilizamos tu información para:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Crear y gestionar tu cuenta de usuario</li>
          <li>Proporcionar el servicio de transformacion de contenido</li>
          <li>Gestionar tu suscripción y procesar pagos</li>
          <li>Enviarte comunicaciones relacionadas con el servicio</li>
          <li>Mejorar nuestros productos y servicios</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          4. Base legal del tratamiento
        </h2>
        <p className="text-gray-600 mb-4">
          El tratamiento de tus datos se basa en:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li><strong>Ejecucion de contrato:</strong> Para prestarte el servicio de Distribuia que has contratado.</li>
          <li><strong>Interes legitimo:</strong> Para mejorar el servicio, prevenir fraudes y garantizar la seguridad.</li>
          <li><strong>Consentimiento:</strong> Para el envio de comunicaciones comerciales (si lo autorizas expresamente).</li>
          <li><strong>Obligacion legal:</strong> Para conservar datos de facturación segun la normativa fiscal espanola.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          5. Terceros y encargados del tratamiento
        </h2>
        <p className="text-gray-600 mb-4">
          Compartimos datos con los siguientes proveedores de servicios:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Proveedor</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Proposito</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Ubicacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-medium">Supabase</td>
                <td className="px-4 py-3">Autenticacion y almacenamiento de datos</td>
                <td className="px-4 py-3">Unión Europea</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Groq</td>
                <td className="px-4 py-3">Procesamiento de contenido con inteligencia artificial. El contenido se procesa de forma temporal y no se almacena permanentemente.</td>
                <td className="px-4 py-3">Estados Unidos (EU-US Data Privacy Framework)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Stripe</td>
                <td className="px-4 py-3">Procesamiento seguro de pagos. Certificado PCI-DSS.</td>
                <td className="px-4 py-3">Unión Europea</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Vercel</td>
                <td className="px-4 py-3">Alojamiento de la aplicacion</td>
                <td className="px-4 py-3">Unión Europea</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 mt-4">
          Todos nuestros proveedores cumplen con el RGPD y tienen contratos de tratamiento de datos vigentes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          6. Transferencias internacionales
        </h2>
        <p className="text-gray-600 mb-4">
          Algunos de nuestros proveedores (como Groq) pueden procesar datos fuera del Espacio Economico Europeo.
          En estos casos, nos aseguramos de que existan garantias adecuadas conforme al RGPD, como:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li>Clausulas Contractuales Tipo de la Comision Europea</li>
          <li>Certificacion bajo el EU-US Data Privacy Framework</li>
        </ul>
        <p className="text-gray-600">
          El contenido que procesas a traves de Groq se transmite de forma cifrada, se utiliza únicamente
          para generar la transformacion solicitada, y no se almacena permanentemente ni se utiliza para
          entrenar modelos de IA.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          7. Politica de Cookies
        </h2>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Que son las cookies?
        </h3>
        <p className="text-gray-600 mb-4">
          Las cookies son pequenos archivos de texto que los sitios web almacenan en tu dispositivo
          para recordar información sobre tu visita.
        </p>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Cookies esenciales (necesarias)
        </h3>
        <p className="text-gray-600 mb-4">
          Estas cookies son imprescindibles para el funcionamiento del sitio.
          No requieren tu consentimiento previo, pero te informamos de su uso:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Cookie</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Proveedor</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Proposito</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Duracion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-access-token</td>
                <td className="px-4 py-3">Supabase</td>
                <td className="px-4 py-3">Autenticacion de usuario</td>
                <td className="px-4 py-3">Sesion</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-refresh-token</td>
                <td className="px-4 py-3">Supabase</td>
                <td className="px-4 py-3">Renovación de sesion</td>
                <td className="px-4 py-3">7 dias</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">__stripe_mid</td>
                <td className="px-4 py-3">Stripe</td>
                <td className="px-4 py-3">Prevencion de fraude en pagos</td>
                <td className="px-4 py-3">1 ano</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">__stripe_sid</td>
                <td className="px-4 py-3">Stripe</td>
                <td className="px-4 py-3">Sesion de pago</td>
                <td className="px-4 py-3">30 minutos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Cookies analiticas (opcionales)
        </h3>
        <p className="text-gray-600 mb-4">
          Actualmente no utilizamos cookies analiticas o de marketing de terceros.
        </p>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Como gestionar las cookies
        </h3>
        <p className="text-gray-600 mb-4">
          Puedes gestionar las cookies desde la configuración de privacidad de tu navegador.
          Ten en cuenta que bloquear las cookies esenciales puede afectar al funcionamiento del servicio.
        </p>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Base legal para cookies
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li><strong>Cookies esenciales:</strong> Interes legitimo (Art. 6.1.f RGPD) — necesarias para el funcionamiento del servicio.</li>
          <li><strong>Cookies analiticas:</strong> Consentimiento (Art. 6.1.a RGPD) — solo se activan si las aceptas expresamente.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          8. Retencion de datos
        </h2>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Datos de cuenta activa
        </h3>
        <p className="text-gray-600 mb-4">
          Mientras mantengas tu cuenta activa en Distribuia, conservamos:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Tipo de dato</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Retencion</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">Email y datos de autenticacion</td>
                <td className="px-4 py-3">Mientras la cuenta este activa</td>
                <td className="px-4 py-3">Necesario para el servicio</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Historial de conversiones (metadatos)</td>
                <td className="px-4 py-3">Mientras la cuenta este activa</td>
                <td className="px-4 py-3">Funcionalidad del producto</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Contenido procesado</td>
                <td className="px-4 py-3">No se almacena permanentemente</td>
                <td className="px-4 py-3">Solo procesamiento temporal</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Datos de pago (referencia)</td>
                <td className="px-4 py-3">5 anos desde la transaccion</td>
                <td className="px-4 py-3">Obligacion fiscal espanola (Ley 58/2003 General Tributaria)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Datos de cuenta eliminada
        </h3>
        <p className="text-gray-600 mb-4">
          Cuando eliminas tu cuenta:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Tipo de dato</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Accion</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Plazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">Datos personales</td>
                <td className="px-4 py-3">Eliminacion</td>
                <td className="px-4 py-3">30 dias</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Historial de uso</td>
                <td className="px-4 py-3">Eliminacion o anonimizacion</td>
                <td className="px-4 py-3">30 dias</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Registros de pago (Stripe)</td>
                <td className="px-4 py-3">Conservados en Stripe</td>
                <td className="px-4 py-3">7 anos (obligacion legal)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Logs de sistema</td>
                <td className="px-4 py-3">Anonimizados</td>
                <td className="px-4 py-3">30 dias</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          9. Tus derechos
        </h2>
        <p className="text-gray-600 mb-4">
          De acuerdo con el RGPD, tienes derecho a:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
          <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales.</li>
          <li><strong>Rectificacion:</strong> Corregir datos incorrectos o incompletos.</li>
          <li><strong>Supresion:</strong> Solicitar la eliminación de tus datos (&quot;derecho al olvido&quot;).</li>
          <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y de uso comun.</li>
          <li><strong>Oposicion:</strong> Oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
          <li><strong>Limitacion:</strong> Solicitar la limitacion del tratamiento.</li>
        </ul>
        <p className="text-gray-600 mb-4">
          Puedes ejercer estos derechos desde la configuración de tu cuenta o contactandonos en{" "}
          <a href="mailto:legal@distribuia.com" className="text-primary hover:text-primary-dark">
            legal@distribuia.com
          </a>. Responderemos en un plazo máximo de 30 dias.
        </p>
        <p className="text-gray-600">
          También tienes derecho a presentar una reclamacion ante la Agencia Espanola de Proteccion
          de Datos (AEPD) si consideras que tus derechos han sido vulnerados:{" "}
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark"
          >
            https://www.aepd.es
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          10. Seguridad
        </h2>
        <p className="text-gray-600 mb-4">
          Implementamos medidas de seguridad tecnicas y organizativas para proteger tus datos, incluyendo:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Cifrado en transito (TLS) y en reposo</li>
          <li>Autenticacion segura</li>
          <li>Acceso restringido a los datos basado en principio de mínimo privilegio</li>
          <li>Monitorizacion y auditoria de accesos</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          11. Cambios en esta politica
        </h2>
        <p className="text-gray-600">
          Podemos actualizar esta politica de privacidad ocasionalmente. Te notificaremos cualquier
          cambio significativo por correo electronico o mediante un aviso en la aplicacion.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          12. Contacto
        </h2>
        <p className="text-gray-600">
          Si tienes preguntas sobre esta politica de privacidad o quieres ejercer tus derechos,
          puedes contactarnos en:{" "}
          <a href="mailto:legal@distribuia.com" className="text-primary hover:text-primary-dark">
            legal@distribuia.com
          </a>
        </p>
      </section>
    </div>
  );
}
