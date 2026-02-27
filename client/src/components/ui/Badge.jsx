import React from 'react';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: "bg-surfaceHighlight text-white border border-white/20",
        primary: "bg-[#D4F23F]/10 text-[#D4F23F] border border-[#D4F23F]/30",
        success: "bg-green-500/10 text-green-500 border border-green-500/30",
        warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30",
        danger: "bg-red-500/10 text-red-500 border border-red-500/30",
    };

    return (
        <span className={twMerge(
            "inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-wider",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export default Badge;
