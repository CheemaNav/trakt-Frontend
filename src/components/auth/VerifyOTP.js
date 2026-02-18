import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

function VerifyOTP() {
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    // Redirect to register if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/register', { replace: true });
        }
    }, [email, navigate]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (email && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email]);

    const handleVerify = useCallback(async (otpCode) => {
        const code = otpCode || otp.join('');
        if (code.length !== OTP_LENGTH) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Verification failed. Please try again.');
                // Clear inputs on error so user can re-enter
                setOtp(new Array(OTP_LENGTH).fill(''));
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [email, navigate, otp]);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Auto-submit when all digits are entered
        if (value && index === OTP_LENGTH - 1) {
            const code = newOtp.join('');
            if (code.length === OTP_LENGTH) {
                handleVerify(code);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Only process if it looks like a 6-digit code
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);

            // Focus last input
            inputRefs.current[OTP_LENGTH - 1].focus();

            // Auto-submit
            handleVerify(pastedData);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('A new verification code has been sent to your email.');
                setResendCooldown(RESEND_COOLDOWN);
                setOtp(new Array(OTP_LENGTH).fill(''));
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            } else {
                setError(data.error || 'Failed to resend code. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    if (!email) return null;

    return (
        <div className="auth-container">
            {/* Left Side - Image Section */}
            <div className="auth-image-section">
                <div className="auth-image-placeholder">
                    {/* Image placeholder */}
                </div>
            </div>

            {/* Right Side - OTP Form */}
            <div className="auth-form-section">
                <div className="auth-form-container">
                    <div className="auth-header">
                        <h1>Verify Your Email</h1>
                        <p>We've sent a 6-digit verification code to</p>
                        <p className="otp-email-highlight">{email}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="otp-form">
                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    className="otp-input"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="auth-button"
                            onClick={() => handleVerify()}
                            disabled={loading || otp.join('').length !== OTP_LENGTH}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        <div className="otp-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span>The verification code expires after 10 minutes</span>
                        </div>

                        <div className="resend-section">
                            <span>Didn't receive the code?</span>
                            {resendCooldown > 0 ? (
                                <span className="resend-timer">Resend code in {resendCooldown}s</span>
                            ) : (
                                <button
                                    type="button"
                                    className="resend-button"
                                    onClick={handleResend}
                                >
                                    Resend Code
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="auth-footer">
                        <p>
                            Wrong email? <Link to="/register">Go back to Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTP;
