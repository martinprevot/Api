import PhotoModel from '../models/photo.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album');
    this.run();
  }

  getAll() {
    this.app.get('/photos', (req, res) => {
      const { title } = req.query;

      const filter = title ? { title: new RegExp(title, 'i') } : {};

      this.PhotoModel.find(filter)
        .populate('album')
        .then((photos) => {
          res.status(200).json(photos);
        }).catch((err) => {
          console.error(`[ERROR] /photos -> ${err}`);
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
    });
  }

  showById() {
    this.app.get('/photo/:id', (req, res) => {
      this.PhotoModel.findById(req.params.id)
        .populate('album')
        .then((photo) => {
          res.status(200).json(photo || {});
        }).catch((err) => {
          console.error(`[ERROR] /photo/:id -> ${err}`);
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
    });
  }

  create() {
    this.app.post('/photo', (req, res) => {
      const photoModel = new this.PhotoModel(req.body);

      photoModel.save().then((photo) => {
        // Mettre à jour l'album correspondant
        this.AlbumModel.findByIdAndUpdate(
          photo.album,
          { $push: { photos: photo._id } },
          { new: true }
        ).exec();

        res.status(200).json(photo);
      }).catch((err) => {
        console.error(`[ERROR] /photo create -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      });
    });
  }

  updateById() {
    this.app.put('/photo/:id', (req, res) => {
      this.PhotoModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((photo) => {
          res.status(200).json(photo || {});
        }).catch((err) => {
          console.error(`[ERROR] /photo/:id update -> ${err}`);
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
    });
  }

  deleteById() {
    this.app.delete('/photo/:id', (req, res) => {
      this.PhotoModel.findById(req.params.id).then((photo) => {
        if (photo) {
          // Retirer la photo de l'album correspondant
          this.AlbumModel.findByIdAndUpdate(
            photo.album,
            { $pull: { photos: photo._id } }
          ).exec();

          return photo.deleteOne();
        }
        return null;
      }).then((photo) => {
        res.status(200).json(photo || {});
      }).catch((err) => {
        console.error(`[ERROR] /photo/:id delete -> ${err}`);
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

export default Photos;
