// const http = require("http");
// const config = require("./config/env");
// const app = require("./index");
// const { connectDB } = require("./config/db");
// const logger = require("./utils/logger");

// const server = http.createServer(app);
// connectDB()
//   .then(() => {
//     console.log("greeee");
//     logger.info("Connected to MongoDB");

//     server.listen(config.port, () => {
//       logger.info(`Server running on port ${config.port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("DB connection failed:", err);
//   });

// const exitHandler = () => {
//   if (server) {
//     server.close(() => {
//       logger.info("Server closed");
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// };

// const unexpectedErrorHandler = (error) => {
//   logger.error(error);
//   exitHandler();
// };

// process.on("uncaughtException", unexpectedErrorHandler);
// process.on("unhandledRejection", unexpectedErrorHandler);

// process.on("SIGTERM", () => {
//   logger.info("SIGTERM received");
//   if (server) {
//     server.close();
//   }
// });


const http = require('http');
const config = require('./config/env');
const app = require('./index');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

class Server {
  constructor() {
    this.server = http.createServer(app);
    this.shuttingDown = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    process.on('uncaughtException', this.unexpectedErrorHandler.bind(this));
    process.on('unhandledRejection', this.unexpectedErrorHandler.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  async start() {
    try {
      // Connect to database first
      await connectDB();
      logger.info('✅ Database connected successfully');

      // Start server
      await new Promise((resolve, reject) => {
        this.server.listen(config.port, () => {
          logger.info(`🚀 Server running on port ${config.port}`);
          logger.info(`📡 Environment: ${config.env}`);
          logger.info(`🕒 Server time: ${new Date().toISOString()}`);
          resolve();
        }).on('error', reject);
      });

      // Add health check endpoint
      app.get('/health', (req, res) => {
        res.status(200).json({
          status: 'UP',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          database: 'connected' // You could make this dynamic
        });
      });

    } catch (error) {
      logger.error('🔥 Failed to start server:', error);
      this.gracefulShutdown(1);
    }
  }

  unexpectedErrorHandler(error) {
    logger.error('⚠️ Unexpected error:', error);
    if (!this.shuttingDown) {
      this.gracefulShutdown(1);
    }
  }

  async gracefulShutdown(exitCode = 0) {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    logger.info('🛑 Shutting down gracefully...');

    try {
      // Close server
      await new Promise((resolve) => {
        if (this.server.listening) {
          this.server.close(() => {
            logger.info('🔴 Server closed');
            resolve();
          });
        } else {
          resolve();
        }
      });

      // Disconnect database
      await disconnectDB();
      logger.info('🔴 Database disconnected');

      logger.info('👋 Process terminated');
      process.exit(exitCode);
    } catch (err) {
      logger.error('❌ Graceful shutdown failed:', err);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();