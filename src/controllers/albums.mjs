import AlbumModel from '../models/album.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.run();
  }

  getAll() {
    this.app.get('/albums', (req, res) => {
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
    this.app.get('/album/:id', (req, res) => {
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
    this.app.post('/album/', (req, res) => {
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
    this.app.put('/album/:id', (req, res) => {
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
    this.app.delete('/album/:id', (req, res) => {
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
