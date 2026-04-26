import { useState, useEffect, useRef } from 'react' // useEffect is for running side effects like timers and API calls (since we make first API call in this component)
import axios from 'axios' // Axios to make HTTP request to our FastAPI backend
import thoughtsImg from '../assets/thoughts.svg' // Simple illustration to make the loading screen less boring

// LoadingScreen receives three props from App.jsx:
// - answers: the complete form data to send to the API
// - language: the user's chosen language
// - onComplete: function to call when we have the result
function LoadingScreen({ answers, language, onComplete }) {

    const hasFetched = useRef(false) // To prevent multiple API calls in case of retries


    // Which loading message is currently showing
    const [messageIndex, setMessageIndex] = useState(0)

    // These rotate while the user waits
    // They reassure the user something real is happening
    const messages = [
        "Reading your situation...",
        "Checking your entitlements...",
        "Finding what support is available...",
        "Building your personalised plan...",
        "This can take up to a minute - please wait...",
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

        if (hasFetched.current) return // If we've already fetched, do nothing
        hasFetched.current = true // Mark that we've fetched to prevent future calls

        let completed = false
        const maxRetries = 5 // If the API call fails, we will retry up to 5 times with a delay in between     
        const retryDelay = 8000  // 8 seconds delay between retries
        const apiUrl = import.meta.env.VITE_API_URL // Get API URL based on environment (dev or prod) from environment variable

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                // axios.post sends a POST request to the FastAPI backend
                // The second argument is the request body which are our forms answers and the selected language
            `${apiUrl}/api/onboarding/submit`, // FastAPI endpoint but now using the environment variable for the base URL
            {
                ...answers,
                preferred_language: language,
            },
            {
                timeout: 35000 // 40 seconds timeout for the API call (cold starts can take a while)
            }
            )
            // only call onComplete if we haven't already completed successfully, to avoid calling it multiple times in case of retries which happened before this change
            if (!completed) {
                completed = true
                onComplete(response.data.action_plan) // If successful, call onComplete with the action plan text from the API response
            }
            return

        } catch (error) {
            console.log(`Attempt ${attempt} failed:`, error.message)

            if (error.response?.status === 429) { // if get 429 Too Many Requests, it means we've hit the rate limit
                onComplete(null, { type: 'rate_limit' })
                return
            }

            if (completed) return

            if (attempt === maxRetries) {
                onComplete(null, error) // If we've reached the max retries, call onComplete with an error so App.jsx (for now it just logs to console but later we can show an error message to the user)
                return
            }

            await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
        }
    }

    fetchPlan()
    }, [])

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
          This usually takes up to 60 seconds
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

export default LoadingScreen // This is a simple loading screen with a breathing animation and rotating messages to keep the user engaged while they wait for the API response. The useEffect hook is used to trigger the API call as soon as the component mounts, and it also handles retrying the API call if it fails, with a delay between retries. When the API call succeeds, it calls the onComplete function passed down from App.jsx with the action plan text, which then updates the state in App.jsx and moves the user to the results page. If it fails after all retries, it calls onComplete with an error, which for now just logs to console but later we can show an error message to the user.