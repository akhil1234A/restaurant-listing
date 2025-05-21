import { injectable } from 'inversify';
import multer from 'multer';
import { CustomError } from '../../core/errors/custom-error';

@injectable()
export class FileUploadMiddleware {
  private storage = multer.memoryStorage();
  private fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new CustomError('Only JPEG and PNG images are allowed', 400));
    }
    cb(null, true);
  };

  public upload = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
}