import React, { useState, useEffect, useCallback } from 'react';
import {
  FiKey,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiShield,
  FiSmartphone,
  FiClock,
} from 'react-icons/fi';
import {
  listPasskeys,
  registerPasskey,
  deletePasskey,
  isPasskeySupported,
  suggestDeviceName,
} from '../services/passkeyService';

export default function PasskeyManagementModal({ isOpen, onClose }) {
  const [passkeys, setPasskeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const supported = isPasskeySupported();

  const fetchPasskeys = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await listPasskeys();
      setPasskeys(data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to load passkeys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPasskeys();
      setShowAddForm(false);
      setStatusMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, fetchPasskeys]);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setRegistering(true);

    try {
      const nameToUse = deviceName.trim() || suggestDeviceName();
      await registerPasskey(nameToUse);
      setStatusMessage(`Successfully registered passkey "${nameToUse}"! You can now sign in with Touch ID, Windows Hello, or your device authenticator.`);
      setDeviceName('');
      setShowAddForm(false);
      await fetchPasskeys();
    } catch (err) {
      setErrorMessage(err.message || 'Passkey registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the passkey "${name || 'Device'}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deletePasskey(id);
      setStatusMessage(`Passkey "${name || 'Device'}" removed.`);
      await fetchPasskeys();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to remove passkey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-content passkey-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div className="passkey-modal-header-info">
            <span className="passkey-modal-icon">
              <FiKey size={20} />
            </span>
            <div>
              <h3 className="admin-modal-title">Passkey Authentication</h3>
              <p className="admin-modal-subtitle">
                Register device authenticators (Touch ID, Windows Hello, fingerprint, PIN) for quick, passwordless login.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="admin-modal-body">
          {statusMessage && (
            <div className="admin-login-success" role="status">
              <FiCheckCircle size={16} aria-hidden="true" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="admin-login-error" role="alert">
              <FiAlertCircle size={16} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!supported && (
            <div className="admin-login-error" role="alert">
              <FiAlertCircle size={16} aria-hidden="true" />
              <span>
                WebAuthn Passkeys are not supported on this browser or platform. Please use a supported browser such as modern Chrome, Edge, Safari, or Firefox.
              </span>
            </div>
          )}

          {/* Registration Section */}
          {supported && (
            <div className="passkey-action-section">
              {!showAddForm ? (
                <button
                  type="button"
                  className="admin-login-passkey-btn"
                  onClick={() => setShowAddForm(true)}
                  disabled={registering}
                >
                  <FiPlus size={16} />
                  Register This Device as a Passkey
                </button>
              ) : (
                <form onSubmit={handleRegister} className="passkey-add-form">
                  <label className="admin-login-label" htmlFor="passkey-device-name">
                    Device / Authenticator Name
                  </label>
                  <div className="passkey-form-row">
                    <input
                      id="passkey-device-name"
                      type="text"
                      className="admin-login-input"
                      placeholder={`e.g. ${suggestDeviceName()}`}
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="admin-login-submit passkey-confirm-btn"
                      disabled={registering}
                      aria-busy={registering}
                    >
                      {registering ? 'Prompting device…' : 'Continue'}
                    </button>
                    <button
                      type="button"
                      className="admin-passkey-cancel-btn"
                      onClick={() => setShowAddForm(false)}
                      disabled={registering}
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="passkey-form-hint">
                    Your browser will prompt you to authenticate using Touch ID, Windows Hello, fingerprint, PIN, or facial recognition.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* Registered Passkeys List */}
          <div className="passkey-list-section">
            <h4 className="passkey-list-title">
              <FiShield size={15} /> Your Registered Passkeys ({passkeys.length})
            </h4>

            {loading ? (
              <div className="passkey-loading-state">Loading registered passkeys…</div>
            ) : passkeys.length === 0 ? (
              <div className="passkey-empty-state">
                <FiSmartphone size={28} className="passkey-empty-icon" />
                <p>No passkeys registered yet for this account.</p>
                <small>Click "Register This Device" above to add your first passkey.</small>
              </div>
            ) : (
              <ul className="passkey-item-list">
                {passkeys.map((pk) => (
                  <li key={pk._id} className="passkey-item">
                    <div className="passkey-item-icon">
                      <FiKey size={16} />
                    </div>
                    <div className="passkey-item-details">
                      <span className="passkey-item-name">{pk.deviceName || 'Passkey Device'}</span>
                      <span className="passkey-item-meta">
                        <FiClock size={12} />
                        Added {new Date(pk.createdAt).toLocaleDateString()}
                        {pk.lastUsedAt && ` · Used ${new Date(pk.lastUsedAt).toLocaleDateString()}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="passkey-item-delete"
                      onClick={() => handleDelete(pk._id, pk.deviceName)}
                      title="Remove passkey"
                      aria-label={`Remove passkey ${pk.deviceName}`}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="admin-modal-footer">
          <button type="button" className="admin-passkey-cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

