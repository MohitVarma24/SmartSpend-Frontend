import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Coins,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settingsApi';
import { validatePassword } from '../utils/validation';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setCurrency(user.currency || 'INR');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await settingsApi.updateProfile({
        fullName: fullName.trim(),
        currency
      });
      updateUser(updated);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      setPasswordError(passErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await settingsApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-page" style={{ maxWidth: '800px' }}>
      
      {/* Top Header */}
      <div className="mb-4">
        <h2 className="fs-4 fw-bold text-dark m-0">Account & Security Settings</h2>
        <p className="text-muted small m-0">
          Manage your personal details, default currency, and password credentials
        </p>
      </div>

      {/* Profile Settings Card */}
      <div className="smart-card bg-white p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <User size={18} className="text-success" />
          <h5 className="fw-bold text-dark m-0 fs-6">User Profile</h5>
        </div>

        {profileSuccess && (
          <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
            <CheckCircle2 size={16} /> {profileSuccess}
          </div>
        )}

        {profileError && (
          <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
            <AlertCircle size={16} /> {profileError}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="row g-3">
            {/* Full Name */}
            <div className="col-12 col-md-6">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div className="col-12 col-md-6">
              <label className="form-label">Email Address (Primary)</label>
              <input
                type="email"
                className="form-control bg-light"
                value={user?.email || ''}
                disabled
              />
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                Email cannot be modified once registered
              </span>
            </div>

            {/* Currency */}
            <div className="col-12 col-md-6">
              <label className="form-label">Default Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-2">
            <button
              type="submit"
              className="btn btn-emerald btn-sm px-4 d-inline-flex align-items-center gap-2"
              disabled={profileLoading}
            >
              <Save size={16} />
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="smart-card bg-white p-4 mb-4">
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <ShieldCheck size={18} className="text-success" />
          <h5 className="fw-bold text-dark m-0 fs-6">Change Password</h5>
        </div>

        {passwordSuccess && (
          <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
            <CheckCircle2 size={16} /> {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
            <AlertCircle size={16} /> {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="row g-3">
            {/* Current Password */}
            <div className="col-12">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            {/* New Password */}
            <div className="col-12 col-md-6">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className="col-12 col-md-6">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-4 pt-2">
            <button
              type="submit"
              className="btn btn-emerald btn-sm px-4 d-inline-flex align-items-center gap-2"
              disabled={passwordLoading}
            >
              <Lock size={16} />
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Session / Logout Section */}
      <div className="smart-card bg-white p-4 border-danger">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="fw-bold text-danger m-0 fs-6">Sign Out of Account</h5>
            <p className="text-muted small m-0 mt-1">
              Terminate your active session on this device.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

    </div>
  );
}
