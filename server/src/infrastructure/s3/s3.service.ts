import { injectable } from 'inversify';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CustomError } from '../../core/errors/custom-error';
import sharp from 'sharp';

@injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.S3_BUCKET!;
  }

  async uploadImage(file: Express.Multer.File, key: string): Promise<void> {
    try {
      const compressedImage = await sharp(file.buffer)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: compressedImage,
        ContentType: 'image/jpeg',
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new CustomError('Failed to upload image to S3', 500);
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      throw new CustomError('Failed to generate signed URL', 500);
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      throw new CustomError('Failed to delete image from S3', 500);
    }
  }

  async extractKeyFromSignedUrl(signedUrl: string): Promise<string> {
    try {
      const url = new URL(signedUrl);
      const key = decodeURIComponent(url.pathname.slice(1)); 
      if (!key) {
        throw new CustomError('Invalid signed URL: No key found', 400);
      }
      return key;
    } catch (error) {
      throw new CustomError('Failed to extract key from signed URL', 400);
    }
  }
  

}