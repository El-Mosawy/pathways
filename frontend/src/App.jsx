// This is the main App component which serves as the root component for the React application.
// responsible for rendering the main structure of the app
// Its main function is to render the content of the app.

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
        <h1 style={{
          color: '#B07D5A',
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem'
        }}>
          Pathways
        </h1>
        <p style={{ color: 'var(--text-soft)' }}>
          Your personalised UK rights navigator
        </p>
      </div>
    </div>
  )
}

export default App