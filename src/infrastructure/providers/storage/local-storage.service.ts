import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@common/filters';
import { createReadStream, promises as fsp } from 'node:fs';
import { basename, extname, join, normalize, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ReadStream } from 'node:fs';

export type StoredFile = Readonly<{
  relativePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}>;

export type ResolvedStoredFile = Readonly<{
  absolutePath: string;
  fileName: string;
  mimeType: string;
  createReadStream: () => ReadStream;
}>;

export type MulterFile = Readonly<{
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  path?: string;
}>;

@Injectable()
export class LocalStorageService {
  private readonly rootDir = join(process.cwd(), 'storage');

  private safeJoin(root: string, rel: string): string {
    const full = normalize(join(root, rel));
    if (!full.startsWith(root + sep) && full !== root) {
      throw new InternalServerErrorException('Caminho inválido.');
    }
    return full;
  }

  private async ensureDir(dirPath: string): Promise<void> {
    await fsp.mkdir(dirPath, { recursive: true });
  }

  async storePublicationAttachment(params: {
    publicationId: string;
    file: MulterFile;
  }): Promise<StoredFile> {
    const { publicationId, file } = params;

    const originalName = file.originalname.trim() || 'arquivo';
    const mimeType = file.mimetype || 'application/octet-stream';
    const sizeBytes = Number.isFinite(file.size) ? file.size : 0;

    const ext = this.guessExt(originalName, mimeType);
    const fileName = `${randomUUID()}${ext}`;
    const relativePath = join('publications', publicationId, fileName);

    const absolutePath = this.safeJoin(this.rootDir, relativePath);
    const absoluteDir = this.safeJoin(
      this.rootDir,
      join('publications', publicationId),
    );

    await this.ensureDir(absoluteDir);

    try {
      if (file.buffer && file.buffer.length >= 0) {
        await fsp.writeFile(absolutePath, file.buffer);
      } else {
        throw new InternalServerErrorException(
          'Upload sem buffer. Verifique se o FileInterceptor está usando memoryStorage().',
        );
      }
    } catch {
      throw new InternalServerErrorException(
        'Falha ao salvar arquivo no disco.',
      );
    }

    return { relativePath, originalName, mimeType, sizeBytes };
  }

  async remove(relativePath: string): Promise<void> {
    const abs = this.safeJoin(this.rootDir, relativePath);
    await fsp.unlink(abs).catch(() => undefined);
  }

  async resolve(relativePath: string): Promise<ResolvedStoredFile> {
    const normalizedRel = relativePath.replace(/\\/g, '/');
    const absolutePath = this.safeJoin(this.rootDir, normalizedRel);

    try {
      await fsp.access(absolutePath);
    } catch {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const fileName = basename(absolutePath);
    const mimeType = this.mimeFromExt(extname(fileName));

    return {
      absolutePath,
      fileName,
      mimeType,
      createReadStream: () => createReadStream(absolutePath),
    };
  }

  private mimeFromExt(ext: string): string {
    const byExt: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    return byExt[ext.toLowerCase()] ?? 'application/octet-stream';
  }

  private guessExt(originalName: string, mimeType: string): string {
    const fromName = extname(originalName.trim()).toLowerCase();

    const allowed = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif']);

    if (fromName && allowed.has(fromName)) return fromName;

    const byMime: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    const fromMime = byMime[mimeType];
    if (fromMime) return fromMime;

    return '';
  }
}
