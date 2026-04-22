// This is the main App component which serves as the root component for the React application.
// responsible for rendering the main structure of the app
// Its main function is to render the content of the app.

import { useState } from 'react' // Importing useState hook from React to manage state in the component
import WelcomeScreen from './components/WelcomeScreen' // Importing the WelcomeScreen component which is a child component that will be rendered inside App

function App() {
  // currentPage decides which screen is shown
  // It starts on 'welcome' which the first thing a user sees
  const [currentPage, setCurrentPage] = useState('welcome')

  // selectedLanguage stores what the user picked
  // This is passed to every subsequent component
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  // Called by WelcomeScreen when user picks a language and clicks continue
  // It saves the language and moves to the next page
  function handleLanguageSelect(language) {
    setSelectedLanguage(language)
    setCurrentPage('onboarding')
  }

  return (
    <div>
      {currentPage === 'welcome' && ( // If we're on the welcome page, show the WelcomeScreen component and pass down the handleLanguageSelect function as a prop so that WelcomeScreen can call it when the user selects a language and clicks continue.
        <WelcomeScreen onLanguageSelect={handleLanguageSelect} />
      )}

      {currentPage === 'onboarding' && ( // for now if we on onbaording page just show placeholder
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '480px', width: '90%' }}>
            <p style={{ color: 'var(--text-soft)' }}>
              Onboarding form coming next — language: {selectedLanguage} 
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

