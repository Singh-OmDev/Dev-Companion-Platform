import React from 'react';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: "bg-surfaceHighlight text-text border border-border",
        primary: "bg-primary/20 text-primary border border-primary/20",
        success: "bg-green-500/10 text-green-500 border border-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    };

    return (
        <span className={twMerge(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export default Badge;
