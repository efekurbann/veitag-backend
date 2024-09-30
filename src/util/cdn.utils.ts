import { PassThrough, Readable } from 'stream';
import {
  generateUrlForQR,
  getStoragePicturePath,
  getStorageQRCodePath,
} from './constants';
import { User } from '@prisma/client';
import * as QRCode from 'qrcode';
import * as https from 'https';
import * as sharp from 'sharp';

export async function uploadQRForUser(user: User) {
  const stream = new PassThrough();
  QRCode.toFileStream(stream, generateUrlForQR(user), {
    errorCorrectionLevel: 'Q',
    margin: 0,
    scale: 6,
    width: 600,
  });

  const options = {
    method: 'PUT',
    host: process.env.CDN_HOST,
    path: `/${process.env.CDN_STORAGE_NAME}/` + getStorageQRCodePath(user),
    headers: {
      AccessKey: process.env.CDN_ACCESS_KEY,
      'Content-Type': 'application/octet-stream',
      accept: 'application/json',
    },
  };

  const req = https.request(options);

  req.on('error', (error) => {
    console.error(error);
  });

  stream.pipe(req);
}

export async function uploadProfilePicture(
  user: User,
  file: Express.Multer.File,
) {
  const options = {
    method: 'PUT',
    host: process.env.CDN_HOST,
    path: `/${process.env.CDN_STORAGE_NAME}/` + getStoragePicturePath(user),
    headers: {
      AccessKey: process.env.CDN_ACCESS_KEY,
      'Content-Type': 'application/octet-stream',
      accept: 'application/json',
    },
  };

  const stream = Readable.from(
    await sharp(file.buffer)
      .resize(600, 600)
      .webp({ quality: 85, nearLossless: true })
      .toBuffer(),
  );

  const req = https.request(options);

  req.on('error', (error) => {
    console.error(error);
  });

  stream.pipe(req);
}
