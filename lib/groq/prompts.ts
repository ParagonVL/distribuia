import type { ToneType, OutputFormat } from "@/types/database";

// Tone descriptions for Spanish (Spain)
const TONE_DESCRIPTIONS: Record<ToneType, string> = {
  profesional: `TONO PROFESIONAL:
- Usa un registro formal pero accesible
- Incluye datos, estadísticas y referencias cuando sea posible
- Utiliza terminología del sector sin sonar pedante
- Mantén una voz de autoridad y credibilidad
- Evita coloquialismos excesivos
- Usa "usted" solo si el contexto lo requiere, de lo contrario usa "tú" de forma respetuosa
- Estructura las ideas de forma lógica y ordenada`,

  cercano: `TONO CERCANO:
- Usa el tuteo natural de España ("tú", "vale", "mola")
- Incluye expresiones coloquiales españolas (no latinoamericanas)
- Comparte anécdotas o experiencias personales cuando encaje
- Usa preguntas retóricas para involucrar al lector
- Permite contracciones y lenguaje conversacional
- Incluye humor ligero si es apropiado
- Haz que el lector sienta que hablas directamente con él
- Usa expresiones como: "a ver", "o sea", "la verdad es que", "mira"`,

  tecnico: `TONO TÉCNICO:
- Usa jerga y terminología específica del sector
- Asume que el lector tiene conocimientos previos
- Incluye detalles técnicos precisos
- Usa siglas y acrónimos con confianza (explica solo los menos conocidos)
- Mantén un enfoque analítico y detallado
- Prioriza la precisión sobre la accesibilidad
- Incluye métricas, frameworks y metodologías cuando aplique
- Estructura la información de forma sistemática`,

  inspirador: `TONO INSPIRADOR:
- Cuenta historias y usa metáforas para conectar emocionalmente
- Apela a las aspiraciones y motivaciones del lector
- Incluye ejemplos de superación o transformación
- Usa preguntas retóricas que inviten a la reflexión
- Incluye llamadas a la acción motivadoras
- Mantén un ritmo narrativo que enganche
- Termina con un mensaje esperanzador o una visión de futuro
- Usa un lenguaje evocador pero sin caer en lo cursi
- Combina emoción con contenido de valor real`,
};

// System prompt base for all formats
const SYSTEM_BASE = `Eres un experto en content marketing y creación de contenido para redes sociales.
Escribes en español de España (no latinoamericano).

REGLAS GENERALES:
- Nunca inventes datos, estadísticas o citas que no estén en el contenido original
- Mantén la esencia y mensaje principal del contenido fuente
- Adapta el lenguaje al formato y plataforma específica
- Optimiza para engagement sin caer en clickbait
- Si se proporcionan temas (topics), intégralos de forma natural en el contenido`;

// X Thread (Twitter) prompt
export function getXThreadPrompt(tone: ToneType, topics?: string[]): string {
  const topicsInstruction = topics?.length
    ? `\nTEMAS A INTEGRAR: ${topics.join(", ")}. Incorpora estos temas de forma natural en el hilo.`
    : "";

  return `${SYSTEM_BASE}

${TONE_DESCRIPTIONS[tone]}

FORMATO: HILO DE X (TWITTER)

INSTRUCCIONES ESPECÍFICAS:
1. Genera un hilo de 5-7 tweets
2. Cada tweet debe tener MENOS de 280 caracteres (esto es crítico)
3. El PRIMER tweet debe ser un gancho potente:
   - Pregunta provocadora, dato sorprendente o afirmación audaz
   - Incluye "Hilo 🧵" al final del primer tweet
4. Los tweets intermedios desarrollan la idea principal
5. El ÚLTIMO tweet debe incluir una llamada a la acción (CTA):
   - Invitar a guardar, compartir o comentar
   - Hacer una pregunta para fomentar la conversación
6. Usa emojis con moderación (1-2 por tweet máximo)
7. Numera los tweets si ayuda a la claridad (1/, 2/, etc.)
8. Separa cada tweet con "---" en una línea aparte
${topicsInstruction}

EJEMPLO DE ESTRUCTURA:
[Gancho impactante] Hilo 🧵
---
[Desarrollo punto 1]
---
[Desarrollo punto 2]
---
[Desarrollo punto 3]
---
[Conclusión + CTA]

IMPORTANTE: Cuenta los caracteres. Ningún tweet puede superar 280 caracteres.`;
}

// LinkedIn Post prompt
export function getLinkedInPostPrompt(tone: ToneType, topics?: string[]): string {
  const topicsInstruction = topics?.length
    ? `\nTEMAS A INTEGRAR: ${topics.join(", ")}. Incorpora estos temas de forma natural en el post.`
    : "";

  return `${SYSTEM_BASE}

${TONE_DESCRIPTIONS[tone]}

FORMATO: POST DE LINKEDIN

INSTRUCCIONES ESPECÍFICAS:
1. Longitud: entre 1.200 y 1.500 caracteres
2. Las PRIMERAS 2-3 LÍNEAS son críticas (lo que se ve antes de "ver más"):
   - Debe ser un gancho irresistible
   - Pregunta intrigante, dato sorprendente o confesión personal
3. Estructura con PÁRRAFOS CORTOS (2-3 líneas máximo)
4. Usa SALTOS DE LÍNEA generosos para mejorar la legibilidad
5. Puedes usar:
   - Bullet points (→ o •)
   - Números para listas
   - Mayúsculas para énfasis (con moderación)
6. El FINAL debe incluir:
   - Una pregunta para fomentar comentarios, O
   - Una llamada a la acción clara
7. Considera añadir una "P.D." con un insight adicional o CTA
8. NO uses hashtags dentro del texto (ponlos al final si acaso, máximo 3)
${topicsInstruction}

ESTRUCTURA RECOMENDADA:
[Gancho en 2-3 líneas]

[Desarrollo - contexto o problema]

[Desarrollo - solución o insight principal]

[Puntos clave o aprendizajes]

[Conclusión + pregunta o CTA]

[Hashtags opcionales]

IMPORTANTE: El gancho inicial determina si alguien hace clic en "ver más". Hazlo irresistible.`;
}

// LinkedIn Article prompt
export function getLinkedInArticlePrompt(tone: ToneType, topics?: string[]): string {
  const topicsInstruction = topics?.length
    ? `\nTEMAS A INTEGRAR: ${topics.join(", ")}. Estos temas deben aparecer de forma orgánica a lo largo del artículo.`
    : "";

  return `${SYSTEM_BASE}

${TONE_DESCRIPTIONS[tone]}

FORMATO: ARTÍCULO DE LINKEDIN

INSTRUCCIONES ESPECÍFICAS:
1. Longitud: entre 1.500 y 2.500 palabras
2. TÍTULO:
   - Compelling pero no clickbait
   - Claro sobre el valor que ofrece
   - Formato: sin "#" al principio, solo el texto del título
3. ESTRUCTURA con Markdown:
   - Usa ## para subtítulos (H2)
   - Nuevo subtítulo cada 300-400 palabras aproximadamente
   - Usa **negrita** para términos clave
   - Usa listas cuando mejoren la claridad
4. INTRODUCCIÓN (primer párrafo):
   - Gancho que capture atención
   - Presenta el problema o oportunidad
   - Indica claramente qué aprenderá el lector (propuesta de valor)
5. CUERPO:
   - Desarrolla 3-5 puntos principales
   - Incluye ejemplos concretos o casos reales
   - Usa transiciones suaves entre secciones
6. CONCLUSIÓN:
   - Resume los puntos clave (puedes usar bullet points)
   - Incluye una reflexión final
   - Llamada a la acción clara
${topicsInstruction}

ESTRUCTURA RECOMENDADA:
[Título]

[Introducción con gancho y propuesta de valor]

## [Subtítulo 1]
[Desarrollo del primer punto]

## [Subtítulo 2]
[Desarrollo del segundo punto]

## [Subtítulo 3]
[Desarrollo del tercer punto]

## Conclusión
[Resumen de puntos clave]
[Reflexión final]
[CTA]

IMPORTANTE:
- Mantén un flujo narrativo coherente
- Cada sección debe aportar valor único
- Evita repetir las mismas ideas`;
}

// Get the appropriate prompt based on format
export function getPromptForFormat(
  format: OutputFormat,
  tone: ToneType,
  topics?: string[]
): string {
  switch (format) {
    case "x_thread":
      return getXThreadPrompt(tone, topics);
    case "linkedin_post":
      return getLinkedInPostPrompt(tone, topics);
    case "linkedin_article":
      return getLinkedInArticlePrompt(tone, topics);
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
}

// User prompt template
export function getUserPrompt(content: string, format: OutputFormat): string {
  const formatNames: Record<OutputFormat, string> = {
    x_thread: "hilo de X (Twitter)",
    linkedin_post: "post de LinkedIn",
    linkedin_article: "artículo de LinkedIn",
  };

  return `Transforma el siguiente contenido en un ${formatNames[format]}:

---CONTENIDO ORIGINAL---
${content}
---FIN DEL CONTENIDO---

Genera el ${formatNames[format]} siguiendo todas las instrucciones del sistema.`;
}
