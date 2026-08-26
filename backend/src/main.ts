import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
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
      methods: ["GET", "POST"],
      allowedHeaders: ["Accept", "Content-Type"],
    });
  }

  const port = process.env.PORT ?? 3001;

  if (isLocalRuntime()) {
    await app.listen(port, "127.0.0.1");
    return;
  }

  await app.listen(port);
}

void bootstrap();
