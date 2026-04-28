// DeadlineTimeline component
// Parses structured DEADLINE lines from the AI output
// and renders a visual timeline with urgency colour coding

function DeadlineTimeline({ plan }) {

  // Parse the TIMELINE section from the action plan
  function parseTimeline() {
    if (!plan) return []

    const start = '[SECTION:TIMELINE]'
    const end = '[/SECTION]'
    const startIndex = plan.indexOf(start)
    if (startIndex === -1) return []

    const contentStart = startIndex + start.length
    const contentEnd = plan.indexOf(end, contentStart)
    if (contentEnd === -1) return []

    const content = plan.slice(contentStart, contentEnd).trim()
    if (content === 'NO_DEADLINES') return []

    // Parse each DEADLINE line
    // Handle both "DEADLINE:value" and "DEADLINE: value" (with space)
    const lines = content.split('\n').filter(line =>
      line.trim().startsWith('DEADLINE')
    )

    return lines.map((line, index) => {
      // Remove "DEADLINE:" or "DEADLINE: " prefix and split by |
      const cleaned = line.replace(/^DEADLINE:\s*/i, '').trim()
      const parts = cleaned.split('|')

      return {
        id: index,
        timeframe: parts[0]?.trim() || '',
        description: parts[1]?.trim() || '',
        urgency: parts[2]?.trim().toLowerCase() || 'info',
      }
    }).filter(d => d.timeframe && d.description)
  }

  const deadlines = parseTimeline()

  // Don't render anything if no deadlines
  if (deadlines.length === 0) return null

  // Colour and label config per urgency level
  const urgencyConfig = {
    critical: {
      color: '#C0392B',
      bg: '#FDF0EF',
      border: '#E8B4B0',
      dot: '#C0392B',
      label: 'Urgent',
      pulse: true,
    },
    warning: {
      color: '#D68910',
      bg: '#FEF9EF',
      border: '#F5CBA7',
      dot: '#D68910',
      label: 'Soon',
      pulse: false,
    },
    info: {
      color: '#3D9A8B',
      bg: 'var(--primary-light)',
      border: '#A8D5CF',
      dot: '#3D9A8B',
      label: 'Upcoming',
      pulse: false,
    },
  }

  return (
    <div style={styles.container} className="page-enter card">
      {/* Section header */}
      <div style={styles.header}>
        <span style={styles.headerIcon}>⏱</span>
        <h2 style={styles.headerTitle}>Your Deadlines & Key Dates</h2>
      </div>

      {/* Timeline */}
      <div style={styles.timeline} className="print-card">
        {deadlines.map((deadline, index) => {
          const config = urgencyConfig[deadline.urgency] || urgencyConfig.info
          const isLast = index === deadlines.length - 1

          return (
            <div key={deadline.id} style={styles.timelineItem}>

              {/* Left side — dot and line */}
              <div style={styles.leftColumn}>
                <div style={{
                  ...styles.dot,
                  background: config.dot,
                  boxShadow: config.pulse
                    ? `0 0 0 4px ${config.border}`
                    : 'none',
                }}>
                  {config.pulse && (
                    <div style={{
                      ...styles.pulseRing,
                      borderColor: config.dot,
                    }} />
                  )}
                </div>
                {!isLast && <div style={styles.line} />}
              </div>

              {/* Right side — card */}
              <div style={{
                ...styles.card,
                background: config.bg,
                borderColor: config.border,
                marginBottom: isLast ? 0 : '1rem',
              }}>
                <div style={styles.cardTop}>
                  <span style={{
                    ...styles.timeframe,
                    color: config.color,
                  }}>
                    {deadline.timeframe}
                  </span>
                  <span style={{
                    ...styles.urgencyBadge,
                    background: config.dot,
                  }}>
                    {config.label}
                  </span>
                </div>
                <p style={styles.description}>
                  {deadline.description}
                </p>
              </div>

            </div>
          )
        })}
      </div>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

    </div>
  )
}

const styles = {
  container: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '1.75rem',
    marginTop: '1.25rem',
    marginBottom: '1.25rem',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)',
  },
  headerIcon: {
    fontSize: '1.5rem',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text)',
  },
  timeline: {
    paddingLeft: '0.25rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    paddingTop: '0.75rem',
  },
  dot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
  },
  pulseRing: {
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid',
    animation: 'pulse 2s ease-out infinite',
  },
  line: {
    width: '2px',
    flex: 1,
    minHeight: '24px',
    background: 'var(--border)',
    marginTop: '4px',
  },
  card: {
    flex: 1,
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid',
    padding: '0.85rem 1rem',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
    gap: '0.5rem',
  },
  timeframe: {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  urgencyBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '50px',
    flexShrink: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text)',
    lineHeight: '1.5',
  },
}

export default DeadlineTimeline