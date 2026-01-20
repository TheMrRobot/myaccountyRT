import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(RolesGuard)
export class FilesController {
  private maxFileSize: number;

  constructor(
    private readonly filesService: FilesService,
    private configService: ConfigService,
  ) {
    this.maxFileSize = parseInt(this.configService.get<string>('MAX_FILE_SIZE') || '10485760'); // 10MB default
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser('organizationId') organizationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize} bytes`,
      );
    }

    return this.filesService.saveFile(organizationId, file);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @CurrentUser('organizationId') organizationId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum allowed size of ${this.maxFileSize} bytes`,
        );
      }
    }

    return this.filesService.saveMultipleFiles(organizationId, files);
  }

  @Get(':folder/:filename')
  @ApiOperation({ summary: 'Download file' })
  @ApiResponse({ status: 200, description: 'File retrieved' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @CurrentUser('organizationId') organizationId: string,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const filePath = this.filesService.getFilePath(organizationId, folder, filename);
    const fileBuffer = await this.filesService.getFile(filePath);
    const fileInfo = await this.filesService.getFileInfo(filePath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(fileBuffer);
  }

  @Delete(':folder/:filename')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @CurrentUser('organizationId') organizationId: string,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    const filePath = this.filesService.getFilePath(organizationId, folder, filename);
    await this.filesService.deleteFile(filePath);
    return { message: 'File deleted successfully' };
  }
}
