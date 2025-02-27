// client/src/hooks/useAnimation.js
import { useState, useEffect } from 'react';

export const useAnimation = (initialValue = 0, targetValue = 0, duration = 1000) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;

            if (progress < 1) {
                setValue(initialValue + (targetValue - initialValue) * progress);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setValue(targetValue);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [targetValue, initialValue, duration]);

    return value;
};