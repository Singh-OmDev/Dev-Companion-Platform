import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ className, error, ...props }) => {
    return (
        <div className="w-full">
            <input
                className={twMerge(
                    "w-full bg-[#020202] border-2 border-white/10 rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4F23F] focus:ring-0 transition-colors font-mono",
                    error && "border-red-500 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Input;
