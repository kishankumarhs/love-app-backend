# Socket.IO Integration Guide

## Quick Start

### 1. Install Client Library

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

### 2. Basic Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### 3. Listen for Events

```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('sos_alert', (alert) => {
  showEmergencyAlert(alert);
});
```

## Frontend Framework Integration

### React Integration

#### Custom Hook

```javascript
// hooks/useSocket.js
import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('/notifications', {
      auth: { token },
    });

    newSocket.on('connected', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('notification_update', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  const joinRoom = useCallback(
    (room) => {
      socket?.emit('join_room', { room });
    },
    [socket],
  );

  return { socket, connected, notifications, joinRoom };
};
```

#### Component Usage

```javascript
// components/NotificationProvider.jsx
import React, { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketContext = createContext();

export const NotificationProvider = ({ children, token }) => {
  const socketData = useSocket(token);

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
};
```

#### Emergency Alert Component

```javascript
// components/EmergencyAlert.jsx
import React, { useEffect, useState } from 'react';
import { useNotifications } from './NotificationProvider';

export const EmergencyAlert = () => {
  const { socket } = useNotifications();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('sos_alert', (alertData) => {
      setAlert(alertData);
      // Auto-hide after 10 seconds
      setTimeout(() => setAlert(null), 10000);
    });

    return () => socket.off('sos_alert');
  }, [socket]);

  if (!alert) return null;

  return (
    <div className="emergency-alert">
      <h3>🚨 EMERGENCY ALERT</h3>
      <p>
        <strong>Type:</strong> {alert.emergencyType}
      </p>
      <p>
        <strong>Location:</strong> {alert.location}
      </p>
      <p>
        <strong>Description:</strong> {alert.description}
      </p>
      <p>
        <strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}
      </p>
      <button onClick={() => setAlert(null)}>Dismiss</button>
    </div>
  );
};
```

### Vue.js Integration

#### Composition API

```javascript
// composables/useSocket.js
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';

export function useSocket(token) {
  const socket = ref(null);
  const connected = ref(false);
  const notifications = ref([]);

  onMounted(() => {
    if (!token.value) return;

    socket.value = io('/notifications', {
      auth: { token: token.value },
    });

    socket.value.on('connected', () => {
      connected.value = true;
    });

    socket.value.on('notification_update', (notification) => {
      notifications.value.unshift(notification);
    });
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  const joinRoom = (room) => {
    socket.value?.emit('join_room', { room });
  };

  return {
    socket,
    connected,
    notifications,
    joinRoom,
  };
}
```

#### Component Usage

```vue
<!-- components/NotificationCenter.vue -->
<template>
  <div class="notification-center">
    <div v-if="!connected" class="connection-status">Connecting...</div>

    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
    >
      <h4>{{ notification.title }}</h4>
      <p>{{ notification.message }}</p>
      <small>{{ formatDate(notification.createdAt) }}</small>
    </div>
  </div>
</template>

<script setup>
import { useSocket } from '../composables/useSocket';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const { socket, connected, notifications, joinRoom } = useSocket(
  computed(() => authStore.token),
);

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>
```

### Angular Integration

#### Service

```typescript
// services/socket.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private notificationsSubject = new BehaviorSubject<any[]>([]);

  public connected$ = this.connectedSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  connect(token: string): void {
    this.socket = io('/notifications', {
      auth: { token },
    });

    this.socket.on('connected', () => {
      this.connectedSubject.next(true);
    });

    this.socket.on('notification_update', (notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
    });
  }

  joinRoom(room: string): void {
    this.socket?.emit('join_room', { room });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.connectedSubject.next(false);
  }
}
```

#### Component

```typescript
// components/notification-center.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-notification-center',
  template: `
    <div class="notification-center">
      <div *ngIf="!(socketService.connected$ | async)" class="connecting">
        Connecting...
      </div>

      <div
        *ngFor="let notification of socketService.notifications$ | async"
        class="notification-item"
      >
        <h4>{{ notification.title }}</h4>
        <p>{{ notification.message }}</p>
        <small>{{ notification.createdAt | date: 'short' }}</small>
      </div>
    </div>
  `,
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  constructor(
    public socketService: SocketService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.socketService.connect(token);
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
```

## Mobile Integration

### React Native

```javascript
// services/SocketService.js
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;

    this.socket = io('http://your-server.com/notifications', {
      auth: { token },
    });

    this.socket.on('connected', (data) => {
      console.log('Socket connected:', data);
    });

    this.socket.on('sos_alert', (alert) => {
      this.showPushNotification(alert);
    });
  }

  showPushNotification(alert) {
    // Use react-native-push-notification or similar
    PushNotification.localNotification({
      title: '🚨 Emergency Alert',
      message: `${alert.emergencyType} at ${alert.location}`,
      priority: 'high',
      vibrate: true,
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new SocketService();
```

### Flutter (using socket_io_client)

```dart
// services/socket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  IO.Socket? socket;

  void connect(String token) {
    socket = IO.io('http://your-server.com/notifications',
      IO.OptionBuilder()
        .setAuth({'token': token})
        .build()
    );

    socket?.on('connected', (data) {
      print('Connected: $data');
    });

    socket?.on('sos_alert', (alert) {
      _showEmergencyNotification(alert);
    });

    socket?.connect();
  }

  void _showEmergencyNotification(Map<String, dynamic> alert) {
    // Use flutter_local_notifications
    // Show emergency notification
  }

  void joinRoom(String room) {
    socket?.emit('join_room', {'room': room});
  }

  void disconnect() {
    socket?.disconnect();
  }
}
```

## Backend Integration Examples

### Sending Notifications from Controllers

```typescript
// controllers/campaign.controller.ts
@Controller('campaigns')
export class CampaignController {
  constructor(
    private campaignService: CampaignService,
    private notificationGateway: NotificationGateway,
  ) {}

  @Post(':id/donate')
  async donate(@Param('id') campaignId: string, @Body() donationData: any) {
    const result = await this.campaignService.processDonation(
      campaignId,
      donationData,
    );

    // Send real-time update to campaign subscribers
    this.notificationGateway.sendCampaignUpdate(campaignId, {
      type: 'donation_received',
      amount: donationData.amount,
      newTotal: result.newTotal,
      donorName: donationData.anonymous ? 'Anonymous' : donationData.name,
    });

    return result;
  }
}
```

### Service Integration

```typescript
// services/emergency.service.ts
@Injectable()
export class EmergencyService {
  constructor(
    private notificationGateway: NotificationGateway,
    private userService: UserService,
  ) {}

  async createSOSAlert(alertData: CreateSOSAlertDto) {
    // Save to database
    const alert = await this.sosRepository.save(alertData);

    // Get nearby volunteers and responders
    const nearbyUsers = await this.userService.findNearbyUsers(
      alertData.location,
      5000, // 5km radius
    );

    // Send real-time alert
    this.notificationGateway.sendSOSAlert({
      id: alert.id,
      location: alert.location,
      emergencyType: alert.type,
      description: alert.description,
      timestamp: alert.createdAt.toISOString(),
    });

    return alert;
  }
}
```

## Error Handling Best Practices

### Connection Resilience

```javascript
class ResilientSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  connect() {
    this.socket = io(this.url, this.options);

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      console.log('Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnect();
    });

    // Restore listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  on(event, callback) {
    this.listeners.set(event, callback);
    this.socket?.on(event, callback);
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }
}
```

### Token Refresh Handling

```javascript
class AuthenticatedSocket {
  constructor(getToken, refreshToken) {
    this.getToken = getToken;
    this.refreshToken = refreshToken;
    this.socket = null;
  }

  async connect() {
    const token = await this.getToken();

    this.socket = io('/notifications', {
      auth: { token },
    });

    this.socket.on('connect_error', async (error) => {
      if (error.message === 'Authentication failed') {
        try {
          const newToken = await this.refreshToken();
          this.socket.auth.token = newToken;
          this.socket.connect();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Redirect to login
        }
      }
    });
  }
}
```

## Performance Optimization

### Message Batching

```javascript
class BatchedSocket {
  constructor(socket) {
    this.socket = socket;
    this.messageQueue = [];
    this.batchSize = 10;
    this.batchTimeout = 100; // ms
    this.timeoutId = null;
  }

  emit(event, data) {
    this.messageQueue.push({ event, data });

    if (this.messageQueue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }

  flush() {
    if (this.messageQueue.length === 0) return;

    this.socket.emit('batch_messages', this.messageQueue);
    this.messageQueue = [];

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
```

### Memory Management

```javascript
class ManagedSocket {
  constructor() {
    this.eventListeners = new Map();
    this.maxListeners = 50;
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const listeners = this.eventListeners.get(event);
    if (listeners.size >= this.maxListeners) {
      console.warn(`Too many listeners for event: ${event}`);
      return;
    }

    listeners.add(callback);
    this.socket.on(event, callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      this.socket.off(event, callback);
    }
  }

  removeAllListeners() {
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach((callback) => {
        this.socket.off(event, callback);
      });
    });
    this.eventListeners.clear();
  }
}
```

## Testing Socket Connections

### Unit Testing

```javascript
// __tests__/socket.test.js
import { io } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';

describe('Socket Connection', () => {
  let httpServer;
  let ioServer;
  let clientSocket;

  beforeAll((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = io(`http://localhost:${port}`);
      done();
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
  });

  test('should connect and receive welcome message', (done) => {
    clientSocket.on('connected', (data) => {
      expect(data).toHaveProperty('userId');
      done();
    });
  });

  test('should join room successfully', (done) => {
    clientSocket.emit('join_room', { room: 'test_room' });
    clientSocket.on('room_joined', (data) => {
      expect(data.room).toBe('test_room');
      done();
    });
  });
});
```

### Integration Testing

```javascript
// __tests__/integration.test.js
import request from 'supertest';
import { app } from '../src/app';
import { io } from 'socket.io-client';

describe('Socket Integration', () => {
  let clientSocket;
  let authToken;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = response.body.token;

    // Connect socket
    clientSocket = io('http://localhost:3000/notifications', {
      auth: { token: authToken },
    });
  });

  test('should receive SOS alert when created', (done) => {
    clientSocket.on('sos_alert', (alert) => {
      expect(alert).toHaveProperty('location');
      expect(alert).toHaveProperty('emergencyType');
      done();
    });

    // Trigger SOS alert via API
    request(app)
      .post('/sos/alerts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        location: 'Test Location',
        emergencyType: 'Medical',
        description: 'Test emergency',
      });
  });
});
```

This comprehensive guide covers all aspects of Socket.IO integration for real-time notifications and updates in the Love App backend system.
