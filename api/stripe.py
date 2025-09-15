from flask import Flask, request, jsonify
from flask_cors import CORS
import stripe
import os
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

logger.info("Stripe API initialized")

# Error handling
def handle_stripe_error(e):
    """Handle Stripe errors and return appropriate response"""
    if hasattr(e, 'user_message'):
        return jsonify({'error': e.user_message}), 400
    elif hasattr(e, 'code'):
        return jsonify({'error': f'Stripe error: {e.code}'}), 400
    else:
        return jsonify({'error': 'Payment processing error'}), 500

# Customer Management
@app.route('/create-customer', methods=['POST'])
def create_customer():
    """Create a new Stripe customer"""
    try:
        data = request.get_json()
        
        customer = stripe.Customer.create(
            email=data.get('email'),
            name=data.get('name'),
            metadata={
                'user_id': data.get('user_id'),
                'created_at': datetime.now().isoformat()
            }
        )
        
        return jsonify({
            'success': True,
            'customer': {
                'id': customer.id,
                'email': customer.email,
                'name': customer.name,
                'created': customer.created
            }
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating customer: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error creating customer: {e}")
        return jsonify({'error': 'Failed to create customer'}), 500

@app.route('/customer/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get customer details"""
    try:
        customer = stripe.Customer.retrieve(customer_id)
        
        return jsonify({
            'success': True,
            'customer': {
                'id': customer.id,
                'email': customer.email,
                'name': customer.name,
                'created': customer.created,
                'subscriptions': customer.subscriptions.data if hasattr(customer, 'subscriptions') else []
            }
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error getting customer: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error getting customer: {e}")
        return jsonify({'error': 'Failed to get customer'}), 500

@app.route('/customer/<customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """Update customer details"""
    try:
        data = request.get_json()
        
        customer = stripe.Customer.modify(
            customer_id,
            email=data.get('email'),
            name=data.get('name'),
            metadata=data.get('metadata', {})
        )
        
        return jsonify({
            'success': True,
            'customer': {
                'id': customer.id,
                'email': customer.email,
                'name': customer.name
            }
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error updating customer: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error updating customer: {e}")
        return jsonify({'error': 'Failed to update customer'}), 500

# Payment Intents
@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Create a payment intent for one-time payments"""
    try:
        data = request.get_json()
        
        payment_intent = stripe.PaymentIntent.create(
            amount=data['amount'],
            currency=data.get('currency', 'usd'),
            metadata=data.get('metadata', {}),
            automatic_payment_methods={
                'enabled': True,
            }
        )
        
        return jsonify({
            'success': True,
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating payment intent: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error creating payment intent: {e}")
        return jsonify({'error': 'Failed to create payment intent'}), 500

@app.route('/confirm-payment-intent', methods=['POST'])
def confirm_payment_intent():
    """Confirm a payment intent"""
    try:
        data = request.get_json()
        
        payment_intent = stripe.PaymentIntent.confirm(
            data['payment_intent_id'],
            payment_method=data.get('payment_method_id')
        )
        
        return jsonify({
            'success': True,
            'status': payment_intent.status,
            'payment_intent_id': payment_intent.id
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error confirming payment intent: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error confirming payment intent: {e}")
        return jsonify({'error': 'Failed to confirm payment intent'}), 500

# Subscriptions
@app.route('/create-subscription', methods=['POST'])
def create_subscription():
    """Create a new subscription"""
    try:
        data = request.get_json()
        
        subscription = stripe.Subscription.create(
            customer=data['customer_id'],
            items=[{
                'price': data['price_id']
            }],
            payment_behavior='default_incomplete',
            payment_settings={'save_default_payment_method': 'on_subscription'},
            expand=['latest_invoice.payment_intent']
        )
        
        return jsonify({
            'success': True,
            'subscription_id': subscription.id,
            'client_secret': subscription.latest_invoice.payment_intent.client_secret,
            'status': subscription.status
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating subscription: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        return jsonify({'error': 'Failed to create subscription'}), 500

@app.route('/subscription/<subscription_id>', methods=['GET'])
def get_subscription(subscription_id):
    """Get subscription details"""
    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        
        return jsonify({
            'success': True,
            'subscription': {
                'id': subscription.id,
                'status': subscription.status,
                'current_period_start': subscription.current_period_start,
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'items': subscription.items.data
            }
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error getting subscription: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error getting subscription: {e}")
        return jsonify({'error': 'Failed to get subscription'}), 500

@app.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    """Cancel a subscription"""
    try:
        data = request.get_json()
        
        if data.get('immediately'):
            subscription = stripe.Subscription.delete(data['subscription_id'])
        else:
            subscription = stripe.Subscription.modify(
                data['subscription_id'],
                cancel_at_period_end=True
            )
        
        return jsonify({
            'success': True,
            'subscription_id': subscription.id,
            'status': subscription.status
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error canceling subscription: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error canceling subscription: {e}")
        return jsonify({'error': 'Failed to cancel subscription'}), 500

# Checkout Sessions
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create a Stripe Checkout session"""
    try:
        data = request.get_json()
        
        session = stripe.checkout.Session.create(
            customer=data.get('customer_id'),
            payment_method_types=['card'],
            line_items=[{
                'price': data['price_id'],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=data['success_url'],
            cancel_url=data['cancel_url'],
            metadata=data.get('metadata', {})
        )
        
        return jsonify({
            'success': True,
            'session_id': session.id,
            'url': session.url
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        return jsonify({'error': 'Failed to create checkout session'}), 500

@app.route('/checkout-session/<session_id>', methods=['GET'])
def get_checkout_session(session_id):
    """Get checkout session details"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        return jsonify({
            'success': True,
            'session': {
                'id': session.id,
                'status': session.payment_status,
                'customer_id': session.customer,
                'subscription_id': session.subscription
            }
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error getting checkout session: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error getting checkout session: {e}")
        return jsonify({'error': 'Failed to get checkout session'}), 500

# Customer Portal
@app.route('/create-portal-session', methods=['POST'])
def create_portal_session():
    """Create a customer portal session"""
    try:
        data = request.get_json()
        
        session = stripe.billing_portal.Session.create(
            customer=data['customer_id'],
            return_url=data['return_url']
        )
        
        return jsonify({
            'success': True,
            'url': session.url
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating portal session: {e}")
        return handle_stripe_error(e)
    except Exception as e:
        logger.error(f"Error creating portal session: {e}")
        return jsonify({'error': 'Failed to create portal session'}), 500

# Webhooks
@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhooks"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'customer.subscription.created':
            handle_subscription_created(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            handle_subscription_deleted(event['data']['object'])
        elif event['type'] == 'invoice.payment_succeeded':
            handle_invoice_payment_succeeded(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            handle_invoice_payment_failed(event['data']['object'])
        else:
            logger.info(f"Unhandled event type: {event['type']}")
        
        return jsonify({'success': True})
        
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return jsonify({'error': 'Webhook error'}), 500

# Webhook handlers
def handle_payment_succeeded(payment_intent):
    """Handle successful payment"""
    logger.info(f"Payment succeeded: {payment_intent['id']}")
    # Update user's subscription status in your database
    # Send confirmation email, etc.

def handle_subscription_created(subscription):
    """Handle subscription creation"""
    logger.info(f"Subscription created: {subscription['id']}")
    # Update user's subscription status in your database

def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    logger.info(f"Subscription updated: {subscription['id']}")
    # Update user's subscription status in your database

def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    logger.info(f"Subscription deleted: {subscription['id']}")
    # Update user's subscription status in your database

def handle_invoice_payment_succeeded(invoice):
    """Handle successful invoice payment"""
    logger.info(f"Invoice payment succeeded: {invoice['id']}")
    # Update user's subscription status in your database

def handle_invoice_payment_failed(invoice):
    """Handle failed invoice payment"""
    logger.info(f"Invoice payment failed: {invoice['id']}")
    # Handle failed payment, send notification, etc.

# Health check
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'stripe-api',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
