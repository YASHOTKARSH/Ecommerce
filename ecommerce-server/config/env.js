// Environment variable validation
const validateEnv = () => {
  const required = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
  ];

  const missing = [];
  const invalid = [];

  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Validate PORT is a number
  if (process.env.PORT && isNaN(parseInt(process.env.PORT, 10))) {
    invalid.push('PORT must be a number');
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
    invalid.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
  }

  // Check JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long in production');
    }
    
    // Additional required variables for production
    const productionRequired = ['JWT_REFRESH_SECRET', 'CLIENT_URL'];
    for (const varName of productionRequired) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }
  }

  // Report errors
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  if (invalid.length > 0) {
    console.error('❌ Invalid environment variables:');
    invalid.forEach(msg => console.error(`   - ${msg}`));
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
};

// Get environment-specific config
const getConfig = () => {
  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    mongoUri: process.env.MONGO_URI,
    mongoTestUri: process.env.MONGO_TEST_URI,
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expire: process.env.JWT_EXPIRE || '15m',
      refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    email: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM,
    },
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    redis: {
      url: process.env.REDIS_URL,
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
  };
};

module.exports = {
  validateEnv,
  getConfig,
};
