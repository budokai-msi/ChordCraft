/**
 * Subscription Service
 * Handles PRO subscription features and billing
 */

const STRIPE_API_URL = import.meta.env.MODE === 'production' 
  ? 'https://chordcraft.studio/api/stripe' 
  : 'http://localhost:5001';

class SubscriptionService {
  constructor() {
    this.isPro = false;
    this.subscription = null;
    this.customer = null;
  }

  /**
   * Check if user has PRO subscription
   * @returns {boolean} True if user has active PRO subscription
   */
  isProUser() {
    return this.isPro;
  }

  /**
   * Get subscription status
   * @returns {Object} Subscription details
   */
  getSubscriptionStatus() {
    return {
      isPro: this.isPro,
      subscription: this.subscription,
      customer: this.customer
    };
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer information
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.statusText}`);
      }

      const result = await response.json();
      this.customer = result.customer;
      return result;
    } catch (error) {
      console.error('Customer creation error:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Create a checkout session for PRO subscription
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} Checkout session
   */
  async createCheckoutSession(customerId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          price_id: import.meta.env.VITE_STRIPE_PRO_PRICE_ID, // $19/month price ID
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancel`,
          metadata: {
            plan: 'pro',
            amount: '19.00'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create checkout session: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Checkout session creation error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * Get customer details
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} Customer details
   */
  async getCustomer(customerId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/customer/${customerId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to get customer: ${response.statusText}`);
      }

      const result = await response.json();
      this.customer = result.customer;
      return result;
    } catch (error) {
      console.error('Get customer error:', error);
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   * @param {string} subscriptionId - Stripe subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/subscription/${subscriptionId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to get subscription: ${response.statusText}`);
      }

      const result = await response.json();
      this.subscription = result.subscription;
      this.isPro = result.subscription.status === 'active';
      return result;
    } catch (error) {
      console.error('Get subscription error:', error);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Stripe subscription ID
   * @param {boolean} immediately - Cancel immediately or at period end
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          immediately
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${response.statusText}`);
      }

      const result = await response.json();
      this.isPro = false;
      this.subscription = null;
      return result;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Create customer portal session
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Object>} Portal session
   */
  async createPortalSession(customerId) {
    try {
      const response = await fetch(`${STRIPE_API_URL}/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: window.location.origin
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create portal session: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Portal session creation error:', error);
      throw new Error(`Failed to create portal session: ${error.message}`);
    }
  }

  /**
   * Check PRO feature access
   * @param {string} feature - Feature name to check
   * @returns {boolean} True if user has access to feature
   */
  hasFeatureAccess(feature) {
    const proFeatures = [
      'ai_companion',
      'advanced_analysis',
      'unlimited_exports',
      'priority_support',
      'collaboration',
      'cloud_storage'
    ];

    return this.isPro && proFeatures.includes(feature);
  }

  /**
   * Get PRO feature limits
   * @returns {Object} Feature limits based on subscription
   */
  getFeatureLimits() {
    if (this.isPro) {
      return {
        maxTracks: -1, // Unlimited
        maxExports: -1, // Unlimited
        maxStorage: -1, // Unlimited
        aiRequests: -1, // Unlimited
        collaboration: true,
        prioritySupport: true
      };
    } else {
      return {
        maxTracks: 3,
        maxExports: 5,
        maxStorage: 100, // MB
        aiRequests: 10,
        collaboration: false,
        prioritySupport: false
      };
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;
