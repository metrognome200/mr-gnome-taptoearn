// client/src/components/ui/Toast.jsx
import React, { useState, useEffect } from 'react';

export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const types = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-4 right-4 ${types[type]} text-white px-6 py-3
            animation: 'slide-up 0.5s ease-out',
            animation: 'fade-in 0.5s ease-out',
            animation: 'bounce-in 0.5s cubic-bezier(0.36, 0, 0.66, 1.54)',
            animation: 'spin-slow 3s linear infinite',
        }`}>
            {message}
        </div>
    );
};