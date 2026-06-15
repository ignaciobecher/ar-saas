import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: {legal.lastUpdated}
        </p>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold">1. Aceptación de los términos</h2>
            <p className="mt-3 text-muted-foreground">
              Al acceder y utilizar los servicios de {legal.companyName} (&quot;la Plataforma&quot;),
              aceptás quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo,
              no utilices la Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Descripción del servicio</h2>
            <p className="mt-3 text-muted-foreground">
              {legal.companyName} provee una plataforma de software como servicio (SaaS) accesible
              a través de la web. Nos reservamos el derecho de modificar, suspender o discontinuar
              cualquier aspecto del servicio en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Registro y cuenta</h2>
            <p className="mt-3 text-muted-foreground">
              Para acceder a ciertas funcionalidades debés crear una cuenta. Sos responsable de
              mantener la confidencialidad de tus credenciales y de todas las actividades que
              ocurran bajo tu cuenta. Notificanos inmediatamente ante cualquier uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Facturación y pagos</h2>
            <p className="mt-3 text-muted-foreground">
              Los planes de pago se facturan de forma recurrente (mensual o anual) según el plan
              elegido. Los precios están sujetos a cambios con previo aviso de 30 días. Las
              cancelaciones surten efecto al final del período facturado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Propiedad intelectual</h2>
            <p className="mt-3 text-muted-foreground">
              Todo el contenido de la Plataforma (código, diseño, logos, textos) es propiedad
              exclusiva de {legal.companyName} o sus licenciantes. No podés copiar, modificar ni
              distribuir ningún elemento sin autorización expresa y escrita.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Datos del usuario</h2>
            <p className="mt-3 text-muted-foreground">
              Sos propietario de los datos que cargás en la Plataforma. Nos otorgás una licencia
              limitada para procesarlos únicamente con el fin de prestar el servicio. Consultá
              nuestra{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                Política de Privacidad
              </Link>{' '}
              para más detalles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Limitación de responsabilidad</h2>
            <p className="mt-3 text-muted-foreground">
              En la máxima medida permitida por la ley, {legal.companyName} no será responsable
              por daños indirectos, incidentales, especiales o consecuentes derivados del uso o
              imposibilidad de uso de la Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Modificaciones</h2>
            <p className="mt-3 text-muted-foreground">
              Podemos actualizar estos Términos periódicamente. Te notificaremos por email ante
              cambios materiales. El uso continuado de la Plataforma constituye aceptación de los
              nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Contacto</h2>
            <p className="mt-3 text-muted-foreground">
              Para consultas sobre estos Términos escribinos a{' '}
              <a
                href={`mailto:${legal.email}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {legal.email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
