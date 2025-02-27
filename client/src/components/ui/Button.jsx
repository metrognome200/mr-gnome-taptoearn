// client/src/components/ui/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    onClick,
    ...props 
}) => {
    const baseStyles = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center';
    
    const variants = {
        primary: 'bg-gnome-500 hover:bg-gnome-600 text-white disabled:bg-gnome-300',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-500',
        outline: 'border-2 border-gnome-500 text-gnome-500 hover:bg-gnome-500 hover:text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <motion.button 
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`
                ${baseStyles} 
                ${variants[variant]} 
                ${sizes[size]} 
                ${disabled ? 'cursor-not-allowed opacity-60' : ''} 
                ${className}
            `}
            onClick={disabled ? undefined : onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center space-x-2">
                    <svg 
                        className="animate-spin h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Loading...</span>
                </div>
            ) : children}
        </motion.button>
    );
};

// client/src/components/ui/Card.jsx
export const Card = ({ 
    children, 
    title,
    className = '',
    ...props 
}) => {
    return (
        <div 
            className={`bg-gray-800 rounded-lg p-6 ${className}`}
            {...props}
        >
            {title && (
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            )}
            {children}
        </div>
    );
};