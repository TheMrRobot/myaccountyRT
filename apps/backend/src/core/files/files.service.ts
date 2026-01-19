import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  private uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_PATH') || './uploads';
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async saveFile(
    organizationId: string,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
  }> {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeName}`;

    const folderPath = folder
      ? path.join(this.uploadPath, organizationId, folder)
      : path.join(this.uploadPath, organizationId);

    // Ensure folder exists
    await fs.mkdir(folderPath, { recursive: true });

    const filePath = path.join(folderPath, filename);

    // Write file
    await fs.writeFile(filePath, file.buffer);

    return {
      filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      path: filePath,
    };
  }

  async saveMultipleFiles(
    organizationId: string,
    files: Express.Multer.File[],
    folder?: string,
  ) {
    return Promise.all(
      files.map(file => this.saveFile(organizationId, file, folder)),
    );
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async getFileInfo(filePath: string) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  getFilePath(organizationId: string, folder: string, filename: string): string {
    return path.join(this.uploadPath, organizationId, folder, filename);
  }
}
