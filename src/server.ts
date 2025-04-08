import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";
import { Logger } from "./shared/logger";

async function bootstrap() {
  try {
    await mongoose.connect(config.db_url as string);
    Logger.logger.info("Db is connected");
    // console.log('Db is connected')
    app.listen(config.port, () => {
      Logger.logger.info(`Application listening on port ${config.port}`);
      // console.log(`Application listening on port ${config.port}`)
    });
  } catch (error) {
    Logger.errorLogger.error(`Failed to connect database ${error}`);
    // console.log(`Failed to connect database ${error}`)
  }
}
bootstrap();
