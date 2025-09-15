import { apiService } from './apiService';
import { loggerService } from './loggerService';

class StripeService {
  // Customer Management
  async createCustomer(customerData) {
    try {
      const response = await apiService.client.post('/stripe/create-customer', customerData);
      return response.data;
    } catch (error) {
      loggerService.error('Error creating customer:', error);
      throw error;
    }
  }

  async getCustomer(customerId) {
    try {
      const response = await apiService.client.get(`/stripe/customer/${customerId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error getting customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId, updates) {
    try {
      const response = await apiService.client.put(`/stripe/customer/${customerId}`, updates);
      return response.data;
    } catch (error) {
      loggerService.error('Error updating customer:', error);
      throw error;
    }
  }

  // Payment Intents
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await apiService.client.post('/stripe/create-payment-intent', {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const response = await apiService.client.post('/stripe/confirm-payment-intent', {
        paymentIntentId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  // Subscriptions
  async createSubscription(customerId, priceId, paymentMethodId) {
    try {
      const response = await apiService.client.post('/stripe/create-subscription', {
        customerId,
        priceId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error creating subscription:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId) {
    try {
      const response = await apiService.client.get(`/stripe/subscription/${subscriptionId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error getting subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await apiService.client.put(`/stripe/subscription/${subscriptionId}`, updates);
      return response.data;
    } catch (error) {
      loggerService.error('Error updating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const response = await apiService.client.post('/stripe/cancel-subscription', {
        subscriptionId,
        immediately
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Checkout Sessions
  async createCheckoutSession(priceId, customerId, successUrl, cancelUrl) {
    try {
      const response = await apiService.client.post('/stripe/create-checkout-session', {
        priceId,
        customerId,
        successUrl,
        cancelUrl
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async getCheckoutSession(sessionId) {
    try {
      const response = await apiService.client.get(`/stripe/checkout-session/${sessionId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error getting checkout session:', error);
      throw error;
    }
  }

  // Customer Portal
  async createPortalSession(customerId, returnUrl) {
    try {
      const response = await apiService.client.post('/stripe/create-portal-session', {
        customerId,
        returnUrl
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error creating portal session:', error);
      throw error;
    }
  }

  // Payment Methods
  async createPaymentMethod(type, card) {
    try {
      const response = await apiService.client.post('/stripe/create-payment-method', {
        type,
        card
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error creating payment method:', error);
      throw error;
    }
  }

  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const response = await apiService.client.post('/stripe/attach-payment-method', {
        paymentMethodId,
        customerId
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error attaching payment method:', error);
      throw error;
    }
  }

  async detachPaymentMethod(paymentMethodId) {
    try {
      const response = await apiService.client.post('/stripe/detach-payment-method', {
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error detaching payment method:', error);
      throw error;
    }
  }

  async getPaymentMethods(customerId) {
    try {
      const response = await apiService.client.get(`/stripe/payment-methods/${customerId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Invoices
  async getInvoices(customerId, limit = 10) {
    try {
      const response = await apiService.client.get(`/stripe/invoices/${customerId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error getting invoices:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId) {
    try {
      const response = await apiService.client.get(`/stripe/invoice/${invoiceId}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error getting invoice:', error);
      throw error;
    }
  }

  // Usage Records (for metered billing)
  async createUsageRecord(subscriptionItemId, quantity, timestamp) {
    try {
      const response = await apiService.client.post('/stripe/create-usage-record', {
        subscriptionItemId,
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000)
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error creating usage record:', error);
      throw error;
    }
  }

  // Coupons and Promotions
  async validateCoupon(couponCode) {
    try {
      const response = await apiService.client.post('/stripe/validate-coupon', {
        couponCode
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error validating coupon:', error);
      throw error;
    }
  }

  // Webhooks
  async handleWebhook(payload, signature, endpointSecret) {
    try {
      const response = await apiService.client.post('/stripe/webhook', {
        payload,
        signature,
        endpointSecret
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Utility methods
  formatAmount(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  getSubscriptionStatus(subscription) {
    if (!subscription) return 'inactive';
    
    switch (subscription.status) {
      case 'active':
        return 'active';
      case 'canceled':
        return 'canceled';
      case 'incomplete':
        return 'incomplete';
      case 'incomplete_expired':
        return 'expired';
      case 'past_due':
        return 'past_due';
      case 'unpaid':
        return 'unpaid';
      default:
        return 'unknown';
    }
  }

  isSubscriptionActive(subscription) {
    const status = this.getSubscriptionStatus(subscription);
    return status === 'active';
  }

  getDaysUntilRenewal(subscription) {
    if (!subscription || !subscription.current_period_end) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const renewalTime = subscription.current_period_end;
    const daysLeft = Math.ceil((renewalTime - now) / (24 * 60 * 60));
    
    return Math.max(0, daysLeft);
  }

  // Get current subscription for the authenticated user
  async getCurrentSubscription() {
    try {
      const response = await apiService.client.get('/stripe/subscription');
      return response.data;
    } catch (error) {
      loggerService.error('Error fetching subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Get usage statistics for the current billing period
  async getUsage() {
    try {
      const response = await apiService.client.get('/stripe/usage');
      return response.data;
    } catch (error) {
      loggerService.error('Error fetching usage:', error);
      return { success: false, error: error.message };
    }
  }

  // Get billing history
  async getBillingHistory(limit = 10) {
    try {
      const response = await apiService.client.get(`/stripe/billing-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      loggerService.error('Error fetching billing history:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payment methods for current user
  async getCurrentPaymentMethods() {
    try {
      const response = await apiService.client.get('/stripe/payment-methods');
      return response.data;
    } catch (error) {
      loggerService.error('Error fetching payment methods:', error);
      return { success: false, error: error.message };
    }
  }

  // Update payment method
  async updatePaymentMethod(paymentMethodId) {
    try {
      const response = await apiService.client.put('/stripe/payment-method', { 
        paymentMethodId 
      });
      return response.data;
    } catch (error) {
      loggerService.error('Error updating payment method:', error);
      return { success: false, error: error.message };
    }
  }

  // Get subscription analytics
  async getSubscriptionAnalytics() {
    try {
      const response = await apiService.client.get('/stripe/analytics');
      return response.data;
    } catch (error) {
      loggerService.error('Error fetching subscription analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

export const stripeService = new StripeService();
