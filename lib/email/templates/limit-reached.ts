export const limitReachedEmailSubject = "Has agotado tus conversiones en Distribuia";

export function getLimitReachedEmailHtml(
  limit: number,
  plan: "free" | "starter" | "pro",
  nextResetDate: string
): string {
  const showUpgrade = plan !== "pro";

  const upgradeSection = showUpgrade
    ? `
    <div style="background-color: #F0FDFA; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; text-align: center;">
      <p style="color: #0F766E; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
        <strong>¿Necesitas más conversiones ahora?</strong><br>
        ${
          plan === "free"
            ? "Con Starter por solo 19€/mes tienes 10 conversiones al mes."
            : "Con Pro por 49€/mes tienes 30 conversiones al mes."
        }
      </p>
      <a href="https://distribuia.es/settings" style="display: inline-block; background-color: #2DD4BF; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
        Cambiar de plan
      </a>
    </div>
  `
    : "";

  const planNames: Record<string, string> = {
    free: "Gratuito",
    starter: "Starter",
    pro: "Pro",
  };

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

    <h2 style="font-family: Nunito, sans-serif; color: #1E3A5F; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
      Has usado todas tus conversiones
    </h2>

    <p style="color: #334155; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Has alcanzado el límite de <strong>${limit} conversiones</strong> de tu plan ${planNames[plan]} este mes.
    </p>

    <div style="background-color: #FEF2F2; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #991B1B; font-size: 14px; line-height: 20px; margin: 0; text-align: center;">
        Tus conversiones se renovarán el <strong>${nextResetDate}</strong>
      </p>
    </div>

    ${upgradeSection}

    <p style="color: #64748B; font-size: 14px; line-height: 20px; margin: 0 0 16px 0;">
      Si tienes dudas sobre tu plan, responde a este correo.
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
