'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function VerifyPage() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isRequestSent = false;

    async function verifyEmail() {
      if (isRequestSent) return;
      isRequestSent = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setVerified(true);
          toast.success(data.message || 'Email verified successfully!');
          setTimeout(() => {
            router.push('/login');
          }, 2500);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setLoading(false);
      }
    }

    verifyEmail();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#FBF9F7] text-[#141311] px-4">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="bg-white p-8 sm:p-12 rounded-none border border-[#F0DCE3] w-full max-w-md text-center">
        {loading ? (
          <div>
            <div className="w-14 h-14 border-2 border-[#F0DCE3] border-t-[#C53261] rounded-none animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-serif font-bold text-[#141311] mb-1">
              Verifying Client Account...
            </h2>
            <p className="text-xs text-gray-400 font-light">
              Connecting with authentication servers. Please hold.
            </p>
          </div>
        ) : verified ? (
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
              <FiCheck size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#141311] mb-2">
              Email Verified Successfully
            </h2>
            <p className="text-xs text-gray-500 font-light mb-6">
              Your beauty account is fully verified. Redirecting you to sign in...
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311]"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center mx-auto mb-3">
              <FiAlertCircle size={22} />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#141311] mb-2">
              Verification Link Invalid
            </h2>
            <p className="text-xs text-gray-500 font-light mb-6">
              This verification link has expired or has already been used.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-[#141311] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311]"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
