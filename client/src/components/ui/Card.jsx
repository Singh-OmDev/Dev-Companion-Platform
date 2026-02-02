import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, hover = false }) => {
    return (
        <div className={twMerge(
            "bg-surface border border-border rounded-xl p-6 transition-all duration-300",
            hover && "hover:border-primary/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer group",
            className
        )}>
            {children}
        </div>
    );
};

export default Card;
