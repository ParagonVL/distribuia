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
        Ultima actualizacion: Enero 2025
      </p>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          Responsable del tratamiento
        </h2>
        <p className="text-gray-600 mb-4">
          El responsable del tratamiento de tus datos personales es:
        </p>
        <ul className="list-none pl-0 space-y-1 text-gray-600">
          <li><strong>Empresa:</strong> Paragonum S.L.U.</li>
          <li><strong>CIF:</strong> [PENDIENTE DE REGISTRO]</li>
          <li><strong>Domicilio:</strong> Carrer de Sant Vicent Martir 85, 8º dcha, 46007 Valencia</li>
          <li><strong>Email:</strong> legal@distribuia.com</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          1. Datos que recopilamos
        </h2>
        <p className="text-gray-600 mb-4">
          Recopilamos los siguientes tipos de datos personales:
        </p>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Datos de registro y cuenta
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Direccion de correo electronico</li>
          <li>Contrasena (almacenada de forma encriptada)</li>
          <li>Fecha de registro</li>
          <li>Plan de suscripcion</li>
        </ul>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Datos de uso del servicio
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>URLs de YouTube y articulos procesados</li>
          <li>Textos introducidos para conversion</li>
          <li>Contenido generado (hilos, posts, articulos)</li>
          <li>Numero de conversiones realizadas</li>
          <li>Historial de conversiones</li>
          <li>Preferencias de tono y formato</li>
        </ul>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Datos tecnicos
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Direccion IP (para seguridad y prevencion de fraude)</li>
          <li>Tipo de navegador y dispositivo</li>
          <li>Fechas y horas de acceso</li>
        </ul>

        <h3 className="font-heading text-lg font-medium text-navy mt-6 mb-3">
          Datos de pago
        </h3>
        <p className="text-gray-600">
          Los pagos se procesan a traves de Stripe. <strong>No almacenamos datos de tarjetas
          de credito</strong> en nuestros servidores. Stripe cumple con los estandares PCI-DSS
          de nivel 1, el nivel mas alto de certificacion de seguridad de pagos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          2. Finalidad y base legal del tratamiento
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Finalidad</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Base legal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">Prestacion del servicio de conversion de contenido</td>
                <td className="px-4 py-3">Ejecucion del contrato (Art. 6.1.b RGPD)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Gestion de tu cuenta y suscripcion</td>
                <td className="px-4 py-3">Ejecucion del contrato (Art. 6.1.b RGPD)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Procesamiento de pagos</td>
                <td className="px-4 py-3">Ejecucion del contrato (Art. 6.1.b RGPD)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Comunicaciones sobre el servicio (actualizaciones, cambios)</td>
                <td className="px-4 py-3">Interes legitimo (Art. 6.1.f RGPD)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Comunicaciones de marketing (con consentimiento)</td>
                <td className="px-4 py-3">Consentimiento (Art. 6.1.a RGPD)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Prevencion de fraude y seguridad</td>
                <td className="px-4 py-3">Interes legitimo (Art. 6.1.f RGPD)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Cumplimiento de obligaciones legales y fiscales</td>
                <td className="px-4 py-3">Obligacion legal (Art. 6.1.c RGPD)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          3. Proveedores y terceros con acceso a datos
        </h2>
        <p className="text-gray-600 mb-4">
          Compartimos tus datos con los siguientes proveedores de servicios, todos ellos
          con garantias adecuadas de proteccion de datos:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Proveedor</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Funcion</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Ubicacion</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Garantias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-medium">Supabase</td>
                <td className="px-4 py-3">Base de datos y autenticacion</td>
                <td className="px-4 py-3">Union Europea (Frankfurt)</td>
                <td className="px-4 py-3">Servidores en UE, encriptacion</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Groq</td>
                <td className="px-4 py-3">Procesamiento IA para generacion de contenido</td>
                <td className="px-4 py-3">Estados Unidos</td>
                <td className="px-4 py-3">EU-US Data Privacy Framework</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Stripe</td>
                <td className="px-4 py-3">Procesamiento de pagos</td>
                <td className="px-4 py-3">Union Europea / Estados Unidos</td>
                <td className="px-4 py-3">PCI-DSS Nivel 1, EU-US DPF</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Vercel</td>
                <td className="px-4 py-3">Alojamiento de la aplicacion</td>
                <td className="px-4 py-3">Global (CDN)</td>
                <td className="px-4 py-3">EU-US Data Privacy Framework</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          4. Transferencias internacionales
        </h2>
        <p className="text-gray-600 mb-4">
          Algunos de nuestros proveedores estan ubicados fuera del Espacio Economico Europeo (EEE).
          En estos casos, nos aseguramos de que existan garantias adecuadas:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>EU-US Data Privacy Framework:</strong> Proveedores certificados bajo el marco
            de privacidad de datos UE-EEUU, que garantiza un nivel de proteccion equivalente al RGPD.
          </li>
          <li>
            <strong>Clausulas contractuales tipo:</strong> Cuando corresponda, utilizamos las
            clausulas contractuales tipo aprobadas por la Comision Europea.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          5. Cookies y tecnologias similares
        </h2>
        <p className="text-gray-600 mb-4">
          Utilizamos cookies estrictamente necesarias para el funcionamiento del servicio:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Cookie</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Proposito</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Duracion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token</td>
                <td className="px-4 py-3">Sesion de autenticacion (Supabase)</td>
                <td className="px-4 py-3">Sesion / 7 dias</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token-code-verifier</td>
                <td className="px-4 py-3">Verificacion de autenticacion PKCE</td>
                <td className="px-4 py-3">Sesion</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 mt-4">
          <strong>No utilizamos cookies de seguimiento ni de publicidad.</strong> Las cookies
          de autenticacion son estrictamente necesarias y no requieren consentimiento previo
          segun la LSSI-CE.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          6. Plazos de conservacion
        </h2>
        <p className="text-gray-600 mb-4">
          Conservamos tus datos durante los siguientes periodos:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-navy">Tipo de datos</th>
                <th className="px-4 py-3 text-left font-semibold text-navy">Plazo de conservacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3">Datos de cuenta</td>
                <td className="px-4 py-3">Mientras la cuenta este activa + 30 dias tras eliminacion</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Historial de conversiones</td>
                <td className="px-4 py-3">Mientras la cuenta este activa</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Datos de facturacion</td>
                <td className="px-4 py-3">5 anos (obligacion fiscal)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Logs de seguridad</td>
                <td className="px-4 py-3">90 dias</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          7. Tus derechos
        </h2>
        <p className="text-gray-600 mb-4">
          De acuerdo con el RGPD, tienes los siguientes derechos sobre tus datos personales:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>Acceso:</strong> Obtener confirmacion de si tratamos tus datos y acceder a ellos.
          </li>
          <li>
            <strong>Rectificacion:</strong> Corregir datos inexactos o completar datos incompletos.
          </li>
          <li>
            <strong>Supresion:</strong> Solicitar la eliminacion de tus datos (&quot;derecho al olvido&quot;).
          </li>
          <li>
            <strong>Limitacion:</strong> Solicitar la limitacion del tratamiento en ciertos casos.
          </li>
          <li>
            <strong>Portabilidad:</strong> Recibir tus datos en formato estructurado y de uso comun.
          </li>
          <li>
            <strong>Oposicion:</strong> Oponerte al tratamiento basado en interes legitimo.
          </li>
          <li>
            <strong>Retirada del consentimiento:</strong> Retirar el consentimiento en cualquier momento
            sin que afecte a la licitud del tratamiento previo.
          </li>
        </ul>
        <p className="text-gray-600 mt-4">
          <strong>Como ejercer tus derechos:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-2">
          <li>Desde la seccion &quot;Configuracion&quot; de tu cuenta</li>
          <li>Enviando un email a legal@distribuia.com</li>
        </ul>
        <p className="text-gray-600 mt-4">
          Responderemos a tu solicitud en un plazo maximo de 30 dias.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          8. Reclamaciones
        </h2>
        <p className="text-gray-600 mb-4">
          Si consideras que el tratamiento de tus datos vulnera la normativa, tienes derecho a
          presentar una reclamacion ante la autoridad de control competente:
        </p>
        <p className="text-gray-600">
          <strong>Agencia Espanola de Proteccion de Datos (AEPD)</strong><br />
          C/ Jorge Juan, 6<br />
          28001 Madrid<br />
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark"
          >
            www.aepd.es
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          9. Seguridad de los datos
        </h2>
        <p className="text-gray-600 mb-4">
          Implementamos medidas tecnicas y organizativas apropiadas para proteger tus datos:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Encriptacion en transito (HTTPS/TLS)</li>
          <li>Encriptacion en reposo de datos sensibles</li>
          <li>Autenticacion segura con PKCE</li>
          <li>Control de acceso basado en roles (RLS)</li>
          <li>Proteccion contra CSRF y ataques de inyeccion</li>
          <li>Rate limiting para prevencion de abusos</li>
          <li>Logs de seguridad y auditorias periodicas</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          10. Cambios en esta politica
        </h2>
        <p className="text-gray-600">
          Podemos actualizar esta politica de privacidad ocasionalmente. Te notificaremos
          cualquier cambio significativo por correo electronico o mediante un aviso en la
          aplicacion al menos 15 dias antes de que entren en vigor. El uso continuado del
          servicio tras los cambios implica la aceptacion de la nueva politica.
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          11. Contacto
        </h2>
        <p className="text-gray-600 mb-4">
          Si tienes preguntas sobre esta politica de privacidad o sobre el tratamiento
          de tus datos personales, puedes contactarnos:
        </p>
        <p className="text-gray-600">
          <strong>Email:</strong> legal@distribuia.com
        </p>
        <p className="text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg border">
          Al utilizar Distribuia, confirmas que has leido y entendido esta Politica de
          Privacidad y nuestros{" "}
          <a href="/terminos" className="text-primary hover:text-primary-dark">
            Terminos de Servicio
          </a>.
        </p>
      </section>
    </div>
  );
}
