import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { getAllowedOrigins } from "./authentication/request-origin";
import {
  isLocalRuntime,
  LOCAL_FRONTEND_ORIGIN,
} from "./authentication/runtime-config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  if (isLocalRuntime()) {
    app.enableCors({
      origin: LOCAL_FRONTEND_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Accept", "Content-Type"],
    });
  } else {
    const allowedOrigins = Array.from(getAllowedOrigins());
    if (allowedOrigins.length > 0) {
      app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Accept", "Content-Type"],
      });
    }
  }

  const port = process.env.PORT ?? 3001;

  if (isLocalRuntime()) {
    await app.listen(port, "127.0.0.1");
    return;
  }

  await app.listen(port, "0.0.0.0");
}

void bootstrap();
