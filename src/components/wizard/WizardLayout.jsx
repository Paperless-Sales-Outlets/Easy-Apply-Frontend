import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';

/* Two-column wizard shell: a sticky left rail (title, the macro
   Verify -> Details -> Declaration journey, and a "keep nearby" hint
   card) beside the form panel on the right. Collapses to one column on
   small screens. The granular per-wizard steps live inside the panel.

   Verification is already complete by the time a wizard renders (the OTP
   gate), so "Verify" always shows done. Everything up to the final step
   is "Details"; the last step is the "Declaration". */
export default function WizardLayout({
  title,
  subtitle,
  steps,
  currentStep,
  hintTitle,
  hintItems = [],
  submitLabel,
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
        <h2 className="wizard-rail-title">{title}</h2>
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
          <div className="wizard-hint">
            <h4>{hintTitle}</h4>
            <ul>
              {hintItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div className="wizard-panel card slash-rule">
        <div className="wizard-panel-head">
          <span className="wizard-step-count">
            {t('wizardFlow.stepCount', { current: currentStep, total: totalSteps })}
          </span>
          <h3 className="wizard-step-name">{steps[currentStep - 1]}</h3>
        </div>

        <form onSubmit={onSubmit} noValidate={false}>
          <div className="wizard-step-body">{children}</div>

          <div className="wizard-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              disabled={currentStep === 1}
            >
              {t('common.previous')}
            </button>
            <button type="submit" className="btn btn-primary">
              {isLast ? submitLabel || t('wizardFlow.submit') : t('wizardFlow.continueTo', { next: steps[currentStep] })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
