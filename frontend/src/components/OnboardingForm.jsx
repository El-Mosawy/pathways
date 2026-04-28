import { useState } from 'react'
import walkingImg from '../assets/walking.svg'

// OnboardingForm receives two props from App.jsx:
// - language: the language the user selected on the welcome screen
// - onComplete: a function to call when the form is done,
//               passing the completed answers object up to App.jsx
function OnboardingForm({ language, onComplete, onBack }) {

  // currentStep tracks which question we're on
  // Starts at 0 — the first question
  const [currentStep, setCurrentStep] = useState(0)

  // answers collects everything the user has told us
  // Starts empty — we fill it as they answer each question
  const [answers, setAnswers] = useState({})

  // This defines ALL our questions in one place
  // Each question is an object describing everything about it
  // This is called a "data-driven" approach — the UI is generated
  // from data rather than being hardcoded
  const questions = [
    {
      // The field name must match our Pydantic model exactly
      field: 'visa_status',
      question: 'What is your current immigration status in the UK?',
      type: 'options',
      options: [
        { value: 'asylum_seeker',          label: 'Asylum seeker (waiting for decision)' },
        { value: 'core_protection',        label: 'Refugee — status granted after March 2026' },
        { value: 'refugee_five_year',      label: 'Refugee — status granted before March 2026' },
        { value: 'humanitarian_protection',label: 'Humanitarian protection' },
        { value: 'eu_pre_settled',         label: 'EU pre-settled status' },
        { value: 'eu_settled',             label: 'EU settled status' },
        { value: 'skilled_worker',         label: 'Skilled worker visa' },
        { value: 'student_visa',           label: 'Student visa' },
        { value: 'family_visa',            label: 'Family visa' },
        { value: 'undocumented',           label: 'No documents / undocumented' },
        { value: 'other',                  label: 'Other / not sure' },
      ]
    },
    {
      field: 'claim_date_before_march_2026',
      question: 'Did you submit your asylum claim before 2nd March 2026?',
      type: 'yesno',
      optional: false,
      // Only show this question if the user is an asylum seeker
      // This is our conditional logic
      showIf: (answers) => answers.visa_status === 'asylum_seeker',
    },
    {
      field: 'country_of_origin',
      question: 'Which country are you originally from?',
      type: 'text',
      placeholder: 'e.g. Sudan, Afghanistan, Syria...',
    },
    {
      field: 'years_in_uk',
      question: 'How long have you been in the UK?',
      type: 'options',
      options: [
        { value: 0.25,  label: 'Less than 3 months' },
        { value: 0.5,   label: '3–6 months' },
        { value: 1,     label: '6–12 months' },
        { value: 2,     label: '1–2 years' },
        { value: 3.5,   label: '2–5 years' },
        { value: 7.5,   label: '5–10 years' },
        { value: 12,    label: 'More than 10 years' },
      ]
    },
    {
      field: 'has_children',
      question: 'Do you have children living with you in the UK?',
      type: 'yesno',
    },
    {
      field: 'is_employed',
      question: 'Are you currently working?',
      type: 'yesno',
    },
    {
      field: 'english_level',
      question: 'How would you describe your English level?',
      type: 'options',
      options: [
        { value: 'none',                label: 'None — I do not speak English' },
        { value: 'basic',               label: 'Basic — a few words and phrases' },
        { value: 'intermediate',        label: 'Intermediate — I can hold a conversation' },
        { value: 'upper_intermediate',  label: 'Good — comfortable in most situations' },
        { value: 'fluent',              label: 'Fluent — English is no problem for me' },
      ]
    },
    {
      field: 'currently_in_asylum_accommodation',
      question: 'Are you currently living in asylum accommodation provided by the government?',
      type: 'yesno',
      optional: true,
      // Only relevant for asylum seekers and refugees
      showIf: (answers) => ['asylum_seeker', 'core_protection', 'refugee_five_year'].includes(answers.visa_status),
    },
    {
      field: 'has_nrpf',
      question: 'Does your visa have a "No Recourse to Public Funds" (NRPF) condition?',
      type: 'yesno',
      optional: true,
      hint: 'This is written on your visa or Biometric Residence Permit. Not sure? You can skip this.',
    },
  ]

  // Filter questions to only include ones that should be shown
  // based on the user's previous answers
  // showIf is a function — if a question has one, we call it
  // passing the current answers. If it returns false, we skip that question.
  const visibleQuestions = questions.filter(q =>
    !q.showIf || q.showIf(answers)
  )

  // The current question object based on the step we're on
  const currentQuestion = visibleQuestions[currentStep]

  // Total steps is the number of visible questions
  const totalSteps = visibleQuestions.length

  // Progress as a percentage — for the progress bar
  const progress = ((currentStep) / totalSteps) * 100

  // Called when the user selects an answer
  // field is the question's field name e.g. 'visa_status'
  // value is what they chose e.g. 'asylum_seeker'
  function handleAnswer(field, value) {
    setAnswers(prev => ({
      // ...prev copies all existing answers
      // then we add/overwrite the new answer
      ...prev,
      [field]: value
    }))
  }

  // Called when user clicks Next
  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last question — submit
      handleSubmit()
    }
  }

  // Called when user clicks Back
  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Called when the form is complete
  // Builds the final object to send to the API
  function handleSubmit() {
    // Pass the completed answers up to App.jsx
    onComplete(answers)
  }

  // Has the current question been answered?
  // Used to enable/disable the Next button
  const currentAnswer = answers[currentQuestion?.field]
  const isAnswered = currentAnswer !== undefined && currentAnswer !== ''

  return (
    <div style={styles.container} className="page-enter">
      <div style={styles.card} className="card">
        {/* Back to language selection */}
        <button
          onClick={onBack}
          style={styles.backToStart}
        >
          ← Change language
        </button>
        {/* Top section — illustration and progress */}
        <div style={styles.topSection}>
          <img
            src={walkingImg}
            alt="Person walking forward"
            style={styles.illustration}
          />

          {/* Progress bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`
                }}
              />
            </div>
            <p style={styles.progressText}>
              Question {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Question */}
        <div key={currentStep} style={styles.questionSection} className="page-enter">
          <h2 style={styles.questionText}>
            {currentQuestion?.question}
          </h2>

          {/* Optional hint text */}
          {currentQuestion?.hint && (
            <p style={styles.hintText}>{currentQuestion.hint}</p>
          )}

          {/* Render the right input type based on the question */}
          {currentQuestion?.type === 'options' && (
            <div style={styles.optionsGrid}>
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.field, option.value)}
                  style={{
                    ...styles.optionBtn,
                    ...(answers[currentQuestion.field] === option.value
                      ? styles.optionBtnSelected
                      : {})
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'yesno' && (
            <div style={styles.yesNoContainer}>
              {[
                { value: true,  label: 'Yes' },
                { value: false, label: 'No' },
              ].map(option => (
                <button
                  key={String(option.value)}
                  onClick={() => handleAnswer(currentQuestion.field, option.value)}
                  style={{
                    ...styles.yesNoBtn,
                    ...(answers[currentQuestion.field] === option.value
                      ? styles.yesNoBtnSelected
                      : {})
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'text' && (
            <input
              type="text"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.field] || ''}
              onChange={e => handleAnswer(currentQuestion.field, e.target.value)}
              style={styles.textInput}
            />
          )}

          {/* Optional skip button */}
          {currentQuestion?.optional && (
            <button
              onClick={() => {
                // Skip means we set the value to null and move on
                handleAnswer(currentQuestion.field, null)
                handleNext()
              }}
              style={styles.skipBtn}
            >
              Not sure? Skip this question
            </button>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={styles.navContainer}>
          {/* Back button — hidden on first step */}
          {currentStep > 0 && (
            <button onClick={handleBack} style={styles.backBtn}>
              ← Back
            </button>
          )}

          {/* Spacer — pushes next button to the right when back is hidden */}
          {currentStep === 0 && <div />}

          {/* Next / Submit button */}
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            style={{
              ...styles.nextBtn,
              ...(!isAnswered ? styles.nextBtnDisabled : {})
            }}
          >
            {currentStep === totalSteps - 1 ? 'Get My Plan →' : 'Next →'}
          </button>
        </div>

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
    padding: '2.5rem',
    maxWidth: '540px',
    width: '100%',
  },
  topSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  illustration: {
    width: '80px',
    height: 'auto',
    flexShrink: 0,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: '6px',
    background: 'var(--border)',
    borderRadius: '50px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    borderRadius: '50px',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',   
  },
  progressText: {
    fontSize: '0.8rem',
    color: 'var(--text-soft)',
    fontWeight: '600',
  },
  questionSection: {
    marginBottom: '2rem',
  },
  questionText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  hintText: {
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
    background: 'var(--primary-light)',
    borderRadius: 'var(--radius-sm)',
    lineHeight: '1.5',
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  optionBtn: {
    padding: '0.85rem 1.2rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'Nunito, sans-serif',
  },
  optionBtnSelected: {
    background: 'var(--primary-light)',
    boxShadow: 'inset 0 0 0 1.5px var(--primary)',
    color: 'var(--primary)',
    fontWeight: '700',
  },
  yesNoContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  yesNoBtn: {
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'Nunito, sans-serif',
  },
  yesNoBtnSelected: {
    background: 'var(--primary-light)',
    boxShadow: 'inset 0 0 0 1.5px var(--primary)',
    color: 'var(--primary)',
  },
  textInput: {
    width: '100%',
    padding: '0.85rem 1.2rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '1rem',
    fontFamily: 'Nunito, sans-serif',
    outline: 'none',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  skipBtn: {
    marginTop: '1rem',
    background: 'transparent',
    color: 'var(--text-soft)',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    cursor: 'pointer',
    display: 'block',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  backBtn: {
    background: 'transparent',
    color: 'var(--text-soft)',
    padding: '0.75rem 1.5rem',
    borderRadius: '50px',
    fontSize: '0.95rem',
    fontWeight: '600',
    border: 'none',
    boxShadow: 'inset 0 0 0 1.5px var(--border)',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  nextBtn: {
    background: 'var(--primary)',
    color: 'white',
    padding: '0.85rem 2rem',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s ease, box-shadow 0.2s ease',
  },
  nextBtnDisabled: {
    background: 'var(--border)',
    color: 'var(--text-placeholder)',
    cursor: 'not-allowed',
  },
  backToStart: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-soft)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 0 1rem 0',
    fontFamily: 'Nunito, sans-serif',
    display: 'block',
    transition: 'color 0.2s ease',
  },
}

export default OnboardingForm