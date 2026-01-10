import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { UserService } from '../../user/user.service';

@Injectable()
export class FirebaseAuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                const email = decodedToken.email;

                if (email) {
                    // Pass ['provider'] to ensure we load the relation if needed.
                    // Note: If user is NOT a provider, this relation will just be null/undefined, which is fine.
                    const user = await this.userService.findByEmail(email, ['provider']);
                    if (user) {
                        req['user'] = user;
                    }
                }
            } catch (error) {
                // Token invalid or expired, just ignore and let Guards handle 401 if needed
            }
        }
        next();
    }
}
