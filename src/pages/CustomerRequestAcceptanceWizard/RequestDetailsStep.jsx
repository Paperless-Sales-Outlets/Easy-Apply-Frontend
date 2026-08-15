import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiPhone, FiFileText } from 'react-icons/fi';
import { useVerifiedMobile, useVerifiedContext } from '../../components/verification';
import Field from '../../components/form/Field';
import Textarea from '../../components/form/Textarea';
import OptionTiles from '../../components/form/OptionTiles';
import Chips from '../../components/form/Chips';

const cardStyle = { padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'none', marginBottom: '1.5rem' };
const cardHeadingStyle = { color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };

export default function RequestDetailsStep({ isActive }) {
  const { t } = useTranslation();
  const verifiedMobile = useVerifiedMobile();
  const { selectedAccount } = useVerifiedContext();
  const isExisting = !!selectedAccount;
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
      {isExisting ? (
        <>
          {/* Already known from the verified account — carried through as hidden fields instead of re-asking. */}
          <input type="hidden" name="fullName" value={selectedAccount.fullName || selectedAccount.customerName || ''} />
          <input type="hidden" name="nic" value={selectedAccount.nic || ''} />
          <input type="hidden" name="telephone" value={selectedAccount.telephone || verifiedMobile || ''} />
          <input type="hidden" name="fixedNo" value={selectedAccount.telephone || ''} />
          <input type="hidden" name="mobileNo" value={selectedAccount.mobileNumber || verifiedMobile || ''} />
          <input type="hidden" name="email" value={selectedAccount.email || ''} />
        </>
      ) : (
        <div className="card" style={cardStyle}>
          <h4 style={cardHeadingStyle}><FiUser color="var(--slt-blue)" /> Applicant Details</h4>

          <Field name="fullName" label={t(`${k}.fullName`)} rules={{ required: true }} autoComplete="name" isActive={isActive} />

          <div className="field-row">
            <Field
              name="nic"
              label={t(`${k}.nicBrc`)}
              rules={{ required: true, kind: 'nic' }}
              helper={t(`${k}.nicHelper`)}
              isActive={isActive}
            />
            <Field
              name="telephone"
              label={t(`${k}.telephone`)}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              rules={{ required: true, kind: 'phone' }}
              isActive={isActive}
            />
          </div>
        </div>
      )}

      <div className="card" style={cardStyle}>
        <OptionTiles legend={t(`${k}.requiredService`)} name="service" options={services} />
        <Chips legend={t(`${k}.requestType`)} name="requestType" options={requestTypes} />
      </div>

      {!isExisting && (
        <div className="card" style={cardStyle}>
          <h4 style={cardHeadingStyle}><FiPhone color="var(--slt-blue)" /> {t(`${k}.contactDetails`)}</h4>
          <div className="field-row">
            <Field
              name="fixedNo"
              label={t(`${k}.fixed`)}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              rules={{ kind: 'phone' }}
              isActive={isActive}
            />
            <Field
              name="mobileNo"
              label={t(`${k}.mobile`)}
              type="tel"
              inputMode="numeric"
              prefix="+94"
              defaultValue={verifiedMobile}
              rules={{ required: true, kind: 'mobile' }}
              helper={t(`${k}.mobilePrefill`)}
              isActive={isActive}
            />
            <Field
              name="email"
              label={t(`${k}.email`)}
              type="email"
              inputMode="email"
              autoComplete="email"
              rules={{ required: true, kind: 'email' }}
              isActive={isActive}
            />
          </div>
        </div>
      )}

      <div className="card" style={{ ...cardStyle, marginBottom: 0 }}>
        <h4 style={cardHeadingStyle}><FiFileText color="var(--slt-blue)" /> {t(`${k}.descriptionHeading`)}</h4>
        <Textarea
          name="description"
          label={t(`${k}.descriptionLabel`)}
          rules={{ required: true }}
          maxLength={500}
          placeholder={t(`${k}.description`)}
          helper={t(`${k}.descriptionHelper`)}
          isActive={isActive}
        />
      </div>
    </div>
  );
}
