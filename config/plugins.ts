// Use ({ env }) notation to access environment variables
module.exports = ({ env }) => ({
  upload: {
    config: { // Use config instead of provider for v5
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: { // Recommended action options
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
