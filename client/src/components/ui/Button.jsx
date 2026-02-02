import React from 'react';

import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 rounded-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(212,242,63,0.3)] hover:shadow-[0_0_25px_rgba(212,242,63,0.5)]",
        secondary: "bg-surfaceHighlight text-text hover:bg-surfaceHighlight/80 border border-border",
        ghost: "bg-transparent text-text-muted hover:text-text hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
