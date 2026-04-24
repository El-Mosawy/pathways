import { useState, useEffect } from 'react' // useEffect is for running side effects like timers and API calls (since we make first API call in this component)
import axios from 'axios' // Axios to make HTTP request to our FastAPI backend
import thoughtsImg from '../assets/thoughts.svg' // Simple illustration to make the loading screen less boring

// LoadingScreen receives three props from App.jsx:
// - answers: the complete form data to send to the API
// - language: the user's chosen language
// - onComplete: function to call when we have the result
function LoadingScreen({ answers, language, onComplete }) {

  // Which loading message is currently showing
  const [messageIndex, setMessageIndex] = useState(0)

  // These rotate while the user waits
  // They reassure the user something real is happening
  const messages = [
    "Reading your situation...",
    "Checking your entitlements...",
    "Finding what support is available...",
    "Building your personalised plan...",
    "Almost ready...",
  ]

  // Rotate the message every 2.5 seconds
  // This is a side effect which sets up a timer outside React
  useEffect(() => {
    const interval = setInterval(() => {
      // prev is the current index
      // We use the modulo operator % to loop back to 0
      // when we reach the end of the messages array
      // e.g. if there are 5 messages: 4 % 5 = 4, 5 % 5 = 0 (loops back)
      setMessageIndex(prev => (prev + 1) % messages.length)
    }, 2500)

    // This is called a cleanup function
    // When the component unmounts (disappears from screen)
    // React runs this to stop the timer
    // Without this the timer would keep running forever in the background
    return () => clearInterval(interval)
  }, [])

  // Fire the API call the moment this component appears on screen
  useEffect(() => {
    async function fetchPlan() {
      try {
        // axios.post sends a POST request to our FastAPI backend
        // The second argument is the request body which are our form answers
        // plus the language the user chose
//        const response = await axios.post(
//          'http://localhost:8000/api/onboarding/submit',
//          {
        const response = await axios.post(
          'https://pathways-6w0u.onrender.com/api/onboarding/submit', // this is the URL of our deployed backend, above is local dev URL
          {
            ...answers,
            preferred_language: language,
          }
        )

        // When the response arrives, pass the action plan up to App.jsx
        onComplete(response.data.action_plan)

      } catch (error) {
        console.error('API call failed:', error)
        // For now we pass a friendly error message up
        // Later we can build a proper error screen
        onComplete(null, error)
      }
    }

    fetchPlan() // Call the async function we defined above
  }, []) // Empty array = run once when component mounts

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Illustration */}
        <img
          src={thoughtsImg}
          alt="Person sitting thoughtfully"
          style={styles.illustration}
        />

        {/* Breathing circle animation */}
        <div style={styles.breathingContainer}>
          <div style={styles.breathingCircleOuter}>
            <div style={styles.breathingCircleInner} />
          </div>
        </div>

        {/* Rotating message */}
        <p style={styles.message}>
          {messages[messageIndex]}
        </p>

        <p style={styles.subMessage}>
          This usually takes 10–20 seconds
        </p>

      </div>

      {/* Breathing animation keyframes */}
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }

        @keyframes breatheInner {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes fadeMessage {
          0% { opacity: 0; transform: translateY(8px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>
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
  illustration: {
    width: '180px',
    height: 'auto',
    marginBottom: '2rem',
    opacity: 0.9,
  },
  breathingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    height: '80px',
  },
  breathingCircleOuter: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'breathe 4s ease-in-out infinite',
  },
  breathingCircleInner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--primary)',
    animation: 'breatheInner 4s ease-in-out infinite',
  },
  message: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '0.5rem',
    animation: 'fadeMessage 2.5s ease-in-out infinite',
  },
  subMessage: {
    fontSize: '0.85rem',
    color: 'var(--text-placeholder)',
  },
}

export default LoadingScreen