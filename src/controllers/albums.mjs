import AlbumModel from '../models/album.mjs';
import validateAlbum from '../validators/albumValidator.js';

const Albums = class Albums {
  constructor(app, connect, auth) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.auth = auth;
    this.run();
  }

  getAll() {
    this.app.get('/albums', this.auth, (req, res) => {
      const { title } = req.query;

      const filter = title ? { title: new RegExp(title, 'i') } : {};

      this.AlbumModel.find(filter).then((albums) => {
        res.status(200).json(albums);
      }).catch(() => {
        res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      });
    });
  }

  showById() {
    this.app.get('/album/:id', this.auth, (req, res) => {
      this.AlbumModel.findById(req.params.id).then((album) => {
        res.status(200).json(album || {});
      }).catch(() => {
        res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      });
    });
  }

  create() {
    this.app.post('/album/', this.auth, (req, res) => {
      const result = validateAlbum(req.body);

      if (!result.valid) {
        return res.status(400).json({
          code: 400,
          message: 'Validation error',
          errors: result.errors
        });
      }

      const albumModel = new this.AlbumModel(req.body);

      albumModel.save().then((album) => {
        res.status(200).json(album);
      }).catch(() => {
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      });
    });
  }

  updateById() {
    this.app.put('/album/:id', this.auth, (req, res) => {
      this.AlbumModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).then((album) => {
        res.status(200).json(album || {});
      }).catch(() => {
        res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      });
    });
  }

  deleteById() {
    this.app.delete('/album/:id', this.auth, (req, res) => {
      this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
        res.status(200).json(album || {});
      }).catch(() => {
        res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      });
    });
  }

  run() {
    this.getAll();
    this.showById();
    this.create();
    this.updateById();
    this.deleteById();
  }
};

export default Albums;
