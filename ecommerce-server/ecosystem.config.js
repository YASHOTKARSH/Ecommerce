module.exports = {
  apps: [
    {
      name: 'ecommerce-api',
      script: './index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      // Memory management
      max_memory_restart: '500M',
      // Auto restart on file changes (disable in production)
      watch: false,
      // Merge logs from all instances
      merge_logs: true,
      // Start app automatically on PM2 startup
      autorestart: true,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        watch: true,
      },
    },
  ],
};
