import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPasskeySupported,
  formatPasskeyError,
} from '../../../admin/services/passkeyService.js';

test('Frontend Passkey Service', async (t) => {
  await t.test('isPasskeySupported returns boolean', () => {
    const supported = isPasskeySupported();
    assert.equal(typeof supported, 'boolean');
  });

  await t.test('formatPasskeyError formats common WebAuthn errors user-friendly', () => {
    // 1. NotAllowedError (user cancelled prompt or device timeout)
    const notAllowed = new Error('The operation was not allowed');
    notAllowed.name = 'NotAllowedError';
    assert.match(formatPasskeyError(notAllowed), /cancelled, timed out/i);

    // 2. InvalidStateError (already registered)
    const invalidState = new Error('Key already exists');
    invalidState.name = 'InvalidStateError';
    assert.match(formatPasskeyError(invalidState), /already been registered/i);

    // 3. NotSupportedError
    const notSupported = new Error('Hardware not supported');
    notSupported.name = 'NotSupportedError';
    assert.match(formatPasskeyError(notSupported), /not supported/i);

    // 4. Server API response error
    const apiError = {
      response: {
        data: {
          message: 'Passkey not recognized.',
        },
      },
    };
    assert.equal(formatPasskeyError(apiError), 'Passkey not recognized.');

    // 5. Fallback error message
    const genericError = new Error('Custom device failure');
    assert.equal(formatPasskeyError(genericError), 'Custom device failure');
  });
});

