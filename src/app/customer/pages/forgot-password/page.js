'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Password reset link sent to your email.');
        setSubmitted(true);
      } else {
        toast.error(data.message || 'Unable to process reset request. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FBF9F7] py-12 px-4 text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="bg-white p-8 sm:p-12 rounded-none border border-[#E8DFC8] w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#F9F5EC] border border-[#E8DFC8] text-[#B98C2D] flex items-center justify-center mx-auto mb-3">
            <FiMail size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B98C2D] flex items-center justify-center gap-1 mb-1">
            <HiSparkles size={12} />
            Security Protocol
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#141311] tracking-tight mb-2">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 font-light leading-relaxed">
            Enter your registered email address and we will dispatch secure instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="bg-[#F9F5EC] text-emerald-800 p-4 rounded-none text-xs font-semibold mb-6 border border-emerald-200">
              Check your inbox! We've dispatched a reset link to <span className="font-bold">{email}</span>.
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#141311] hover:text-[#B98C2D] transition-colors"
            >
              <FiArrowLeft /> Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none text-xs text-[#141311] placeholder-gray-400 focus:bg-white focus:border-[#B98C2D] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#141311] hover:bg-[#2A1B24] text-white rounded-none font-bold text-xs uppercase tracking-widest transition-all border border-[#141311] disabled:opacity-50"
            >
              {loading ? 'Dispatching Instructions...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-4 border-t border-[#E8DFC8]">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#141311] transition-colors"
              >
                <FiArrowLeft /> Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
