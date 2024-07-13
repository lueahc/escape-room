module.exports = {
    apps: [
        {
            name: "backend-server",
            script: "dist/main.js",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};