import { Router } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { PdfController } from '../controllers/pdf.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { FileUploadMiddleware } from '../middleware/file-upload.middleware';

@injectable()
export class PdfRoutes {
  public router: Router;

  constructor(
    @inject(TYPES.PdfController) private pdfController: PdfController,
    @inject(TYPES.AuthMiddleware) private authMiddleware: AuthMiddleware,
    @inject(TYPES.FileUploadMiddleware) private fileUploadMiddleware: FileUploadMiddleware
  ) {
    this.router = Router();
    this.configureRoutes();
  }

  private configureRoutes() {
    this.router.use(this.authMiddleware.verifyToken.bind(this.authMiddleware));
    this.router.post('/upload', this.fileUploadMiddleware.upload.single('file'), this.pdfController.upload.bind(this.pdfController));
    this.router.get('/my-files', this.pdfController.getMyFiles.bind(this.pdfController));
    this.router.get('/:id/view', this.pdfController.getSignedUrl.bind(this.pdfController));
    this.router.post('/:id/extract', this.pdfController.extractPages.bind(this.pdfController));
  }
}