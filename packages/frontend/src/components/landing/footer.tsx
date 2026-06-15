import Link from 'next/link'
import { Twitter, Github, Linkedin } from 'lucide-react'
import { siteConfig } from '@/config/site'

export function LandingFooter() {
  const { footer } = siteConfig

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <p className="text-lg font-bold">{siteConfig.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{siteConfig.tagline}</p>
            <div className="mt-4 flex gap-3">
              {footer.social.twitter && (
                <a
                  href={footer.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Twitter className="size-4" />
                </a>
              )}
              {footer.social.github && (
                <a
                  href={footer.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github className="size-4" />
                </a>
              )}
              {footer.social.linkedin && (
                <a
                  href={footer.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Link columns */}
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          {footer.copyright}
        </div>
      </div>
    </footer>
  )
}
