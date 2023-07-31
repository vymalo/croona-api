import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SDK_CLIENT_TOKEN } from '../shared/tokens/mqtt-token';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: SDK_CLIENT_TOKEN,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.MQTT,
            options: {
              url: configService.get<string>('MQTT_URL'),
              username: configService.get<string>('MQTT_USERNAME'),
              password: configService.get<string>('MQTT_PASSWORD'),
              clientId: configService.get<string>(
                'MQTT_CLIENT_ID',
                'nest-mqtt-client',
              ),
              port: configService.get<number>('MQTT_PORT'),
            },
          }),
          inject: [ConfigService],
        },
      ],
    }),
  ],
  exports: [ClientsModule],
})
export class SdkModule {}
