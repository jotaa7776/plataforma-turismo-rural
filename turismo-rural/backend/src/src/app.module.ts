import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { TerritorioModule } from './territorio/territorio.module';
import { EmprendimientosModule } from './emprendimientos/emprendimientos.module';
import { OfertaModule } from './oferta/oferta.module';
import { ReservasModule } from './reservas/reservas.module';
import { PagosModule } from './pagos/pagos.module';
import { AdministracionModule } from './administracion/administracion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.get<string>('DB_HOST'),
        port: Number(c.get<string>('DB_PORT')),
        username: c.get<string>('DB_USER'),
        password: c.get<string>('DB_PASSWORD'),
        database: c.get<string>('DB_NAME'),
        ssl: c.get<string>('DB_SSL', 'true') === 'true' ? { rejectUnauthorized: false } : false, // Supabase exige SSL
        extra: { max: 5 }, // pocas conexiones: el plan gratis del pooler es limitado
        autoLoadEntities: true,
        synchronize: c.get<string>('DB_SYNC', 'true') === 'true', // usar migraciones en producción
      }),
    }),
    UsuariosModule,
    AuthModule,
    TerritorioModule,
    EmprendimientosModule,
    OfertaModule,
    ReservasModule,
    PagosModule,
    AdministracionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
