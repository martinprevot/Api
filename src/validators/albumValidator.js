import Validator from 'better-validator';

function validateAlbum(data) {
  const v = new Validator();

  v(data).required().isObject();
  v(data.title).required().isString().check((val) => val.length >= 3, 'Title must be at least 3 characters long');
  v(data.description).optional().isString();

  return v.run();
}
export default validateAlbum;
