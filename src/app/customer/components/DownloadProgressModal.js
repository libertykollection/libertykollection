'use client';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const DownloadProgressModal = ({ isOpen, onRequestClose, fileName, onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => onComplete(), 1000);
                        return 100;
                    }
                    return prev + 5; // Simulate progress
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            ariaHideApp={false}
            style={{
                overlay: { zIndex: 20000, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                content: {
                    zIndex: 20001, margin: 'auto', width: '90%', maxWidth: '450px',
                    height: 'fit-content', padding: '2rem',
                    borderRadius: '24px', border: 'none', background: '#fff',
                    textAlign: 'center'
                }
            }}
        >
            <div className="flex flex-col items-center">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Preparing Download</h2>
                <p className="text-gray-500 mb-6 font-medium">Please be patient while we retrieve your digital product... ✨</p>

                {/* Progress Bar Container */}
                <div className="w-full bg-gray-100 h-4 rounded-full mb-4 overflow-hidden relative">
                    <div
                        className="bg-orange-500 h-full transition-all duration-200 ease-out flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ width: `${progress}%` }}
                    >
                        {progress > 10 && `${progress}%`}
                    </div>
                </div>

                <div className="text-sm font-bold text-orange-600 mb-4 animate-pulse uppercase tracking-widest">
                    {progress < 100 ? 'Syncing with secure server...' : 'Download Ready!'}
                </div>

                <hr className="w-full border-gray-100 mb-6" />

                <div className="bg-orange-50 p-4 rounded-2xl w-full">
                    <p className="text-orange-800 font-bold mb-1">Thank you for shopping with Liberty Kollection!</p>
                    <p className="text-orange-600/70 text-xs">Your file "{fileName}" will be saved to your device shortly.</p>
                </div>
            </div>
        </Modal>
    );
};

export default DownloadProgressModal;
