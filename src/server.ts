import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function bootstrap() {
  await connectDatabase();
  const { server } = createApp();
  server.listen(env.BACKEND_PORT, () => {
    console.log(`Backend listening on http://localhost:${env.BACKEND_PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
