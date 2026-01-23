import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="font-heading text-2xl font-bold text-navy mb-2">
          Enlace expirado o invalido
        </h1>
        <p className="text-gray-500 mb-6">
          El enlace que has usado ha expirado o no es valido.
          Los enlaces de verificacion expiran despues de 24 horas por seguridad.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full btn-primary py-3 text-center"
          >
            Volver a iniciar sesion
          </Link>
          <p className="text-sm text-gray-500">
            Si necesitas restablecer tu contrasena, puedes{" "}
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
              solicitar un nuevo enlace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
