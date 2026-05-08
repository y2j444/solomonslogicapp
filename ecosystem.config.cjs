module.exports = {
  apps: [
    {
      name: "solomon-receptionist",
      script: "npx",
      args: "tsx agent/index.ts dev",
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
      script: "npm",
      args: "run dev",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
