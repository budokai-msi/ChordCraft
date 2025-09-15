# Stripe Integration Setup Guide

## 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account verification process

2. **Get Your API Keys**
   - Go to the Stripe Dashboard → Developers → API Keys
   - Copy your **Publishable key** (starts with `pk_test_` for test mode)
   - Copy your **Secret key** (starts with `sk_test_` for test mode)

## 2. Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://wgofqkisiqkygpnliuwl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnb2Zxa2lzaXFreWdwbmxpdXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODE4MzEsImV4cCI6MjA3MzQ1NzgzMX0.DcqJ7XNAkMiOT-3Vnlmvua84wNqahgfd3JQ9wpTW-yg

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_PUBLISHABLE_KEY_PROD=pk_live_your_production_stripe_publishable_key_here

# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_PRODUCTION_API_URL=https://chord-craft-l32h.vercel.app

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_STRIPE_PAYMENTS=true
```

For the backend, create a `.env` file in the root directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# API Configuration
API_BASE_URL=http://localhost:5000
```

## 3. Database Setup

1. **Run the SQL Schema**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/supabase-setup.sql`
   - Execute the SQL to create all necessary tables

2. **Verify Tables Created**
   - Check that the following tables exist:
     - `user_profiles`
     - `chordcraft_projects`
     - `project_tracks`
     - `project_notes`
     - `stripe_payments`
     - `stripe_subscriptions`
     - `usage_tracking`

## 4. Stripe Products and Prices Setup

1. **Create Products in Stripe Dashboard**
   - Go to Products → Add Product
   - Create the following products:

   **Pro Plan**
   - Name: "ChordCraft Pro"
   - Description: "Professional music creation tools"
   - Pricing: $19.99/month (recurring)

   **Studio Plan**
   - Name: "ChordCraft Studio"
   - Description: "Advanced collaboration and mixing tools"
   - Pricing: $49.99/month (recurring)

   **Enterprise Plan**
   - Name: "ChordCraft Enterprise"
   - Description: "Full-featured enterprise solution"
   - Pricing: $199.99/month (recurring)

2. **Get Price IDs**
   - After creating products, copy the Price IDs (starts with `price_`)
   - Update the `stripePriceId` values in `frontend/src/config/stripe.js`

## 5. Webhook Setup

1. **Create Webhook Endpoint**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Get Webhook Secret**
   - Copy the webhook signing secret (starts with `whsec_`)
   - Add it to your environment variables

## 6. Testing

1. **Test Mode**
   - Use Stripe test mode for development
   - Use test card numbers:
     - Success: `4242 4242 4242 4242`
     - Decline: `4000 0000 0000 0002`
     - 3D Secure: `4000 0025 0000 3155`

2. **Test the Integration**
   - Start the development server
   - Go to Settings → Billing
   - Try subscribing to a plan
   - Check Stripe Dashboard for successful payments

## 7. Production Deployment

1. **Switch to Live Mode**
   - Update environment variables with live keys
   - Update webhook endpoints to production URLs
   - Test with real payment methods

2. **Vercel Configuration**
   - Add environment variables in Vercel dashboard
   - Deploy the application
   - Update webhook URLs to point to Vercel

## 8. Security Considerations

1. **Never expose secret keys in frontend code**
2. **Use HTTPS in production**
3. **Validate webhook signatures**
4. **Implement proper error handling**
5. **Use Stripe's built-in security features**

## 9. Monitoring and Analytics

1. **Stripe Dashboard**
   - Monitor payments, subscriptions, and customers
   - Set up alerts for failed payments
   - Track revenue and growth

2. **Application Analytics**
   - Track subscription conversions
   - Monitor feature usage by plan
   - Analyze churn and retention

## 10. Support and Documentation

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Components](https://stripe.com/docs/stripe-js/react)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Stripe API endpoints are properly configured
   - Check that frontend and backend are on same domain or CORS is configured

2. **Webhook Failures**
   - Verify webhook URL is accessible
   - Check webhook secret is correct
   - Ensure webhook endpoint returns 200 status

3. **Payment Failures**
   - Check card details are correct
   - Verify Stripe keys are valid
   - Check for sufficient funds

4. **Database Errors**
   - Ensure Supabase tables are created
   - Check RLS policies are correct
   - Verify user authentication

### Getting Help

- Check the Stripe Dashboard for error logs
- Review Supabase logs for database issues
- Check browser console for frontend errors
- Contact support if issues persist
