import dotenv from 'dotenv';

dotenv.config();

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        NEXT_PUBLIC_GOOGLE_CX: process.env.GOOGLE_CX,
    },
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/images/**',
            },
        ],
    },
}

export default config;
