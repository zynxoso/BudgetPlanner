import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Precision geometric financial emblem */}
            <path
                d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 3V29"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
            />
            <path
                d="M28 9.5L16 16L4 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
            />
            <path
                d="M16 16V29"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="3" fill="currentColor" />
        </svg>
    );
}

