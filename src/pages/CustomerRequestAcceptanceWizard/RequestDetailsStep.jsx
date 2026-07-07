import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVerifiedMobile } from '../../components/verification';
import Field from '../../components/form/Field';
import Textarea from '../../components/form/Textarea';
import OptionTiles from '../../components/form/OptionTiles';
import Chips from '../../components/form/Chips';

export default function RequestDetailsStep() {
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const k = 'wizards.customerRequestAcceptance.requestDetails';

  const services = [
    { value: 'ftth', label: t(`${k}.ftth`), icon: 'link' },
    { value: 'peoTv', label: t(`${k}.peoTv`), icon: 'check-square' },
    { value: 'broadband', label: t(`${k}.broadband`), icon: 'trending-up' },
    { value: 'voice', label: t(`${k}.voice`), icon: 'smartphone' },
    { value: 'lte', label: t(`${k}.lte`), icon: 'globe' },
    { value: 'otherService', label: t(`${k}.otherService`), icon: 'plus-circle' },
  ];

  const requestTypes = [
    { value: 'billing', label: t(`${k}.billing`) },
    { value: 'serviceMod', label: t(`${k}.serviceMod`) },
    { value: 'hardware', label: t(`${k}.hardware`) },
    { value: 'otherRequest', label: t(`${k}.otherRequest`) },
  ];

  return (
    <div>
      <Field label={t(`${k}.fullName`)} rules={{ required: true }} autoComplete="name" />

      <div className="field-row">
        <Field
          label={t(`${k}.nicBrc`)}
          rules={{ required: true, kind: 'nic' }}
          helper={t(`${k}.nicHelper`)}
        />
        <Field
          label={t(`${k}.telephone`)}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          rules={{ required: true, kind: 'phone' }}
        />
      </div>

      <OptionTiles legend={t(`${k}.requiredService`)} name="service" options={services} />

      <Chips legend={t(`${k}.requestType`)} name="requestType" options={requestTypes} />

      <p className="field-group-label">{t(`${k}.contactDetails`)}</p>
      <div className="field-row">
        <Field
          label={t(`${k}.fixed`)}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          rules={{ kind: 'phone' }}
        />
        <Field
          label={t(`${k}.mobile`)}
          type="tel"
          inputMode="numeric"
          prefix="+94"
          defaultValue={verifiedMobile}
          rules={{ required: true, kind: 'mobile' }}
          helper={t(`${k}.mobilePrefill`)}
        />
        <Field
          label={t(`${k}.email`)}
          type="email"
          inputMode="email"
          autoComplete="email"
          rules={{ required: true, kind: 'email' }}
        />
      </div>

      <h3 className="wizard-subhead">{t(`${k}.descriptionHeading`)}</h3>
      <Textarea
        label={t(`${k}.descriptionLabel`)}
        rules={{ required: true }}
        maxLength={500}
        placeholder={t(`${k}.description`)}
        helper={t(`${k}.descriptionHelper`)}
      />
    </div>
  );
}
