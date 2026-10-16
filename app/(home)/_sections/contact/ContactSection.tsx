import { LinkButton } from '@/_components/LinkButton'
import { SectionHeading } from '@/_components/SectionHeading'

export function ContactSection() {
  return (
    <section
      id="contacto"
      tabIndex={-1}
      className="relative z-10 scroll-mt-20 px-4 text-foreground outline-none sm:px-5"
      aria-labelledby="contacto-title"
    >
      <div className="mx-auto w-full max-w-360">
        <SectionHeading titleId="contacto-title" eyebrow="05 / CONTACTO" title="Contáctanos" />

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="space-y-8 justify-self-center text-center md:justify-self-end md:text-end">
            <div className="space-y-2">
              <h3 className="leading-4 font-light tracking-wider text-primary uppercase">DIRECCIÓN</h3>
              <p className="tracking-wider text-foreground">Benavente 980 - La Serena - Chile</p>
            </div>

            <div className="space-y-2">
              <h3 className="leading-4 font-light tracking-wider text-primary uppercase">CORREO</h3>
              <LinkButton className="tracking-wider" variant="text" href="mailto:iluminaconciencia@userena.cl">
                iluminaconciencia@userena.cl
              </LinkButton>
            </div>
          </div>

          <div className="max-w-prose space-y-6 text-center font-light text-foreground sm:text-start">
            <p>
              Si tienes interés en formar parte de nuestra red de monitoreo, te invitamos a ponerte en contacto con
              nosotros. En Iluminaconciencia, estamos listos para ofrecerte todo el apoyo necesario en el proceso de
              instalación del nodo de captura de datos. Nuestro equipo estará a tu disposición para brindarte asistencia
              técnica y gestionar todas las etapas requeridas para que puedas unirte a nuestro proyecto de monitoreo.
            </p>
            <p>
              No dudes en comunicarte con nosotros para obtener más detalles y comenzar esta colaboración en pro de la
              salud, la biodiversidad, la ciencia y la investigación.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
