
// This component is shown when there's an error generating the action plan (could be server issue, API call failure, etc). 
// It gives the user some information about what might be going on and reassures them that their answers haven't been lost, and encourages them to try again.
function ErrorScreen({ onRetry }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.iconContainer}>
          <span style={styles.icon}>🌿</span>
        </div>

        <h1 style={styles.title}>Something went wrong</h1>

        <p style={styles.message}>
          We were unable to generate your plan right now.
          This is usually temporary — our service may be
          starting up or experiencing high demand.
        </p>

        <p style={styles.submessage}>
          Your answers have not been lost. Please try again
          and your plan will be generated shortly.
        </p>

        <button onClick={onRetry} style={styles.retryBtn}>
          Try Again
        </button>

        <p style={styles.reassurance}>
          If this keeps happening, please try again in a few minutes.
        </p>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '3rem 2.5rem',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '1.5rem',
  },
  icon: {
    fontSize: '3rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: 'var(--accent-warm)',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: 'var(--text)',
    lineHeight: '1.7',
    marginBottom: '1rem',
  },
  submessage: {
    fontSize: '0.9rem',
    color: 'var(--text-soft)',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  retryBtn: {
    width: '100%',
    padding: '1rem',
    borderRadius: '50px',
    background: 'var(--primary)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
    marginBottom: '1.25rem',
  },
  reassurance: {
    fontSize: '0.8rem',
    color: 'var(--text-placeholder)',
    lineHeight: '1.5',
  },
}

export default ErrorScreen