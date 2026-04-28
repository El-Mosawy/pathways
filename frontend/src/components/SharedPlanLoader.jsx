// SharedPlanLoader component
// Shown briefly while fetching a shared plan from the database
// Gives the user visual feedback that something is happening
function SharedPlanLoader() {
  return (
    <div style={styles.container} className="page-enter">
      <div style={styles.card} className="card">
        <p style={styles.message}>Loading shared plan...</p>
        <p style={styles.subMessage}>Please wait a moment</p>
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
  message: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '0.5rem',
  },
  subMessage: {
    fontSize: '0.85rem',
    color: 'var(--text-placeholder)',
  },
}

export default SharedPlanLoader