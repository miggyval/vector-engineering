const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
  testDir:'tests/browser', fullyParallel:true, workers:2,
  use:{baseURL:'http://127.0.0.1:8765/vector-engineering/', trace:'retain-on-failure'},
  webServer:{command:`${process.env.VE_PYTHON || 'python3'} scripts/serve_preview.py`,url:'http://127.0.0.1:8765/vector-engineering/',reuseExistingServer:!process.env.CI},
});
