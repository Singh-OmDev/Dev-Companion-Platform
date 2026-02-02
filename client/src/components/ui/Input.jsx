import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ className, error, ...props }) => {
    return (
        <div className="w-full">
            <input
                className={twMerge(
                    "w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Input;
