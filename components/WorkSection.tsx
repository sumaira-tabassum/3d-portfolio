/**
 * TODO: replace these with real client work before launch. Names, descriptions,
 * and stacks are placeholders written to the right shape and length.
 */
const PROJECTS = [
  {
    name: 'Meridian',
    kind: 'Logistics Platform',
    description:
      'Replaced a spreadsheet-driven dispatch process with a real-time routing platform. Cut average dispatch time from 40 minutes to under 3.',
    stack: ['Next.js', 'PostgreSQL', 'Redis', 'Mapbox'],
  },
  {
    name: 'Ledgerline',
    kind: 'Fintech Infrastructure',
    description:
      'Double-entry ledger and reconciliation engine handling settlement across four payment providers, with a full audit trail on every movement.',
    stack: ['TypeScript', 'Postgres', 'Temporal', 'AWS'],
  },
  {
    name: 'Fieldnote',
    kind: 'Offline-First Mobile',
    description:
      'Inspection tooling for crews working without signal. Conflict-free sync, local-first storage, and reports that generate before they reach the truck.',
    stack: ['React Native', 'SQLite', 'CRDT', 'Go'],
  },
]

/**
 * Floating project cards (CLAUDE.md — Work Section).
 * Server component — hover states are pure CSS.
 */
export default function WorkSection() {
  return (
    <section id="work" className="work">
      <div className="work-head">
        <p className="label type-caption">Selected Work</p>
        <h2 className="type-h2 work-title">Things we&apos;ve shipped.</h2>
      </div>

      <div className="cards">
        {PROJECTS.map((project) => (
          <article key={project.name} className="card">
            <p className="card-kind type-caption">{project.kind}</p>
            <h3 className="card-name">{project.name}</h3>
            <p className="card-desc">{project.description}</p>
            <ul className="tags">
              {project.stack.map((tech) => (
                <li key={tech} className="tag">
                  {tech}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
