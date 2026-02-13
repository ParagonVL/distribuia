export const welcomeEmailSubject = "¡Bienvenido a Distribuia!";

export function getWelcomeEmailHtml(userName?: string): string {
  const greeting = userName ? `Hola ${userName}!` : "Hola!";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: Nunito, sans-serif; color: #1E3A5F; font-size: 24px; font-weight: 700; margin: 0;">distribuia</h1>
    </div>

    <h2 style="font-family: Nunito, sans-serif; color: #1E3A5F; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
      ${greeting} Bienvenido a Distribuia
    </h2>

    <p style="color: #334155; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Ya puedes empezar a convertir tus videos de YouTube en posts de LinkedIn y X que realmente enganchan.
    </p>

    <p style="color: #334155; font-size: 16px; line-height: 24px; margin: 0 0 8px 0; font-weight: 600;">
      Cómo empezar:
    </p>

    <ol style="color: #334155; font-size: 16px; line-height: 28px; margin: 0 0 24px 0; padding-left: 20px;">
      <li>Pega un enlace de YouTube o artículo</li>
      <li>Elige el tono (profesional, cercano o técnico)</li>
      <li>Copia el resultado y publica</li>
    </ol>

    <div style="background-color: #F0FDFA; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #0F766E; font-size: 14px; line-height: 20px; margin: 0;">
        <strong>Tu plan gratuito incluye:</strong><br>
        2 conversiones al mes · 3 formatos (X, LinkedIn post, artículo) · Regeneración incluida
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://distribuia.es/dashboard" style="display: inline-block; background-color: #2DD4BF; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
        Crear mi primera conversion
      </a>
    </div>

    <p style="color: #64748B; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
      ¿Tienes alguna duda? Responde a este correo y te ayudamos.
    </p>

    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;">

    <p style="color: #94A3B8; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
      © 2026 Distribuia · Convierte videos en posts de LinkedIn<br>
      <a href="https://distribuia.es/privacidad" style="color: #94A3B8;">Privacidad</a> ·
      <a href="https://distribuia.es/terminos" style="color: #94A3B8;">Términos</a>
    </p>

  </div>
</body>
</html>
  `.trim();
}
