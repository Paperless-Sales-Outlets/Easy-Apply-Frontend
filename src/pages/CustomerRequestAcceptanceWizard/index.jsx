import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WizardLayout from '../../components/wizard/WizardLayout';
import RequestDetailsStep from './RequestDetailsStep';
import DeclarationStep from './DeclarationStep';

export default function CustomerRequestAcceptanceWizard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const base = 'wizards.customerRequestAcceptance';

  const steps = [t(`${base}.steps.s1`), t(`${base}.steps.s2`)];
  const totalSteps = steps.length;

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      navigate('/completion', {
        state: { messageKey: 'completion.successMessages.customerRequestAcceptance' },
      });
    }
  };

  return (
    <WizardLayout
      title={t(`${base}.title`)}
      subtitle={t(`${base}.subtitle`)}
      steps={steps}
      currentStep={currentStep}
      hintTitle={t(`${base}.hintTitle`)}
      hintItems={t(`${base}.hintItems`, { returnObjects: true })}
      onBack={prevStep}
      onSubmit={handleSubmit}
    >
      {currentStep === 1 && <RequestDetailsStep />}
      {currentStep === 2 && <DeclarationStep />}
    </WizardLayout>
  );
}
