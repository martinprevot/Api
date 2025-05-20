import jwt from 'jsonwebtoken';

const Auth = class Users {
  constructor(app) {
    this.app = app;
    this.run();
  }

  getToken() {
    this.app.get('/auth', (req, res) => {
      try {
        console.log('[INFO] GET /auth route hit');

        const token = jwt.sign({ username: 'admin' }, 'root', { expiresIn: 120 });
        res.status(200).json({ token });
      } catch (err) {
        console.error(`[ERROR] auth -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.getToken();
  }
};

export default Auth;
