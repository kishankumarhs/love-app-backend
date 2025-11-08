# WebSocket Real-Time API Documentation

## Overview
Real-time WebSocket API for instant notifications, SOS alerts, and live updates using Socket.IO with JWT authentication.

## Connection Setup

### Server Configuration
```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/notifications',
})
```

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Authentication
All WebSocket connections require JWT authentication via the `auth.token` parameter.

```javascript
// Connection with authentication
const socket = io('/notifications', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

// Handle authentication errors
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication failed') {
    // Redirect to login or refresh token
  }
});
```

## Events

### Connection Events

#### `connected`
Emitted when client successfully connects and authenticates.

```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // { userId: 'uuid', socketId: 'socket-id' }
});
```

#### `disconnect`
Emitted when client disconnects.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### Room Management

#### `join_room`
Join a specific room for targeted notifications.

```javascript
// Client sends
socket.emit('join_room', { room: 'campaign_123' });

// Available room types:
// - user_{userId} (automatic)
// - campaign_{campaignId}
// - provider_{providerId}
// - volunteer_{volunteerId}
// - sos_alerts (emergency broadcasts)
```

#### `leave_room`
Leave a specific room.

```javascript
socket.emit('leave_room', { room: 'campaign_123' });
```

### Notification Events

#### `sos_alert`
Emergency SOS alert broadcast to all connected users.

```javascript
socket.on('sos_alert', (alert) => {
  console.log('Emergency Alert:', alert);
  /*
  {
    location: "Downtown Main St",
    emergencyType: "Medical Emergency",
    description: "Person collapsed on sidewalk",
    timestamp: "2024-01-15T10:30:00Z"
  }
  */
  
  // Show emergency notification UI
  showEmergencyAlert(alert);
});
```

#### `notification_update`
Personal notification sent to specific user.

```javascript
socket.on('notification_update', (notification) => {
  console.log('New notification:', notification);
  /*
  {
    id: "uuid",
    title: "Donation Received",
    message: "You received a $25 donation",
    type: "push",
    priority: "medium",
    category: "donation",
    createdAt: "2024-01-15T10:30:00Z"
  }
  */
  
  // Update notification badge/list
  addNotificationToUI(notification);
});
```

#### `campaign_update`
Campaign-specific updates sent to room subscribers.

```javascript
socket.on('campaign_update', (update) => {
  console.log('Campaign update:', update);
  /*
  {
    campaignId: "uuid",
    type: "donation_received",
    amount: 25.00,
    newTotal: 1250.00,
    donorName: "Anonymous",
    timestamp: "2024-01-15T10:30:00Z"
  }
  */
  
  // Update campaign progress
  updateCampaignProgress(update);
});
```

#### `volunteer_assignment`
Volunteer assignment notifications.

```javascript
socket.on('volunteer_assignment', (assignment) => {
  console.log('New assignment:', assignment);
  /*
  {
    id: "uuid",
    type: "emergency_response",
    location: "123 Main St",
    description: "Medical assistance needed",
    priority: "high",
    scheduledAt: "2024-01-15T11:00:00Z"
  }
  */
});
```

#### `provider_update`
Provider-specific updates and alerts.

```javascript
socket.on('provider_update', (update) => {
  console.log('Provider update:', update);
  /*
  {
    providerId: "uuid",
    type: "new_request",
    requestId: "uuid",
    urgency: "high",
    location: "Downtown area"
  }
  */
});
```

## Client Implementation Examples

### React Hook for WebSocket
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('/notifications', {
      auth: { token }
    });

    newSocket.on('connected', (data) => {
      setConnected(true);
      console.log('WebSocket connected:', data);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('notification_update', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    newSocket.on('sos_alert', (alert) => {
      // Show emergency alert
      showEmergencyNotification(alert);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinRoom = (room) => {
    if (socket) {
      socket.emit('join_room', { room });
    }
  };

  const leaveRoom = (room) => {
    if (socket) {
      socket.emit('leave_room', { room });
    }
  };

  return {
    socket,
    connected,
    notifications,
    joinRoom,
    leaveRoom
  };
};
```

### Vue.js Composition API
```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';

export function useWebSocket(token) {
  const socket = ref(null);
  const connected = ref(false);
  const notifications = ref([]);

  onMounted(() => {
    if (!token.value) return;

    socket.value = io('/notifications', {
      auth: { token: token.value }
    });

    socket.value.on('connected', () => {
      connected.value = true;
    });

    socket.value.on('notification_update', (notification) => {
      notifications.value.unshift(notification);
    });

    socket.value.on('sos_alert', (alert) => {
      // Handle emergency alert
      handleEmergencyAlert(alert);
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  return {
    socket,
    connected,
    notifications
  };
}
```

### Angular Service
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private notificationsSubject = new BehaviorSubject<any[]>([]);

  public connected$ = this.connectedSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  connect(token: string) {
    this.socket = io('/notifications', {
      auth: { token }
    });

    this.socket.on('connected', () => {
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    this.socket.on('notification_update', (notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
    });

    this.socket.on('sos_alert', (alert) => {
      this.handleEmergencyAlert(alert);
    });
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join_room', { room });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private handleEmergencyAlert(alert: any) {
    // Show emergency notification
  }
}
```

## Room Types and Usage

### User Rooms
Automatically joined when connecting. Format: `user_{userId}`
```javascript
// Automatic - no need to join manually
// Receives personal notifications
```

### Campaign Rooms
For campaign-specific updates. Format: `campaign_{campaignId}`
```javascript
// Join campaign room to receive updates
socket.emit('join_room', { room: 'campaign_123' });

// Receive donation updates, goal changes, etc.
socket.on('campaign_update', (update) => {
  if (update.type === 'donation_received') {
    updateProgressBar(update.newTotal);
  }
});
```

### Provider Rooms
For service provider notifications. Format: `provider_{providerId}`
```javascript
// Join provider room
socket.emit('join_room', { room: 'provider_456' });

// Receive new requests, assignments
socket.on('provider_update', (update) => {
  if (update.type === 'new_request') {
    showNewRequestNotification(update);
  }
});
```

### Emergency Broadcast
Global SOS alerts sent to all connected users
```javascript
// No need to join - automatically received
socket.on('sos_alert', (alert) => {
  // High priority emergency notification
  showEmergencyModal(alert);
});
```

## Error Handling

### Connection Errors
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  
  if (error.message === 'Authentication failed') {
    // Token expired or invalid
    redirectToLogin();
  } else {
    // Network or server error
    showConnectionError();
  }
});
```

### Reconnection Logic
```javascript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server disconnected - manual reconnection needed
    socket.connect();
  }
  // Otherwise, automatic reconnection will occur
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  hideConnectionError();
});
```

## Security Considerations

### JWT Token Validation
- Tokens are validated on connection
- Invalid tokens result in immediate disconnection
- Token expiration requires reconnection with new token

### Rate Limiting
- Connection attempts are rate limited
- Message sending is throttled per user
- Room joining is limited to prevent abuse

### Data Sanitization
- All incoming data is validated
- XSS protection for message content
- Room names are validated against patterns

## Performance Optimization

### Connection Management
```javascript
// Efficient connection handling
const connectWithRetry = (token, maxRetries = 3) => {
  let retries = 0;
  
  const connect = () => {
    const socket = io('/notifications', {
      auth: { token },
      timeout: 5000,
      forceNew: true
    });
    
    socket.on('connect_error', () => {
      if (retries < maxRetries) {
        retries++;
        setTimeout(connect, 1000 * retries);
      }
    });
    
    return socket;
  };
  
  return connect();
};
```

### Memory Management
```javascript
// Clean up listeners to prevent memory leaks
const cleanup = () => {
  socket.off('notification_update');
  socket.off('sos_alert');
  socket.off('campaign_update');
  socket.disconnect();
};

// Call cleanup on component unmount
useEffect(() => {
  return cleanup;
}, []);
```

## Testing WebSocket Connections

### Unit Testing
```javascript
// Mock socket.io for testing
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  }));
});
```

### Integration Testing
```javascript
// Test real WebSocket connection
const testConnection = async () => {
  const socket = io('/notifications', {
    auth: { token: 'test-token' }
  });
  
  return new Promise((resolve) => {
    socket.on('connected', (data) => {
      expect(data.userId).toBeDefined();
      socket.disconnect();
      resolve(true);
    });
  });
};
```

## Monitoring and Analytics

### Connection Metrics
- Active connection count
- Connection duration
- Reconnection frequency
- Message delivery rates

### Event Tracking
- SOS alert response times
- Notification delivery success rates
- Room subscription patterns
- User engagement metrics