const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: 'risqian99',
  api_key: '258951356195257',
  api_secret: 'jqTXN4RBzLAg5nrAsUEalW9qP10',
});
module.exports = cloudinary;