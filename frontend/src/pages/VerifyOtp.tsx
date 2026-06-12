import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { setVerified } from '../store/authSlice.js';
import type { RootState } from '../store/index.js';
import { KeyRound, Activity, ArrowRight } from 'lucide-react';

export const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const savedEmail = useSelector((state: RootState) => state.auth.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const email = savedEmail || localStorage.getItem('email');
    if (!email) {
      setError('Email context missing. Please register or sign in again.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.verifyOtp(email, otp);
      dispatch(setVerified());
      setMessage('Verification successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl mb-3 border border-primary/25">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Enter OTP</h2>
          <p className="text-sm text-slate-400 mt-1">We sent a verification code to {savedEmail || 'your email'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/25 rounded-xl text-accent-rose text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-secondary/10 border border-secondary/25 rounded-xl text-secondary text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">One-Time Password (6 Digits)</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 tracking-[0.3em] font-mono text-center focus:outline-none focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent-cyan hover:brightness-110 active:brightness-95 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 text-sm mt-2"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
