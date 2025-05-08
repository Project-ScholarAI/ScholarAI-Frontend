import * as React from "react";

export const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width={75}
        height={75}
        viewBox="0 0 152 152"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* outer rounded square – identical style */}
        <rect
            opacity={0.7}
            x={1}
            y={1}
            width={150}
            height={150}
            rx={22}
            fill="rgba(255, 255, 255, 0.08)"
            fillOpacity={0.4}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={2}
        />
        {/* simplified GitHub "Octocat" – white fill */}
        <path
            d="M76 45c-18.2 0-33 14.8-33 33 0 14.6 9.5 27 22.6 31.4 1.6.3 2.2-.7 2.2-1.6v-6c-9.2 2-11.1-4.4-11.1-4.4-1.4-3.4-3.6-4.3-3.6-4.3-3-2 .2-2 .2-2 3.4.2 5.1 3.5 5.1 3.5 3 5.1 7.8 3.6 9.7 2.8.3-2.2 1.2-3.6 2.1-4.4-7.4-.8-15.2-3.7-15.2-16.4 0-3.6 1.3-6.6 3.4-9-0.3-.8-1.5-4 0.3-8.2 0 0 2.8-.9 9.4 3.4 2.7-.8 5.6-1.2 8.5-1.2s5.8.4 8.5 1.2c6.6-4.3 9.4-3.4 9.4-3.4 1.8 4.2.6 7.4.3 8.2 2.1 2.4 3.4 5.4 3.4 9 0 12.7-7.8 15.6-15.2 16.4 1.3 1.1 2.4 3.1 2.4 6.3v9.3c0 .9.6 1.9 2.2 1.6C99.5 105 109 92.6 109 78c0-18.2-14.8-33-33-33Z"
            fill="rgba(255, 255, 255)"
        />
        <defs>
            <linearGradient
                id="gh_bg"
                x1={0}
                y1={76.119}
                x2={152}
                y2={76.119}
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#0C4949" />
                <stop offset={1} stopColor="#097070" />
            </linearGradient>
        </defs>
    </svg>
);
