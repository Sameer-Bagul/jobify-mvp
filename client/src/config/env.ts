// Environment configuration for client
// Vite exposes env vars prefixed with VITE_ to the client

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  appName: import.meta.env.VITE_APP_NAME || 'Jobify',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate critical env vars
export function validateClientEnv(): void {
  if (!env.razorpayKeyId && import.meta.env.PROD) {
    console.warn('⚠️  Razorpay Key ID not configured. Payment features may not work.');
  }
}
