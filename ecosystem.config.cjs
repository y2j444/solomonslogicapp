module.exports = {
  apps: [
    {
      name: "solomon-receptionist",
      script: "./node_modules/tsx/dist/cli.mjs",
      args: "agent/index.ts dev",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        DEBUG: "livekit:*"
      }
    },
    {
      name: "solomon-webapp",
      script: "./node_modules/next/dist/bin/next",
      args: "dev",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
