# SOS and Emergency Call Management API

## SOS Ticket Endpoints

### Create SOS Ticket (Authenticated User)

`POST /sos/ticket`

```json
{
  "userId": "user-uuid",
  "emergencyType": "medical",
  "description": "Person collapsed on street",
  "latitude": 40.7128,
  "longitude": -74.006,
  "address": "123 Main St, City, State",
  "requiresEmergencyCall": true
}
```

### Create Guest SOS Ticket

`POST /sos/guest/ticket`

```json
{
  "guestPhone": "+1-555-0123",
  "guestName": "John Doe",
  "emergencyType": "accident",
  "description": "Car accident at intersection",
  "latitude": 40.7128,
  "longitude": -74.006,
  "address": "Main St & 1st Ave",
  "requiresEmergencyCall": true
}
```

### Get All SOS Tickets (with filtering)

`GET /sos/tickets?status=pending&emergencyType=medical&userId=uuid`

### Get Guest Tickets by Phone

`GET /sos/tickets/guest/+1-555-0123`

### Get SOS Ticket by ID

`GET /sos/tickets/:id`

### Update SOS Ticket Status

`PATCH /sos/tickets/:id`

```json
{
  "status": "in_progress",
  "assignedTo": "responder-id",
  "resolutionNotes": "Emergency services dispatched"
}
```

### Trigger Emergency Call

`POST /sos/emergency-call/:ticketId`

### Get Emergency Contacts

`GET /sos/emergency-contacts`

## Emergency Types

- `medical` - Medical emergencies
- `fire` - Fire emergencies
- `violence` - Violence or assault
- `accident` - Traffic or other accidents
- `theft` - Theft or robbery
- `harassment` - Harassment situations
- `mental_health` - Mental health crises
- `other` - Other emergency situations

## Ticket Status Values

- `pending` - Newly created ticket
- `in_progress` - Being handled by responder
- `emergency_called` - Emergency services contacted
- `resolved` - Issue resolved
- `cancelled` - Ticket cancelled

## Priority Levels

- `high` - Medical, fire, violence, accident
- `medium` - Theft, harassment, mental health
- `low` - Other situations

## Guest User Flow

1. Guest creates SOS ticket with phone number and name
2. System tracks ticket without user authentication
3. Guest can retrieve tickets using phone number
4. Emergency calls can be made on behalf of guest
5. Status updates tracked for guest tickets
