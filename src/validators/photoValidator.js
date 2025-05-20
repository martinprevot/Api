import Validator from 'better-validator';

function validatePhoto(data) {
  const v = new Validator();

  v(data).required().isObject();
  v(data.title).required().isString().check((val) => val.length >= 3, 'Title must be at least 3 characters long');
  v(data.url).required().isString().check((val) => /^https?:\/\/.+\..+/.test(val), 'URL must be valid');
  v(data.album).required().isString();

  return v.run();
}
export default validatePhoto;
