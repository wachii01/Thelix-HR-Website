import React from "react";
import { Icon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactElement;
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
    gradientLight = { from: "from-primary/40", via: "via-primary/40", to: "to-primary/60" },
    gradientDark = { from: "from-primary/30", via: "via-black/50", to: "to-black/70" },
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
                  shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95
                  ${sizes[size]} 
                  border-primary/40 bg-gradient-to-br ${gradientLight.from} ${gradientLight.via} ${gradientLight.to} 
                  dark:${gradientDark.from} dark:${gradientDark.via} dark:${gradientDark.to}`}
        >
            {/* Moving gradient layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

            {/* Overlay glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4">
                {/* Icon */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary/50 to-primary/30 backdrop-blur-sm group-hover:from-primary/60 group-hover:to-primary/40 transition-all duration-300">
                    {React.cloneElement(icon, {
                        className:
                            "w-7 h-7 text-black group-hover:text-black/90 transition-all duration-300 group-hover:scale-110 drop-shadow-lg",
                    })}
                </div>

                {/* Texts */}
                <div className="flex-1 text-left">
                    <p className="text-black font-bold text-lg group-hover:text-black/90 transition-colors duration-300 drop-shadow-sm">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-black/70 text-sm group-hover:text-black/90 transition-colors duration-300">
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
                        className="w-5 h-5 text-black"
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
