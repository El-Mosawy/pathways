// This is the main App component which serves as the root component for the React application.
// responsible for rendering the main structure of the app
// Its main function is to render the content of the app.

import { useState } from 'react' // Importing useState hook from React to manage state in the component
import WelcomeScreen from './components/WelcomeScreen' // Importing the WelcomeScreen component which is a child component that will be rendered inside App
import OnboardingForm from './components/OnboardingForm'
import LoadingScreen from './components/LoadingScreen'
import ResultsPage from './components/ResultsPage'
import ErrorScreen from './components/ErrorScreen.jsx'


function App() {
  // currentPage decides which screen is shown
  // It starts on 'welcome' which the first thing a user sees
  const [currentPage, setCurrentPage] = useState('welcome')

  // selectedLanguage stores what the user picked
  // This is passed to every subsequent component
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  const [formAnswers, setFormAnswers] = useState(null)

  const [actionPlan, setActionPlan] = useState(null)


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

  return (
    <div>
      {currentPage === 'welcome' && ( // If we're on the welcome page, show the WelcomeScreen component and pass down the handleLanguageSelect function as a prop so that WelcomeScreen can call it when the user selects a language and clicks continue.
        <WelcomeScreen onLanguageSelect={handleLanguageSelect} />
      )}

      {currentPage === 'onboarding' && ( // 
        <OnboardingForm
          language={selectedLanguage} // Pass down the selected language as a prop so that OnboardingForm can use it to display content in the correct language.
          onComplete={handleFormComplete} // Pass down the handleFormComplete function as a prop so that OnboardingForm can call it when the user completes the form and submits their answers.
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
        <ErrorScreen onRetry={handleRetry} />
       )
      }
    </div>
  )
}



export default App