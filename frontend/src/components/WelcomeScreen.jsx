// We import useState from React because we need to track
// which language the user has selected
import { useState } from 'react'

// We import our illustration (here the together image)
import togetherImg from '../assets/together.svg'

// This component receives one prop called onLanguageSelect
// When the user picks a language and clicks continue,
// this function is called and tells App.jsx what language was chosen
// Props are how child components communicate back to their parent
function WelcomeScreen({ onLanguageSelect }) {

  // State to track which language button is currently selected
  // Starts as null meaning nothing selected yet
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  // These are the languages we support
  // Each has a code (what we send to the API) and a label (what we show)
  // We show the language name IN that language — so Arabic speakers
  // see Arabic script, not the word "Arabic" in English
  const languages = [
    { code: 'english',  label: 'English' },
    { code: 'arabic',   label: 'العربية' },
    { code: 'french',   label: 'Français' },
    { code: 'dari',     label: 'دری' },
    { code: 'tigrinya', label: 'ትግርኛ' },
    { code: 'somali',   label: 'Soomaali' },
    { code: 'kurdish',  label: 'کوردی' },
    { code: 'ukrainian',label: 'Українська' },
  ]

  return (
    <div style={styles.container}>

      {/* Main card */}
      <div style={styles.card}>

        {/* Illustration at the top */}
        <img
          src={togetherImg}
          alt="Two people walking together"
          style={styles.illustration}
        />

        {/* Heading and subtitle */}
        <h1 style={styles.title}>Pathways</h1>
        <p style={styles.subtitle}>
          Your personal guide to rights and support in the UK
        </p>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Language selection label */}
        <p style={styles.languageLabel}>
          Choose your language
        </p>

        {/* Language buttons grid */}
        <div style={styles.languageGrid}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              style={{
                ...styles.languageBtn,
                // If this button is selected, apply selected styles on top
                ...(selectedLanguage === lang.code ? styles.languageBtnSelected : {})
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Continue button, only active if a language is selected */}
        <button
          onClick={() => {
            if (selectedLanguage) {
              onLanguageSelect(selectedLanguage)
            }
          }}
          style={{
            ...styles.continueBtn,
            // If no language selected, make it look disabled
            ...(selectedLanguage ? {} : styles.continueBtnDisabled)
          }}
        >
          Continue →
        </button>

        {/* Small reassurance message */}
        <p style={styles.reassurance}>
          Free · Private · No account needed
        </p>

      </div>
    </div>
  )
}

// All styles in one place at the bottom of the file
// This is called the "styles object" pattern. We can use these in our JSX above and all styles in one place making editing easier
// just keeps JS clean and readable
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
    padding: '2.5rem',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  illustration: {
    width: '200px',
    height: 'auto',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: 'var(--accent-warm)',
    marginBottom: '0.5rem',
    fontFamily: 'Nunito, sans-serif',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-soft)',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '1.5rem',
  },
  languageLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-soft)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  languageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  languageBtn: {
    padding: '0.6rem 0.4rem',
    borderRadius: '50px',
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'Nunito, sans-serif',
  },
  languageBtnSelected: {
    background: 'var(--primary-light)',
    boxShadow: 'inset 0 0 0 1.5px var(--primary)',
    color: 'var(--primary)',
    fontWeight: '700',
  },
  continueBtn: {
    width: '100%',
    padding: '1rem',
    borderRadius: '50px',
    background: 'var(--primary)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginBottom: '1rem',
    transition: 'var(--transition)',
    fontFamily: 'Nunito, sans-serif',
  },
  continueBtnDisabled: {
    background: 'var(--border)',
    color: 'var(--text-placeholder)',
    cursor: 'not-allowed',
  },
  reassurance: {
    fontSize: '0.8rem',
    color: 'var(--text-placeholder)',
  },
}

export default WelcomeScreen // so this component can be imported in App.jsx