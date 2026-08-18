const SERVICES = [
  {
    label: '01',
    title: 'Development',
    body: 'Web platforms, APIs, and internal tools built from scratch. Typed end to end, tested where it counts, and handed over with the keys — no black boxes.',
    icon: (
      // Angle brackets — code.
      <>
        <path d="M9 6 3 12l6 6" />
        <path d="m15 6 6 6-6 6" />
      </>
    ),
  },
  {
    label: '02',
    title: 'Consulting',
    body: 'Architecture reviews, technical due diligence, and a straight answer about what to build, what to buy, and what to delete. We say no when no is right.',
    icon: (
      // Nodes and connections — systems thinking.
      <>
        <circle cx="6" cy="6" r="2.4" />
        <circle cx="18" cy="18" r="2.4" />
        <circle cx="18" cy="6" r="2.4" />
        <path d="M8.4 6H15.6" />
        <path d="M18 8.4v7.2" />
        <path d="M8 8 16 16" />
      </>
    ),
  },
  {
    label: '03',
    title: 'Design',
    body: 'Interface and interaction design that survives contact with real users. Design systems, not one-off screens — every state accounted for before a line ships.',
    icon: (
      // Frame and node — layout.
      <>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 9h18" />
        <path d="M9 9v12" />
      </>
    ),
  },
]

/**
 * Three-column services band (CLAUDE.md — Services Section).
 * Server component — fully static.
 */
export default function ServicesSection() {
  return (
    <section id="services" className="services">
      <div className="inner">
        {SERVICES.map((service) => (
          <article key={service.title} className="col">
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {service.icon}
            </svg>

            <p className="label type-caption">{service.label}</p>
            <h3 className="title">{service.title}</h3>
            <p className="body">{service.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
