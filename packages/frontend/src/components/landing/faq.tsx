import { siteConfig } from '@/config/site'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function LandingFaq() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Si no encontrás lo que buscás, escribinos a{' '}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {siteConfig.supportEmail}
            </a>
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {siteConfig.faq.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
