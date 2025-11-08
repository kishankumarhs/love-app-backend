# Donations and Payment Integration API

## Overview
Complete donations and payment processing system using Stripe integration with support for payment methods, donation history, refunds, and webhook handling.

## Features
- Stripe payment processing
- Payment method management
- Donation history tracking
- Refund workflow
- Webhook event handling
- Provider attribution
- Payment error handling

## API Endpoints

### Payment Intent
```http
POST /donations/payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "campaignId": "uuid",
  "providerId": "uuid" // optional
}
```

### Confirm Donation
```http
POST /donations/confirm/:donationId
Authorization: Bearer <token>
```

### Create Refund
```http
POST /donations/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "donationId": "uuid",
  "amount": 25.00, // optional, full refund if not specified
  "reason": "requested_by_customer"
}
```

### Save Payment Method
```http
POST /donations/payment-methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "stripePaymentMethodId": "pm_xxx",
  "setAsDefault": true
}
```

### Get Payment Methods
```http
GET /donations/payment-methods
Authorization: Bearer <token>
```

### Get Donation History
```http
GET /donations/history?campaignId=uuid
Authorization: Bearer <token>
```

### Get Donation Details
```http
GET /donations/:donationId
Authorization: Bearer <token>
```

### Stripe Webhook
```http
POST /donations/webhook
Stripe-Signature: <signature>
Content-Type: application/json
```

## Database Schema

### Donations Table
- `id` (UUID, Primary Key)
- `amount` (Decimal)
- `status` (Enum: pending, completed, failed, refunded)
- `stripe_payment_intent_id` (String)
- `stripe_charge_id` (String)
- `user_id` (UUID, Foreign Key)
- `campaign_id` (UUID, Foreign Key)
- `provider_id` (UUID, Foreign Key, Optional)
- `failure_reason` (Text)
- `metadata` (JSONB)
- `created_at`, `updated_at`, `completed_at`, `refunded_at`

### Payment Methods Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `stripe_payment_method_id` (String)
- `type` (String)
- `last_four` (String)
- `brand` (String)
- `exp_month`, `exp_year` (Integer)
- `is_default` (Boolean)
- `created_at`, `updated_at`

### Donation History Table
- `id` (UUID, Primary Key)
- `donation_id` (UUID, Foreign Key)
- `event_type` (Enum: created, processing, completed, failed, refunded, disputed)
- `description` (Text)
- `metadata` (JSONB)
- `created_at`

### Refunds Table
- `id` (UUID, Primary Key)
- `donation_id` (UUID, Foreign Key)
- `stripe_refund_id` (String)
- `amount` (Decimal)
- `reason` (String)
- `status` (Enum: pending, succeeded, failed, canceled)
- `created_at`, `processed_at`

## Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CURRENCY=usd
```

## Webhook Events Handled
- `payment_intent.succeeded` - Mark donation as completed
- `payment_intent.payment_failed` - Mark donation as failed
- `charge.dispute.created` - Log dispute in donation history

## Error Handling
- Payment method validation
- Insufficient funds handling
- Network error retry logic
- Webhook signature verification
- Refund validation and processing

## Security Features
- Webhook signature verification
- Payment method tokenization
- PCI compliance through Stripe
- Secure payment intent creation
- User authorization for all operations

## Usage Examples

### Frontend Integration
```javascript
// Create payment intent
const response = await fetch('/donations/payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50.00,
    campaignId: 'campaign-uuid',
    providerId: 'provider-uuid'
  })
});

const { clientSecret, donationId } = await response.json();

// Use Stripe.js to confirm payment
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name'
    }
  }
});

if (!error) {
  // Confirm donation on backend
  await fetch(`/donations/confirm/${donationId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

## Testing
- Use Stripe test cards for development
- Test webhook endpoints with Stripe CLI
- Verify refund processing
- Test payment method saving and retrieval