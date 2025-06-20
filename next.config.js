/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEO4J_URI: process.env.NEO4J_URI,
        NEO4J_USERNAME: process.env.NEO4J_USERNAME,
        NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'redis': false,
            };
        }
        return config;
    },
}

module.exports = nextConfig 