import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config.js';

cloudinary.config({
  cloud_name: String(config.cloudinary.cloudName),
  api_key: String(config.cloudinary.apiKey),
  api_secret: String(config.cloudinary.apiSecret),
});

/**
 * Upload an image buffer to Cloudinary
 */
export const uploadImage = async (fileBuffer: Buffer, folder: string = 'wardrobe'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) resolve(result.secure_url);
        else reject(new Error('Cloudinary upload result is undefined'));
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
