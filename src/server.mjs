import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
// eslint-disable-next-line import/no-extraneous-dependencies
import rateLimit from 'express-rate-limit';
import * as https from 'node:https';
import * as fs from 'node:fs';
import config from './config.mjs';
import routes from './controllers/routes.mjs';

const options = {
  key: fs.readFileSync('./server.key'), // <-- ici
  cert: fs.readFileSync('./server.cert') // <-- ici
};

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development;
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;

      this.connect = await mongoose.createConnection(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      this.connect.on('error', (err) => {
        console.error(`[ERROR] api dbConnect() -> ${err}`);
        setTimeout(() => {
          console.log('[ERROR] api dbConnect() -> mongodb error');
          this.dbConnect();
        }, 5000);
      });

      this.connect.on('disconnected', () => {
        console.log('[DISCONNECTED] api dbConnect() -> mongodb disconnected');
        setTimeout(() => {
          this.dbConnect();
        }, 5000);
      });

      process.on('SIGINT', () => {
        this.connect.close((error) => {
          if (error) {
            console.error('[ERROR] api dbConnect() close() -> mongodb error', error);
          } else {
            console.log('[CLOSE] api dbConnect() -> mongodb closed');
          }
        });
        console.log('[API END PROCESS] api dbConnect() -> close mongodb connection');
        process.exit(0);
      });

      return this.connect;
    } catch (err) {
      console.error(`[ERROR] api dbConnect() -> ${err}`);
      throw err;
    }
  }

  middleware() {
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  authMiddleware() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
          const user = jwt.verify(token, 'root'); // Remplace par ta config
          req.auth = user;
          return next();
        } catch {
          return res.status(401).json({
            code: 401,
            message: 'Invalid or expired token'
          });
        }
      }

      return res.status(401).json({
        code: 401,
        message: 'Authorization token missing'
      });
    };
  }

  routes() {
    const authMiddleware = this.authMiddleware();

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { code: 429, message: 'Too many login attempts, please try again later.' }
    });

    new routes.Users(this.app, this.connect, authMiddleware, limiter);
    new routes.Photos(this.app, this.connect, authMiddleware, limiter);
    new routes.Albums(this.app, this.connect, authMiddleware, limiter);
    this.app.use('/auth', limiter);
    new routes.Auth(this.app, this.connect);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      });
    });

    // 🧤 Global error handler (ajoute ceci)
    this.app.use((err, req, res, next) => {
      console.error('[ERROR MIDDLEWARE]', err);
      res.status(err.status || 500).json({
        code: err.status || 500,
        message: err.message || 'Internal Server Error'
      });
    });
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();

      // utiliser directement les fichiers à la racine
      https.createServer(options, this.app)
        .listen(this.config.port, () => {
          console.log(`[SERVER] Running HTTPS on port ${this.config.port}`);
        });
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`);
    }
  }
};

export default Server;
