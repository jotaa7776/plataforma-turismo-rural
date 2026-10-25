import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // CSP desactivada para que Swagger UI funcione; la API solo responde JSON e imágenes.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('Plataforma de Turismo Rural y Comunitario').setVersion('1.0').addBearerAuth().build(),
  );
  SwaggerModule.setup('api/docs', app, doc);

  // Supabase expone el esquema public por su API REST. Con RLS activado y sin políticas,
  // esa API no puede leer nuestras tablas; el backend (dueño de las tablas) sí puede.
  if (process.env.DB_ENABLE_RLS === 'true') {
    await app.get(DataSource).query(`DO $$ DECLARE t record; BEGIN
      FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
      END LOOP; END $$;`);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
