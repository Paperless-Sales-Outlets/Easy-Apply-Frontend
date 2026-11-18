import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPasskeySupported,
  formatPasskeyError,
  suggestDeviceName,
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


test('suggestDeviceName picks a platform-appropriate default', () => {
  const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
  const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
  const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
  assert.equal(suggestDeviceName(MAC), 'Mac (Touch ID)');
  assert.equal(suggestDeviceName(WIN), 'Windows PC (Windows Hello)');
  assert.match(suggestDeviceName(IPHONE), /iPhone/);   // iPhone UAs also say "Mac OS X"
  assert.match(suggestDeviceName(ANDROID), /Android/);  // Android UAs also say "Linux"
  assert.equal(suggestDeviceName(''), 'My Passkey Device');
});
