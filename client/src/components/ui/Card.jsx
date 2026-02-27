import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, hover = false }) => {
    return (
        <div className={twMerge(
            "bg-[#020202] border border-white/10 p-6 transition-all duration-300 relative group overflow-hidden",
            hover && "cursor-pointer hover:border-[#D4F23F] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_rgba(212,242,63,1)]",
            className
        )}>
            {/* Minimalist corner accent on hover */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#D4F23F] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#D4F23F] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default Card;
