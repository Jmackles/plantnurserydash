import dotenv from 'dotenv';

dotenv.config();

export default {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        NEXT_PUBLIC_GOOGLE_CX: process.env.GOOGLE_CX,
    },
};
