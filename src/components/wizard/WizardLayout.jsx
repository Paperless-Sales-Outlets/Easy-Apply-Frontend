import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import WizardStepper from '../WizardStepper';

export default function WizardLayout({
  title,
  subtitle,
  steps,
  currentStep,
  hintTitle,
  hintItems = [],
  submitLabel,
  submitting = false,
  onBack,
  onSubmit,
  children,
}) {
  const { t } = useTranslation();
  const totalSteps = steps.length;
  const isLast = currentStep === totalSteps;

  const macro = [
    { name: t('wizardFlow.verify'), state: 'done' },
    { name: t('wizardFlow.details'), state: isLast ? 'done' : 'active' },
    { name: t('wizardFlow.declaration'), state: isLast ? 'active' : 'todo' },
  ];

  return (
    <div className="wizard">
      <aside className="wizard-rail">
        <h2 className="wizard-rail-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b2d5b' }}>
          {title}
        </h2>
        {subtitle && <p className="wizard-rail-sub">{subtitle}</p>}

        <ol className="wizard-progress">
          {macro.map((m) => (
            <li key={m.name} className={`is-${m.state}`}>
              <span className="wp-marker">
                {m.state === 'done' && <Icon name="check" size={12} />}
              </span>
              <span className="wp-label">
                <span className="wp-name">{m.name}</span>
                <span className="wp-state">{t(`wizardFlow.state.${m.state}`)}</span>
              </span>
            </li>
          ))}
        </ol>

        {hintItems.length > 0 && (
          <div className="wizard-hint" style={{ backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h4>{hintTitle}</h4>
            <ul>
              {hintItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="wizard-panel card" style={{ borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(11, 45, 91, 0.07)' }}>
        {/* Render horizontal step progress bar */}
        {steps && steps.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <WizardStepper currentStep={currentStep} steps={steps} />
          </div>
        )}

        <div className="wizard-panel-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <span 
            className="wizard-step-count" 
            style={{ 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              color: '#0f57a8', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em' 
            }}
          >
            STEP {currentStep} OF {totalSteps}
          </span>
          <h3 className="wizard-step-name" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b2d5b', margin: '0.2rem 0 0 0' }}>
            {steps[currentStep - 1]}
          </h3>
        </div>

        <form onSubmit={onSubmit} noValidate={false}>
          <div className="wizard-step-body">{children}</div>

          <div 
            className="wizard-actions" 
            style={{ 
              display: 'flex', 
              justify: 'space-between', 
              borderTop: '1px solid #e2e8f0', 
              paddingTop: '1.5rem', 
              marginTop: '2rem' 
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              disabled={currentStep === 1 || submitting}
            >
              ← {t('common.previous')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {isLast ? submitLabel || t('wizardFlow.submit') : `${t('wizardFlow.continueTo', { next: steps[currentStep] })} →`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
