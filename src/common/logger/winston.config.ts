import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike('LoveApp', {
                    colors: true,
                    prettyPrint: true,
                }),
            ),
        }),
        // Add File transport here if needed for persistence
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
};
