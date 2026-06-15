import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function PrivacyPage() {
  const { legal } = siteConfig

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: {legal.lastUpdated}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold">1. Información que recopilamos</h2>
            <p className="mt-3 text-muted-foreground">
              Recopilamos información que nos proporcionás directamente (nombre, email, contraseña)
              al crear una cuenta, así como datos de uso generados al interactuar con la Plataforma
              (logs de acceso, funcionalidades utilizadas, configuraciones).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Cómo usamos tu información</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Proveer, mantener y mejorar el servicio.</li>
              <li>Enviarte comunicaciones transaccionales (confirmaciones, alertas de seguridad).</li>
              <li>Responder consultas y brindar soporte técnico.</li>
              <li>Cumplir obligaciones legales aplicables.</li>
              <li>Prevenir fraude y garantizar la seguridad de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Compartir información</h2>
            <p className="mt-3 text-muted-foreground">
              No vendemos ni compartimos tu información personal con terceros, salvo que sea
              necesario para operar el servicio (proveedores de infraestructura, procesadores de
              pago) o cuando lo exija la ley. Todos los subprocesadores están obligados
              contractualmente a proteger tus datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Seguridad de los datos</h2>
            <p className="mt-3 text-muted-foreground">
              Implementamos medidas técnicas y organizativas razonables para proteger tu información,
              incluyendo encriptación en tránsito (TLS) y en reposo. Sin embargo, ningún sistema
              es 100% seguro; te recomendamos usar contraseñas únicas y fuertes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Retención de datos</h2>
            <p className="mt-3 text-muted-foreground">
              Conservamos tu información mientras tu cuenta esté activa o según sea necesario para
              los fines descritos. Si eliminás tu cuenta, procederemos a borrar tus datos dentro
              de los 30 días hábiles posteriores, salvo que la ley exija conservarlos por más tiempo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Tus derechos</h2>
            <p className="mt-3 text-muted-foreground">
              Tenés derecho a acceder, rectificar, eliminar o portar tus datos personales. También
              podés oponerte o solicitar la limitación del tratamiento. Para ejercer estos derechos,
              contactanos en{' '}
              <a
                href={`mailto:${legal.email}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {legal.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Cookies</h2>
            <p className="mt-3 text-muted-foreground">
              Utilizamos cookies estrictamente necesarias para el funcionamiento de la sesión.
              No utilizamos cookies de tracking de terceros ni publicidad comportamental.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Cambios en esta política</h2>
            <p className="mt-3 text-muted-foreground">
              Podemos actualizar esta Política periódicamente. Te notificaremos por email ante
              cambios significativos. La fecha de última actualización siempre estará visible
              al inicio de este documento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Contacto</h2>
            <p className="mt-3 text-muted-foreground">
              Para cualquier consulta sobre privacidad escribinos a{' '}
              <a
                href={`mailto:${legal.email}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {legal.email}
              </a>
              . También podés consultar nuestros{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                Términos y Condiciones
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
