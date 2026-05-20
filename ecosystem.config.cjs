const isWin = process.platform === "win32";

module.exports = {
  apps: [
    {
      name: "solomon-receptionist",
      script: isWin ? "cmd" : "npx",
      args: isWin ? "/c npx tsx agent/index.ts dev" : "tsx agent/index.ts dev",
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
      script: isWin ? "cmd" : "npm",
      args: isWin ? "/c npm run dev" : "run dev",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
