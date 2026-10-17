'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLock, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F7] py-12 px-4 text-[#141311]">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="bg-white p-8 sm:p-12 rounded-none border border-[#E8DFC8] w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#F9F5EC] border border-[#E8DFC8] text-[#B98C2D] flex items-center justify-center mx-auto mb-3">
            <FiLock size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B98C2D] flex items-center justify-center gap-1 mb-1">
            <HiSparkles size={12} />
            Security Credential Update
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#141311] tracking-tight mb-2">
            Establish New Password
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Please enter and confirm your new secure account password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none text-xs text-[#141311] focus:bg-white focus:border-[#B98C2D] outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none text-xs text-[#141311] focus:bg-white focus:border-[#B98C2D] outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#141311] hover:bg-[#2A1B24] text-white rounded-none font-bold text-xs uppercase tracking-widest transition-all border border-[#141311] disabled:opacity-50 mt-2"
            disabled={loading}
          >
            {loading ? 'Updating Credentials...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
