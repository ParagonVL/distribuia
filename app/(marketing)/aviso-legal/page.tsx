import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal - Distribuia",
  description: "Aviso legal e identificacion del titular de Distribuia.",
};

export default function AvisoLegalPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="font-heading text-3xl font-bold text-navy mb-2">
        Aviso Legal
      </h1>
      <p className="text-gray-600 mb-8">
        Ultima actualizacion: Febrero 2026
      </p>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          1. Datos identificativos del titular
        </h2>
        <p className="text-gray-600 mb-4">
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa al usuario
          de los datos del titular de este sitio web:
        </p>
        <ul className="list-none pl-0 space-y-2 text-gray-600">
          <li><strong>Denominación social:</strong> Paragonum S.L.U.</li>
          <li><strong>CIF:</strong> B26660944</li>
          <li><strong>Domicilio social:</strong> Carrer de Sant Vicent Màrtir 85, 8º dcha, 46007 Valencia, España</li>
          <li><strong>Correo electrónico:</strong>{" "}
            <a href="mailto:legal@distribuia.com" className="text-primary hover:text-primary-dark">
              legal@distribuia.com
            </a>
          </li>
          <li><strong>Nombre comercial:</strong> Distribuia</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          2. Objeto
        </h2>
        <p className="text-gray-600">
          El presente aviso legal regula el uso y acceso al sitio web distribuia.com
          (en adelante, &quot;el Sitio Web&quot;), que Paragonum S.L.U. pone a disposición de los
          usuarios de Internet. El acceso al Sitio Web atribuye la condición de usuario e implica
          la aceptación plena de todas las disposiciones incluidas en este aviso legal.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          3. Propiedad intelectual e industrial
        </h2>
        <p className="text-gray-600 mb-4">
          Todos los contenidos del Sitio Web, incluyendo a título enunciativo pero no limitativo,
          textos, fotografías, gráficos, imágenes, iconos, tecnología, software, enlaces y demás
          contenidos audiovisuales o sonoros, así como su diseño gráfico y código fuente, son propiedad
          intelectual de Paragonum S.L.U. o de terceros que han autorizado su uso, sin que puedan
          entenderse cedidos al usuario ninguno de los derechos de explotación sobre los mismos más
          allá de lo estrictamente necesario para el uso correcto del Sitio Web.
        </p>
        <p className="text-gray-600">
          Las marcas, nombres comerciales o signos distintivos son propiedad de Paragonum S.L.U.
          o de terceros, sin que el acceso al Sitio Web atribuya al usuario derecho alguno sobre ellos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          4. Condiciones de uso
        </h2>
        <p className="text-gray-600 mb-4">
          El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que
          Paragonum S.L.U. ofrece a través de su Sitio Web y a no emplearlos para:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Realizar actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
          <li>Difundir contenidos o propaganda de carácter racista, xenófobo, discriminatorio o que atenten contra los derechos humanos.</li>
          <li>Provocar daños en los sistemas físicos y lógicos de Paragonum S.L.U., de sus proveedores o de terceros.</li>
          <li>Introducir o difundir virus informáticos o cualesquiera otros sistemas que sean susceptibles de provocar los daños anteriormente mencionados.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          5. Exclusión de responsabilidad
        </h2>
        <p className="text-gray-600 mb-4">
          Paragonum S.L.U. no se hace responsable, en ningún caso, de los daños y perjuicios de
          cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en
          los contenidos, falta de disponibilidad del Sitio Web, o la transmisión de virus o
          programas maliciosos en los contenidos, a pesar de haber adoptado todas las medidas
          tecnológicas necesarias para evitarlo.
        </p>
        <p className="text-gray-600">
          El contenido generado por inteligencia artificial a través de Distribuia constituye
          sugerencias automatizadas que el usuario debe revisar y verificar antes de publicar.
          Paragonum S.L.U. no garantiza la exactitud, originalidad ni idoneidad del contenido generado.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          6. Enlaces externos
        </h2>
        <p className="text-gray-600">
          El Sitio Web puede contener enlaces a sitios web de terceros. Paragonum S.L.U. no asume
          ninguna responsabilidad por el contenido, la política de privacidad o las prácticas de
          sitios web de terceros. El usuario accede a dichos sitios bajo su exclusiva responsabilidad.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          7. Protección de datos
        </h2>
        <p className="text-gray-600">
          Paragonum S.L.U. cumple con la normativa vigente en materia de protección de datos personales,
          el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección
          de Datos Personales y garantía de los derechos digitales (LOPDGDD). Para más información,
          consulta nuestra{" "}
          <a href="/privacidad" className="text-primary hover:text-primary-dark">
            Política de Privacidad
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-navy mb-4">
          8. Legislación aplicable y jurisdicción
        </h2>
        <p className="text-gray-600 mb-4">
          El presente aviso legal se rige en todos y cada uno de sus extremos por la legislación
          española. Para la resolución de cualquier controversia que pudiera derivarse del acceso
          al Sitio Web, Paragonum S.L.U. y el usuario se someten expresamente a los juzgados y
          tribunales de la ciudad de Valencia, renunciando a cualquier otro fuero que pudiera
          corresponderles.
        </p>
        <p className="text-gray-600">
          Como consumidor en la Unión Europea, también puedes acudir a la plataforma de resolución
          de litigios en línea de la Comisión Europea:{" "}
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
          9. Contacto
        </h2>
        <p className="text-gray-600">
          Para cualquier consulta relacionada con este aviso legal, puedes contactarnos en:{" "}
          <a href="mailto:legal@distribuia.com" className="text-primary hover:text-primary-dark">
            legal@distribuia.com
          </a>
        </p>
      </section>
    </div>
  );
}
