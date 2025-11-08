import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@app/shared';
import { Server } from 'socket.io';

interface WebSocketConnection {
  userId: string;
  socketId: string;
  connectedAt: Date;
  lastActivity: Date;
}

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private server: Server;

  constructor(private cacheService: CacheService) {}

  setServer(server: Server) {
    this.server = server;
  }

  async addConnection(userId: string, socketId: string) {
    const connection: WebSocketConnection = {
      userId,
      socketId,
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    // Store in Redis instead of memory
    await this.cacheService.hset('ws_connections', socketId, connection);
    await this.cacheService.hset(`user_connections:${userId}`, socketId, connection);
    
    this.logger.log(`Connection added: ${socketId} for user ${userId}`);
  }

  async removeConnection(socketId: string) {
    const connection = await this.cacheService.hget<WebSocketConnection>('ws_connections', socketId);
    if (connection) {
      await this.cacheService.hdel('ws_connections', socketId);
      await this.cacheService.hdel(`user_connections:${connection.userId}`, socketId);
      this.logger.log(`Connection removed: ${socketId}`);
    }
  }

  async sendToUser(userId: string, event: string, data: any) {
    if (!this.server) return;
    
    this.server.to(`user_${userId}`).emit(event, data);
    this.logger.log(`Sent ${event} to user ${userId}`);
  }

  async sendToRoom(room: string, event: string, data: any) {
    if (!this.server) return;
    
    this.server.to(room).emit(event, data);
    this.logger.log(`Sent ${event} to room ${room}`);
  }

  async broadcast(event: string, data: any) {
    if (!this.server) return;
    
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event}`);
  }

  async getActiveConnections(): Promise<number> {
    // Count connections from Redis
    const connections = await this.cacheService.get('ws_connections');
    return connections ? Object.keys(connections).length : 0;
  }
}