import React from "react";
import { Icon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactElement<Icon>;
    title: string;
    subtitle?: string;
    size?: "sm" | "md" | "lg";
    gradientLight?: { from: string; via: string; to: string };
    gradientDark?: { from: string; via: string; to: string };
}

export const Component: React.FC<ButtonProps> = ({
    icon,
    title,
    subtitle,
    size = "md",
    gradientLight = { from: "from-[#2575FC]/40", via: "via-[#2575FC]/40", to: "to-[#2575FC]/60" },
    gradientDark = { from: "from-[#2575FC]/30", via: "via-black/50", to: "to-black/70" },
    ...props
}) => {
    const sizes = {
        sm: "p-3 rounded-xl",
        md: "p-4 rounded-2xl",
        lg: "p-6 rounded-3xl",
    };

    return (
        <button
            {...props}
            className={`group relative overflow-hidden border-2 cursor-pointer transition-all duration-500 ease-out 
                  shadow-2xl hover:shadow-[#2575FC]/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95
                  ${sizes[size]} 
                  border-[#2575FC]/40 bg-gradient-to-br ${gradientLight.from} ${gradientLight.via} ${gradientLight.to} 
                  dark:${gradientDark.from} dark:${gradientDark.via} dark:${gradientDark.to}`}
        >
            {/* Moving gradient layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2575FC]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

            {/* Overlay glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2575FC]/20 via-[#2575FC]/10 to-[#2575FC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4">
                {/* Icon */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#2575FC]/50 to-[#2575FC]/30 backdrop-blur-sm group-hover:from-[#2575FC]/60 group-hover:to-[#2575FC]/40 transition-all duration-300">
                    {React.cloneElement(icon, {
                        className:
                            "w-7 h-7 text-white group-hover:text-white/90 transition-all duration-300 group-hover:scale-110 drop-shadow-lg",
                    })}
                </div>

                {/* Texts */}
                <div className="flex-1 text-left">
                    <p className="text-white font-bold text-lg group-hover:text-white/90 transition-colors duration-300 drop-shadow-sm">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Arrow */}
                <div className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    <svg
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        fill="none"
                        className="w-5 h-5 text-white"
                    >
                        <path
                            d="M9 5l7 7-7 7"
                            strokeWidth={2}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        ></path>
                    </svg>
                </div>
            </div>
        </button>
    );
};
