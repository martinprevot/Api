import PhotoModel from '../models/photo.mjs';
import AlbumModel from '../models/album.mjs';
import validatePhoto from '../validators/photoValidator.js';

const Photos = class Photos {
  constructor(app, connect, auth) {
    this.app = app;
    this.auth = auth;
    this.PhotoModel = connect.model('Photo', PhotoModel);

    try {
      this.AlbumModel = connect.model('Album');
    } catch (error) {
      this.AlbumModel = connect.model('Album', AlbumModel);
    }

    this.run();
  }

  getAll() {
    this.app.get('/photos', this.auth, async (req, res, next) => {
      try {
        const { title } = req.query;
        const filter = title ? { title: new RegExp(title, 'i') } : {};
        const photos = await this.PhotoModel.find(filter).populate('album');
        return res.status(200).json(photos);
      } catch (err) {
        console.error(`[ERROR] /photos -> ${err}`);
        return next(err);
      }
    });
  }

  showById() {
    this.app.get('/photo/:id', this.auth, async (req, res, next) => {
      try {
        const photo = await this.PhotoModel.findById(req.params.id).populate('album');
        return res.status(200).json(photo || {});
      } catch (err) {
        console.error(`[ERROR] /photo/:id -> ${err}`);
        return next(err);
      }
    });
  }

  create() {
    this.app.post('/photo', this.auth, async (req, res, next) => {
      try {
        const result = validatePhoto(req.body);

        if (!result.valid) {
          return res.status(400).json({
            code: 400,
            message: 'Validation error',
            errors: result.errors
          });
        }

        const photoModel = new this.PhotoModel(req.body);
        const photo = await photoModel.save();

        this.AlbumModel.findByIdAndUpdate(
          photo.album,
          { $push: { photos: photo._id } },
          { new: true }
        ).exec();

        return res.status(200).json(photo);
      } catch (err) {
        console.error(`[ERROR] /photo create -> ${err}`);
        return next(err);
      }
    });
  }

  updateById() {
    this.app.put('/photo/:id', this.auth, async (req, res, next) => {
      try {
        const photo = await this.PhotoModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        );
        return res.status(200).json(photo || {});
      } catch (err) {
        console.error(`[ERROR] /photo/:id update -> ${err}`);
        return next(err);
      }
    });
  }

  deleteById() {
    this.app.delete('/photo/:id', this.auth, async (req, res, next) => {
      try {
        const photo = await this.PhotoModel.findById(req.params.id);
        if (photo) {
          this.AlbumModel.findByIdAndUpdate(
            photo.album,
            { $pull: { photos: photo._id } }
          ).exec();

          await photo.deleteOne();
          return res.status(200).json(photo);
        }

        return res.status(200).json({});
      } catch (err) {
        console.error(`[ERROR] /photo/:id delete -> ${err}`);
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

export default Photos;
