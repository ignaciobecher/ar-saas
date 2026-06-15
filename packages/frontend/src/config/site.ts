// ─────────────────────────────────────────────────────────────────────────────
// Archivo de configuración central del SaaS.
// Editá este archivo para personalizar textos, links y contenido de toda la app.
// Los valores con __PLACEHOLDER__ son reemplazados automáticamente por el CLI.
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  // ── Identidad ──────────────────────────────────────────────────────────────
  name: '__SITE_NAME__',
  tagline: '__SITE_TAGLINE__',
  description: '__SITE_DESCRIPTION__',
  url: 'https://tu-dominio.com',
  supportEmail: '__SUPPORT_EMAIL__',

  // ── Navegación pública (landing) ───────────────────────────────────────────
  nav: {
    links: [
      { label: 'Funcionalidades', href: '#features' },
      { label: 'Precios', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  hero: {
    headline: '__SITE_NAME__',
    subheadline: '__SITE_TAGLINE__',
    description: '__SITE_DESCRIPTION__',
    cta: { label: 'Empezar gratis', href: '/register' },
    ctaSecondary: { label: 'Ver funcionalidades', href: '#features' },
  },

  // ── Funcionalidades ────────────────────────────────────────────────────────
  features: [
    {
      icon: 'Zap',
      title: 'Rápido y confiable',
      description: 'Infraestructura diseñada para escalar con tu negocio sin fricciones.',
    },
    {
      icon: 'Shield',
      title: 'Seguridad primero',
      description: 'Autenticación robusta, tokens JWT y encriptación en toda la plataforma.',
    },
    {
      icon: 'BarChart3',
      title: 'Analytics en tiempo real',
      description: 'Tomá decisiones basadas en datos con métricas actualizadas al instante.',
    },
    {
      icon: 'Users',
      title: 'Trabajo en equipo',
      description: 'Invitá colaboradores y gestioná permisos de forma simple y segura.',
    },
    {
      icon: 'Globe',
      title: 'Multi-workspace',
      description: 'Administrá múltiples proyectos o clientes desde una sola cuenta.',
    },
    {
      icon: 'Headphones',
      title: 'Soporte dedicado',
      description: 'Estamos disponibles para ayudarte a resolver cualquier duda.',
    },
  ],

  // ── Precios ────────────────────────────────────────────────────────────────
  pricing: [
    {
      name: 'Free',
      price: '$0',
      period: '/mes',
      description: 'Para empezar y explorar la plataforma.',
      features: [
        '1 workspace',
        'Hasta 3 usuarios',
        '5 GB de almacenamiento',
        'Soporte por email',
      ],
      cta: 'Empezar gratis',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mes',
      description: 'Para equipos que necesitan más poder.',
      features: [
        'Workspaces ilimitados',
        'Usuarios ilimitados',
        '50 GB de almacenamiento',
        'Analytics avanzados',
        'Soporte prioritario',
        'Integraciones premium',
      ],
      cta: 'Comenzar prueba gratis',
      href: '/register',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'A consultar',
      period: '',
      description: 'Soluciones a medida para grandes organizaciones.',
      features: [
        'Todo lo de Pro',
        'SLA garantizado',
        'Onboarding dedicado',
        'SSO y SAML',
        'Auditoría y compliance',
        'Contrato personalizado',
      ],
      cta: 'Hablar con ventas',
      href: 'mailto:__SUPPORT_EMAIL__',
      highlight: false,
    },
  ],

  // ── FAQ ────────────────────────────────────────────────────────────────────
  faq: [
    {
      question: '¿Puedo cambiar de plan en cualquier momento?',
      answer:
        'Sí, podés upgradear o downgradear tu plan cuando quieras. Los cambios se aplican al próximo ciclo de facturación.',
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer:
        'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex) y transferencias bancarias para planes Enterprise.',
    },
    {
      question: '¿Hay un período de prueba gratuito?',
      answer:
        'El plan Free está disponible sin límite de tiempo. Los planes pagos incluyen 14 días de prueba sin necesidad de tarjeta.',
    },
    {
      question: '¿Cómo es la seguridad de mis datos?',
      answer:
        'Todos los datos se almacenan encriptados en reposo y en tránsito. Cumplimos con los estándares de seguridad más exigentes.',
    },
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer:
        'Sí, sin penalidades ni cargos adicionales. Si cancelás, seguís teniendo acceso hasta el fin del período pagado.',
    },
    {
      question: '¿Tienen soporte en español?',
      answer: 'Sí, todo nuestro soporte es en español. Respondemos dentro de las 24 horas hábiles.',
    },
  ],

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    columns: [
      {
        title: 'Producto',
        links: [
          { label: 'Funcionalidades', href: '#features' },
          { label: 'Precios', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
          { label: 'Changelog', href: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Términos y condiciones', href: '/terms' },
          { label: 'Política de privacidad', href: '/privacy' },
        ],
      },
      {
        title: 'Soporte',
        links: [
          { label: 'Contacto', href: 'mailto:__SUPPORT_EMAIL__' },
          { label: 'Documentación', href: '#' },
          { label: 'Estado del servicio', href: '#' },
        ],
      },
    ],
    social: {
      twitter: '',
      github: '',
      linkedin: '',
    },
    copyright: `© ${new Date().getFullYear()} __SITE_NAME__. Todos los derechos reservados.`,
  },

  // ── Legal ──────────────────────────────────────────────────────────────────
  legal: {
    companyName: '__SITE_NAME__',
    email: '__SUPPORT_EMAIL__',
    lastUpdated: '1 de enero de 2024',
  },
}

export type SiteConfig = typeof siteConfig
