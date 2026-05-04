// This is the main App component which serves as the root component for the React application.
// responsible for rendering the main structure of the app
// Its main function is to render the content of the app.

import { useState, useEffect} from 'react' // Importing useState hook from React to manage state in the component
import WelcomeScreen from './components/WelcomeScreen' // Importing the WelcomeScreen component which is a child component that will be rendered inside App
import OnboardingForm from './components/OnboardingForm'
import LoadingScreen from './components/LoadingScreen'
import ResultsPage from './components/ResultsPage'
import ErrorScreen from './components/ErrorScreen.jsx'
import axios from 'axios'
import SharedPlanLoader from './components/SharedPlanLoader.jsx'

function App() {
  // currentPage decides which screen is shown
  // It starts on 'welcome' which the first thing a user sees
  const [currentPage, setCurrentPage] = useState('welcome')

  // selectedLanguage stores what the user picked
  // This is passed to every subsequent component
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  const [formAnswers, setFormAnswers] = useState(null)

  const [actionPlan, setActionPlan] = useState(null)

  const [errorType, setErrorType] = useState(null)

  // Check if the URL contains a plan ID when the app first loads
  // e.g. pathways-liard.vercel.app/plan/abc123
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/^\/plan\/([a-zA-Z0-9]+)$/)

    if (match) {
      const planId = match[1]
      fetchSharedPlan(planId)
    }
  }, [])

  // Fetches a shared plan from the backend by ID
  async function fetchSharedPlan(planId) {
    setCurrentPage('loading_shared')
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await axios.get(`${apiUrl}/api/plans/${planId}`) // This endpoint returns the plan text and the language it was generated in based on the plan ID in the URL. If the plan ID is invalid or expired, it throws an error which we catch to show a not found message.
      setActionPlan(response.data.plan_text)
      setSelectedLanguage(response.data.language)
      setCurrentPage('results')
    } catch (error) {
      setCurrentPage('error')
      setErrorType('not_found')
    }
  }

  // Called by WelcomeScreen when user picks a language and clicks continue
  // It saves the language and moves to the next page
  function handleLanguageSelect(language) {
    setSelectedLanguage(language)
    setCurrentPage('onboarding')
  }

  // Called when the onboarding form is complete
  // answers is the full object of everything the user told us
  function handleFormComplete(answers) {
    setFormAnswers(answers)
    setCurrentPage('loading') // next i'll build the loading screen
  }

  // Called when the loading screen gets the API response back
  // plan is the action plan text from Gemini
  function handlePlanReady(plan, error) {
    if (error || !plan) {
      // Something went wrong, show error screen
      setCurrentPage('error')
      setErrorType(error?.type || 'server_error')
      return
    }
    setActionPlan(plan)
    setCurrentPage('results')
  }

  function handleRetry() {
    setCurrentPage('loading') // Go back to loading screen which will retry the API call
  }

  // Resets everything back to the beginning
  function handleRestart() {
    setCurrentPage('welcome')
    setSelectedLanguage(null)
    setFormAnswers(null)
    setActionPlan(null)
  }

  function handleBack() {
    setCurrentPage('welcome')
    setSelectedLanguage(null)
    setFormAnswers(null)
  }

  return (
    <div>
      <header className="app-header">
        <span className="app-logo">Pathways</span>
      </header>
      
      {currentPage === 'welcome' && ( // If we're on the welcome page, show the WelcomeScreen component and pass down the handleLanguageSelect function as a prop so that WelcomeScreen can call it when the user selects a language and clicks continue.
        <WelcomeScreen onLanguageSelect={handleLanguageSelect} />
      )}

      {currentPage === 'onboarding' && ( // 
        <OnboardingForm
          language={selectedLanguage} // Pass down the selected language as a prop so that OnboardingForm can use it to display content in the correct language.
          onComplete={handleFormComplete} // Pass down the handleFormComplete function as a prop so that OnboardingForm can call it when the user completes the form and submits their answers.
          onBack={handleBack} // Pass down the handleBack function as a prop so that OnboardingForm can call it when the user clicks the back button.
        />
      )}

      {currentPage === 'loading' && (
        <LoadingScreen
          answers={formAnswers}
          language={selectedLanguage}
          onComplete={handlePlanReady} // Pass down the handlePlanReady function as a prop so that LoadingScreen can call it when it gets the API response back, either with the action plan or with an error if something went wrong.
        />
      )}

      {currentPage === 'results' && (
        <ResultsPage
          plan={actionPlan}
          language={selectedLanguage}
          onRestart={handleRestart} // Pass down the handleRestart function as a prop so that ResultsPage can call it when the user clicks the button to start over, the user is sent back to the loading page and API call fires again.
        />
      )}

      {currentPage === 'error' && (
        <ErrorScreen
          errorType={errorType}
          onRetry={handleRetry}
        />
       )
      }
      {currentPage === 'loading_shared' && (
        <SharedPlanLoader />
       )
      }
    </div>
  )
}



export default App