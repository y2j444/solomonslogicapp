@echo off
echo Launching Solomon's Logic Guardian (PM2)...
npx pm2 start ecosystem.config.cjs
echo ---
echo ALL SYSTEMS ONLINE.
echo Type 'npx pm2 status' to check health.
echo Type 'npx pm2 logs' to see Sara talking.
echo ---
pause
