import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration
export const STRIPE_CONFIG = {
  // Test keys - replace with your actual keys
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  // Production keys
  publishableKeyProd: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_PROD || 'pk_live_...',
  
  // API endpoints
  apiEndpoints: {
    createPaymentIntent: '/api/stripe/create-payment-intent',
    createSubscription: '/api/stripe/create-subscription',
    cancelSubscription: '/api/stripe/cancel-subscription',
    getSubscription: '/api/stripe/get-subscription',
    updateSubscription: '/api/stripe/update-subscription',
    createCustomer: '/api/stripe/create-customer',
    getCustomer: '/api/stripe/get-customer',
    updateCustomer: '/api/stripe/update-customer',
    createCheckoutSession: '/api/stripe/create-checkout-session',
    getCheckoutSession: '/api/stripe/get-checkout-session',
    createPortalSession: '/api/stripe/create-portal-session',
    webhook: '/api/stripe/webhook'
  }
};

// Initialize Stripe
export const stripePromise = loadStripe(
  import.meta.env.PROD 
    ? STRIPE_CONFIG.publishableKeyProd 
    : STRIPE_CONFIG.publishableKey
);

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '3 projects maximum',
      'Basic audio analysis',
      'Standard AI assistance',
      'Community support',
      'Basic templates'
    ],
    limits: {
      projects: 3,
      audioAnalysis: 10, // per month
      aiRequests: 50, // per month
      storage: 100 // MB
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited projects',
      'Advanced audio analysis',
      'Premium AI assistance',
      'Priority support',
      'All templates',
      'Export to MIDI/WAV',
      'Collaboration tools',
      'Version control'
    ],
    limits: {
      projects: -1, // unlimited
      audioAnalysis: -1, // unlimited
      aiRequests: -1, // unlimited
      storage: 1000 // GB
    }
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 49.99,
    interval: 'month',
    stripePriceId: 'price_studio_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Pro',
      'Real-time collaboration',
      'Advanced mixing tools',
      'VST plugin support',
      'Custom AI models',
      'White-label options',
      'API access',
      'Dedicated support'
    ],
    limits: {
      projects: -1, // unlimited
      audioAnalysis: -1, // unlimited
      aiRequests: -1, // unlimited
      storage: 5000, // GB
      collaborators: 10
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Studio',
      'Unlimited collaborators',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee',
      'Custom training',
      'Dedicated account manager'
    ],
    limits: {
      projects: -1, // unlimited
      audioAnalysis: -1, // unlimited
      aiRequests: -1, // unlimited
      storage: -1, // unlimited
      collaborators: -1 // unlimited
    }
  }
};

// One-time purchases
export const ONE_TIME_PURCHASES = {
  extraStorage: {
    id: 'extra_storage_1gb',
    name: 'Extra Storage (1GB)',
    price: 2.99,
    stripePriceId: 'price_extra_storage_1gb'
  },
  premiumTemplates: {
    id: 'premium_templates',
    name: 'Premium Templates Pack',
    price: 9.99,
    stripePriceId: 'price_premium_templates'
  },
  aiCredits: {
    id: 'ai_credits_100',
    name: 'AI Credits (100)',
    price: 4.99,
    stripePriceId: 'price_ai_credits_100'
  }
};

// Payment methods
export const PAYMENT_METHODS = {
  card: 'card',
  bankAccount: 'us_bank_account',
  sepa: 'sepa_debit',
  ideal: 'ideal',
  sofort: 'sofort',
  alipay: 'alipay',
  wechat: 'wechat_pay'
};

// Currency configuration
export const CURRENCY_CONFIG = {
  default: 'usd',
  supported: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
  symbol: {
    usd: '$',
    eur: '€',
    gbp: '£',
    cad: 'C$',
    aud: 'A$',
    jpy: '¥'
  }
};

// Webhook events we handle
export const WEBHOOK_EVENTS = {
  // Payment events
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  
  // Subscription events
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  
  // Invoice events
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  
  // Customer events
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted'
};

export default {
  STRIPE_CONFIG,
  stripePromise,
  SUBSCRIPTION_PLANS,
  ONE_TIME_PURCHASES,
  PAYMENT_METHODS,
  CURRENCY_CONFIG,
  WEBHOOK_EVENTS
};
