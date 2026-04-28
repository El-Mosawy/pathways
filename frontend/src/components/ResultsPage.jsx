// ResultsPage receives two props:
// - plan: the raw action plan string from the AI
// - language: the user's chosen language
// - onRestart: function to go back to the beginning
import DeadlineTimeline from './DeadlineTimeline' // This is the component that renders the visual timeline of deadlines, it parses the structured DEADLINE lines from the AI output and displays them in a nice format with colour coding based on urgency.

function ResultsPage({ plan, language, onRestart }) {

  // Each section has a name matching our markers,
  // a display title, and an emoji icon
  const sections = [
    {
      key: 'STATUS',
      title: 'Your Current Status',
      icon: '📋',
    },

    {
      key: 'ENTITLEMENTS',
      title: 'What You Are Entitled To',
      icon: '✅',
    },
    {
      key: 'ACTIONS',
      title: 'Your Action Plan',
      icon: '⚡',
    },
    {
      key: 'NEXT',
      title: 'Your Next Steps',
      icon: '🌱',
    },
  ]

  // this will allow the user to save the plan as a PDF
  function handleDownload() {
    setTimeout(() => {
      window.print()
    }, 100)
  }

  // Extracts content between [SECTION:NAME] and [/SECTION] markers
  // This is how we turn the raw AI string into structured data
  function parseSection(sectionKey) {
    if (!plan) return ''
    const start = `[SECTION:${sectionKey}]`
    const end = `[/SECTION]`
    const startIndex = plan.indexOf(start)
    if (startIndex === -1) return ''
    const contentStart = startIndex + start.length
    const contentEnd = plan.indexOf(end, contentStart)
    if (contentEnd === -1) return ''
    return plan.slice(contentStart, contentEnd).trim()
  }

  function renderWithLinks(text) {
    const urlRegex = /((?:https?:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+(?:uk|org|com|net)(?:\/[^\s,)]*)?)/g
    const parts = text.split(urlRegex)
 
    return parts.map((part, i) => {
      if (urlRegex.test(part) || /gov\.uk|nhs\.uk|citizensadvice|settled\.org|refugee|council\.uk/.test(part)) {
        const href = part.startsWith('http') ? part : `https://${part}`
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  // Converts the plain text content into readable JSX
  // Handles numbered lists, bullet points, and bold text
  function renderContent(text) {
    if (!text) return null

    // Split by double newline to get paragraphs/blocks
    const blocks = text.split('\n\n').filter(block => block.trim())

    return blocks.map((block, blockIndex) => {
      const lines = block.split('\n').filter(line => line.trim())

      return (
        <div key={blockIndex} style={styles.block}>
          {lines.map((line, lineIndex) => {
            const trimmed = line.trim()

            // Numbered list item e.g. "1. Do this thing"
            if (/^\d+\./.test(trimmed)) {
              return (
                <div key={lineIndex} style={styles.listItem}>
                  <span style={styles.listNumber}>
                    {trimmed.match(/^\d+/)[0]}
                  </span>
                  <span style={styles.listText}>
                    {renderWithLinks(trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'))}
                  </span>
                </div>
              )
            }

 
            // Bullet point e.g. "* Something" or "- Something"
            if (/^[\*\-•]/.test(trimmed)) {
              const content = trimmed
                .replace(/^[\*\-•]\s*/, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
 
              // Detect category headers — short lines ending with a colon
              // e.g. "Benefits:", "Housing:", "Healthcare:"
              const isHeader = content.endsWith(':') && content.length < 40
 
              if (isHeader) {
                return (
                  <p key={lineIndex} style={styles.categoryHeader}>
                    {content}
                  </p>
                )
              }
 
              return (
                <div key={lineIndex} style={styles.bulletItem}>
                  <span style={styles.bullet}>·</span>
                  <span style={styles.listText}>
                    {renderWithLinks(content)}
                  </span>
                </div>
              )
            }
 
            // Regular paragraph line
            return (
              <p key={lineIndex} style={styles.paragraph}>
                {renderWithLinks(
                  trimmed
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                )}
              </p>
            )
          })}
        </div>
      )
    })
  }

  return (
    <div style={styles.container} className="page-enter">

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Your Personalised Plan</h1>
        <p style={styles.subtitle}>
          Based on your situation, here is everything you need to know
          and do right now.
        </p>
        {/* Download button — hidden when printing */}
        <button
          onClick={handleDownload}
          className="no-print"
          style={styles.downloadBtn}
        >
          ↓ Save as PDF
        </button>
        {/* Print-only header - only visible in PDF */}
        <div className="print-only" style={{ display: 'none', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#6B6560' }}>
            Generated by Pathways · pathways-liard.vercel.app · {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Section cards */}
      <div style={styles.cardsContainer}>
        {sections.map((section, index) => {
          const content = parseSection(section.key)
          if (!content) return null

          return (
            <div key={section.key} style={styles.card} className="print-card card">
              {/* Card header */}
              <div style={styles.cardHeader}>
                <span style={styles.icon}>{section.icon}</span>
                <h2 style={styles.cardTitle}>{section.title}</h2>
              </div>

              {/* Card content */}
              <div style={styles.cardContent}>
                {renderContent(content)}
              </div>

            </div>
          )
        })}
      </div>

      {/* Deadline Timeline,  appears before section cards */}
      <DeadlineTimeline plan={plan} />

      {/* Footer — restart button */}
      <div style={styles.footer} className="no-print">
        <p style={styles.disclaimer}>
          This plan is for guidance only. Always seek professional
          legal advice for your specific situation.
        </p>
        <button onClick={onRestart} style={styles.restartBtn}>
          Start Again
        </button>
      </div>

    </div>
  )
}

const styles = {
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '2rem',
    paddingBottom: '4rem',
  },
  header: {
    textAlign: 'center',
    padding: '3rem 0 2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--accent-warm)',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-soft)',
    lineHeight: '1.6',
    maxWidth: '480px',
    margin: '0 auto',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '1.75rem',
    transition: 'box-shadow 0.2s ease',
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  icon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text)',
  },
  cardContent: {
    color: 'var(--text)',
    lineHeight: '1.7',
  },
  block: {
    marginBottom: '0.75rem',
  },
  paragraph: {
    fontSize: '0.95rem',
    marginBottom: '0.4rem',
    color: 'var(--text)',
  },
  listItem: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.6rem',
    alignItems: 'flex-start',
  },
  bulletItem: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.4rem',
    alignItems: 'flex-start',
  },
  listNumber: {
    background: 'var(--primary)',
    color: 'white',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '2px',
  },
  bullet: {
    color: 'var(--primary)',
    fontSize: '1.4rem',
    lineHeight: '1.2',
    flexShrink: 0,
  },
  listText: {
    fontSize: '0.95rem',
    color: 'var(--text)',
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--border)',
  },
  disclaimer: {
    fontSize: '0.8rem',
    color: 'var(--text-placeholder)',
    marginBottom: '1.25rem',
    lineHeight: '1.6',
  },
  restartBtn: {
    background: 'transparent',
    color: 'var(--text-soft)',
    padding: '0.75rem 2rem',
    borderRadius: '50px',
    fontSize: '0.95rem',
    fontWeight: '600',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  downloadBtn: {
    marginTop: '1.25rem',
    background: 'var(--primary)',
    color: 'white',
    padding: '0.75rem 1.75rem',
    borderRadius: '50px',
    fontSize: '0.95rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'underline',
    textDecorationColor: 'var(--primary-light)',
    textUnderlineOffset: '3px',
  },
  categoryHeader: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '1rem',
    marginBottom: '0.4rem',
  },
}

export default ResultsPage