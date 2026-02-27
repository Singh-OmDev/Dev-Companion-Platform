import React from 'react';

import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) => {
    const baseStyles = "cursor-pointer inline-flex items-center justify-center font-black uppercase tracking-wider transition-all duration-200 active:translate-y-0 active:translate-x-0 active:shadow-none disabled:opacity-50 disabled:pointer-events-none relative group";

    const variants = {
        primary: "bg-[#D4F23F] text-black border-2 border-[#D4F23F] hover:shadow-[-4px_4px_0px_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:translate-x-1",
        secondary: "bg-transparent text-white border-2 border-white/20 hover:border-white hover:shadow-[-4px_4px_0px_rgba(212,242,63,1)] hover:-translate-y-1 hover:translate-x-1 hover:text-[#D4F23F]",
        ghost: "bg-transparent text-white/50 hover:text-[#D4F23F] hover:bg-white/5 border-b-2 border-transparent hover:border-[#D4F23F]",
        danger: "bg-red-500/10 text-red-500 border-2 border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[-4px_4px_0px_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:translate-x-1"
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
