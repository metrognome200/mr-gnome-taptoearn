import React from 'react';

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
