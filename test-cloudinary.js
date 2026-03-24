const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dmmqcmvp6',
  api_key: '714743592695135',
  api_secret: 'XChLEvvdYKKsJUn7MQ8f2dUwqDQ'
});

cloudinary.uploader.upload('package.json', { resource_type: "auto", folder: "whatsapp" })
  .then(result => {
    console.log("SUCCESS!");
    console.log("URL:", result.secure_url);
  })
  .catch(error => {
    console.error("ERROR:", error.message || error);
  });
