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
    this.app.get('/albums', this.auth, async (req, res, next) => {
      try {
        const { title } = req.query;
        const filter = title ? { title: new RegExp(title, 'i') } : {};
        const albums = await this.AlbumModel.find(filter);
        return res.status(200).json(albums);
      } catch (err) {
        return next(err);
      }
    });
  }

  showById() {
    this.app.get('/album/:id', this.auth, async (req, res, next) => {
      try {
        const album = await this.AlbumModel.findById(req.params.id);
        return res.status(200).json(album || {});
      } catch (err) {
        return next(err);
      }
    });
  }

  create() {
    this.app.post('/album/', this.auth, async (req, res, next) => {
      try {
        const result = validateAlbum(req.body);

        if (!result.valid) {
          return res.status(400).json({
            code: 400,
            message: 'Validation error',
            errors: result.errors
          });
        }

        const albumModel = new this.AlbumModel(req.body);
        const album = await albumModel.save();
        return res.status(200).json(album);
      } catch (err) {
        return next(err);
      }
    });
  }

  updateById() {
    this.app.put('/album/:id', this.auth, async (req, res, next) => {
      try {
        const album = await this.AlbumModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );
        return res.status(200).json(album || {});
      } catch (err) {
        return next(err);
      }
    });
  }

  deleteById() {
    this.app.delete('/album/:id', this.auth, async (req, res, next) => {
      try {
        const album = await this.AlbumModel.findByIdAndDelete(req.params.id);
        return res.status(200).json(album || {});
      } catch (err) {
        return next(err);
      }
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
