export const subscriptionConfirmedEmailSubject = "Tu plan en Distribuia está activo";

export function getSubscriptionConfirmedEmailHtml(
  planName: string,
  conversionsLimit: number
): string {
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
      Tu plan ${planName} está activo
    </h2>

    <p style="color: #334155; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Gracias por confiar en Distribuia. Tu suscripción al plan <strong>${planName}</strong> ya está activa y lista para usar.
    </p>

    <div style="background-color: #F0FDFA; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #0F766E; font-size: 14px; line-height: 20px; margin: 0;">
        <strong>Lo que incluye tu plan:</strong><br>
        ${conversionsLimit} conversiones al mes · 3 formatos (X, LinkedIn post, artículo) · Sin marca de agua · Regeneración incluida
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://distribuia.com/dashboard" style="display: inline-block; background-color: #2DD4BF; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
        Ir al dashboard
      </a>
    </div>

    <p style="color: #64748B; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
      Puedes gestionar tu suscripción en cualquier momento desde <a href="https://distribuia.com/settings" style="color: #2DD4BF; text-decoration: none;">Configuración</a>.
    </p>

    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;">

    <p style="color: #94A3B8; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
      © 2026 Distribuia · Convierte videos en posts de LinkedIn<br>
      <a href="https://distribuia.com/privacidad" style="color: #94A3B8;">Privacidad</a> ·
      <a href="https://distribuia.com/terminos" style="color: #94A3B8;">Términos</a>
    </p>

  </div>
</body>
</html>
  `.trim();
}
