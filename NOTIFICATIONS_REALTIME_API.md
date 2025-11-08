# Notifications and Real-Time Updates API

## Overview
Complete notification system with email/SMS template integration and real-time WebSocket updates for SOS alerts and notifications.

## Features
- Email and SMS template management with Handlebars
- Real-time WebSocket notifications for SOS and updates
- Twilio SMS integration
- Nodemailer email integration
- Template-based notification rendering
- WebSocket connection management
- Real-time status updates

## API Endpoints

### Notifications
```http
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Notification",
  "message": "This is a test message",
  "type": "email",
  "userId": "uuid",
  "priority": "medium",
  "category": "general"
}
```

### SOS Alert
```http
POST /notifications/sos-alert
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["uuid1", "uuid2"],
  "location": "Downtown Main St",
  "emergencyType": "Medical Emergency",
  "description": "Person collapsed on sidewalk"
}
```

### Create Template
```http
POST /notifications/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "welcome_email",
  "type": "email",
  "category": "general",
  "subject": "Welcome {{firstName}}!",
  "templateContent": "<h1>Welcome {{firstName}}!</h1><p>Thank you for joining {{appName}}.</p>",
  "variables": ["firstName", "appName"]
}
```

### WebSocket Status
```http
GET /notifications/websocket/status
Authorization: Bearer <token>
```

### User Notifications
```http
GET /notifications/user/:userId
Authorization: Bearer <token>
```

### Notification Preferences
```http
GET /notifications/preferences/:userId
Authorization: Bearer <token>

PUT /notifications/preferences/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true
}
```

## WebSocket Connection

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

### Events
```javascript
// Join specific room
socket.emit('join_room', { room: 'campaign_123' });

// Listen for SOS alerts
socket.on('sos_alert', (data) => {
  console.log('SOS Alert:', data);
  // Show emergency notification
});

// Listen for notifications
socket.on('notification_update', (notification) => {
  console.log('New notification:', notification);
  // Update UI with new notification
});

// Listen for campaign updates
socket.on('campaign_update', (data) => {
  console.log('Campaign update:', data);
  // Update campaign display
});
```

## Database Schema

### Notifications Table (Updated)
- `id` (UUID, Primary Key)
- `title` (String)
- `message` (Text)
- `type` (Enum: email, sms, push)
- `status` (Enum: pending, sent, failed)
- `priority` (Enum: low, medium, high, urgent)
- `category` (Enum: general, sos, campaign, donation, volunteer, system)
- `template_id` (UUID, Foreign Key)
- `template_data` (JSONB)
- `user_id` (UUID, Foreign Key)
- `sent_at`, `failed_reason`, `retry_count`
- `created_at`

### Notification Templates Table
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `type` (Enum: email, sms, push)
- `category` (Enum: general, sos, campaign, donation, volunteer, system)
- `subject` (String)
- `template_content` (Text)
- `variables` (JSONB Array)
- `is_active` (Boolean)
- `created_at`, `updated_at`

### WebSocket Connections Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `socket_id` (String)
- `room` (String)
- `connected_at`, `last_activity`
- `user_agent`, `ip_address`

### Real-Time Events Table
- `id` (UUID, Primary Key)
- `event_type` (Enum: sos_created, sos_updated, notification_sent, campaign_updated, donation_received)
- `entity_type`, `entity_id` (String, UUID)
- `user_id` (UUID, Foreign Key)
- `room` (String)
- `payload` (JSONB)
- `sent_to_users` (UUID Array)
- `created_at`

### Notification Delivery Log Table
- `id` (UUID, Primary Key)
- `notification_id` (UUID, Foreign Key)
- `delivery_method` (Enum: email, sms, push, websocket)
- `recipient` (String)
- `status` (Enum: pending, sent, delivered, failed, bounced)
- `provider_response` (JSONB)
- `error_message` (Text)
- `sent_at`, `delivered_at`, `created_at`

## Template System

### Handlebars Templates
```handlebars
<!-- Email Template -->
<h2>Emergency Alert</h2>
<p>An emergency has been reported at {{location}}.</p>
<p><strong>Type:</strong> {{emergencyType}}</p>
<p><strong>Description:</strong> {{description}}</p>
<p><strong>Time:</strong> {{timestamp}}</p>

<!-- SMS Template -->
EMERGENCY ALERT: {{emergencyType}} reported at {{location}}. Time: {{timestamp}}. Please respond if you can assist.
```

### Default Templates
- `sos_alert_email` - Emergency email notifications
- `sos_alert_sms` - Emergency SMS notifications
- `campaign_donation_email` - Donation confirmation emails
- `volunteer_assignment_email` - Volunteer assignment notifications
- `notification_general_push` - General push notifications

## Environment Configuration
```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@loveapp.com

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Usage Examples

### Send SOS Alert
```javascript
// Backend service
await notificationService.sendSOSAlert(
  ['user1', 'user2', 'user3'],
  'Downtown Main St',
  'Medical Emergency',
  'Person collapsed on sidewalk'
);

// This will:
// 1. Send real-time WebSocket alert to all connected users
// 2. Send email notifications to users with email enabled
// 3. Send SMS notifications to users with SMS enabled
// 4. Create notification records in database
```

### Template Rendering
```javascript
// Render email template
const { subject, content } = await templateService.renderTemplate(
  'campaign_donation_email',
  {
    campaignTitle: 'Help Local Families',
    amount: 50.00,
    transactionId: 'TXN123456',
    date: '2024-01-15'
  }
);

// Send rendered email
await emailService.sendEmail(
  'user@example.com',
  subject,
  content
);
```

### WebSocket Integration
```javascript
// Frontend React component
useEffect(() => {
  const socket = io('/notifications', {
    auth: { token: authToken }
  });

  socket.on('sos_alert', (alert) => {
    // Show emergency notification
    showEmergencyAlert(alert);
  });

  socket.on('notification_update', (notification) => {
    // Add to notification list
    addNotification(notification);
  });

  return () => socket.disconnect();
}, []);
```

### Real-Time Campaign Updates
```javascript
// Join campaign room
socket.emit('join_room', { room: `campaign_${campaignId}` });

// Listen for updates
socket.on('campaign_update', (data) => {
  if (data.type === 'donation_received') {
    updateCampaignProgress(data.newAmount);
  }
});

// Send update from backend
notificationGateway.sendCampaignUpdate(campaignId, {
  type: 'donation_received',
  amount: 25.00,
  newAmount: 1250.00,
  donorName: 'Anonymous'
});
```

## Security Features
- JWT authentication for WebSocket connections
- Role-based access control for admin functions
- Template validation and sanitization
- Rate limiting for notification sending
- Connection cleanup for inactive sockets

## Performance Optimizations
- Connection pooling for database queries
- Template caching for frequently used templates
- Batch notification processing
- WebSocket room management
- Automatic cleanup of old connections

## Testing
- Test WebSocket connection and disconnection
- Verify template rendering with various data
- Test email and SMS delivery
- Validate SOS alert broadcasting
- Test notification preferences handling