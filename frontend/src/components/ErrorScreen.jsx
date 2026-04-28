
// This component is shown when there's an error generating the action plan (could be server issue, API call failure, etc). 
// It gives the user some information about what might be going on and reassures them that their answers haven't been lost, and encourages them to try again.
function ErrorScreen({ errorType, onRetry }) {


  const isRateLimit = errorType === 'rate_limit' // this basically determines whether the error was due to hitting the rate limit or some other issue, so we can show a different message in that case to explain why they have to wait and that their answers have been saved and will be there when they try again after waiting. If it's not a rate limit issue, we show a more generic error message but still reassure them that their answers haven't been lost and encourage them to try again.
  const isNotFound = errorType === 'not_found'  

  return (
    <div style={styles.container} className="page-enter">
      <div style={styles.card} className="card">
        <div style={styles.iconContainer}>
          {/* Icon changes based on error type */}
          <span style={styles.icon}>{isRateLimit ? '⏳' : isNotFound ? '🔍' : '🌿'}</span>
        </div>

        {/* Title changes based on error type */}
        <h1 style={styles.title}>
          {isRateLimit ? 'Please wait a moment' : isNotFound ? 'Plan not found' : 'Something went wrong'}
  
        </h1>

        {/* Error message */}
        <p style={styles.message}>
          {isRateLimit
            ? 'You have made several requests in a short period. This limit exists to keep the service running fairly for everyone.'
            : isNotFound
            ? 'This plan link may have expired or does not exist.'
            : 'We were unable to generate your plan right now. This is usually temporary — our service may be starting up or experiencing high demand.'
          }
        </p>

        <p style={styles.submessage}>
          {isRateLimit
            ? (
              <>
                Please wait an hour before trying again. Your answers have been saved.
                <br />
                <span style={styles.limit}>Max 5 requests per hour :</span>
              </>
            )
            : isNotFound
            ? 'Return to the home page to create a new plan.'
            : 'Your answers have not been lost. Please try again and your plan will be generated shortly.'
          }
        </p>

        {/* Only show retry button if it's not a rate limit or not found error */}
        {!isRateLimit && !isNotFound && (
          <button onClick={onRetry} style={styles.retryBtn}>
            Try Again
          </button>
        )}

        {/* Button to go home for not found error */}
        {isNotFound && (
          <button
            onClick={() => {
              window.history.pushState({}, '', '/') // removes plan id from url
              window.location.reload() // reloads the page to show the welcome screen
            }}
            style={styles.retryBtn} // reusing the retry button styles for consistency
          >
            Go to Home Page
          </button>
        )}

        <p style={styles.reassurance}>
          {isRateLimit
            ? 'If you need urgent help, please contact a local immigration advice service.'
            : isNotFound
            ? 'You can start a new plan from the home page at any time.'
            : 'If this keeps happening, please try again in a few minutes.'
          }
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
  limit: {
    fontSize: '0.8rem',
    color: 'var(--text-placeholder)',
    marginTop: '0.25rem',
    display: 'inline-block',
  },
}

export default ErrorScreen