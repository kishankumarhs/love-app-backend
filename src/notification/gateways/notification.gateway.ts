import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

interface WebSocketConnection {
  id: string;
  userId: string;
  socketId: string;
  room?: string;
  connectedAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connections = new Map<string, WebSocketConnection>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      const connection: WebSocketConnection = {
        id: `${userId}_${client.id}`,
        userId,
        socketId: client.id,
        connectedAt: new Date(),
        lastActivity: new Date(),
        userAgent: client.handshake.headers['user-agent'],
        ipAddress: client.handshake.address,
      };

      this.connections.set(client.id, connection);

      // Join user to their personal room
      client.join(`user_${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

      // Send connection confirmation
      client.emit('connected', { userId, socketId: client.id });
    } catch (error) {
      this.logger.error('Connection authentication failed', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const connection = this.connections.get(client.id);
    if (connection) {
      this.logger.log(
        `Client disconnected: ${client.id} (User: ${connection.userId})`,
      );
      this.connections.delete(client.id);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    const connection = this.connections.get(client.id);
    if (connection) {
      client.join(data.room);
      connection.room = data.room;
      connection.lastActivity = new Date();
      this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    const connection = this.connections.get(client.id);
    if (connection) {
      client.leave(data.room);
      connection.room = undefined;
      connection.lastActivity = new Date();
      this.logger.log(`Client ${client.id} left room: ${data.room}`);
    }
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
    this.logger.log(`Sent ${event} to user ${userId}`);
  }

  // Send notification to room
  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
    this.logger.log(`Sent ${event} to room ${room}`);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event} to all clients`);
  }

  // Send SOS alert
  sendSOSAlert(data: any) {
    this.broadcast('sos_alert', data);
  }

  // Send notification update
  sendNotificationUpdate(userId: string, notification: any) {
    this.sendToUser(userId, 'notification_update', notification);
  }

  // Send campaign update
  sendCampaignUpdate(campaignId: string, data: any) {
    this.sendToRoom(`campaign_${campaignId}`, 'campaign_update', data);
  }

  // Get active connections count
  getActiveConnections(): number {
    return this.connections.size;
  }

  // Get connections for specific user
  getUserConnections(userId: string): WebSocketConnection[] {
    return Array.from(this.connections.values()).filter(
      (conn) => conn.userId === userId,
    );
  }
}
