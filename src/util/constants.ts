import { User } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

export function generateUrlForQR(user: User): string {
  return `https://go.veitag.com/${user.id}`;
}

export function getStorageQRCodePath(user: User): string {
  return `qr/${user.qrID}.png`;
}

export function getStoragePicturePath(user: User): string {
  return `pfp/${user.avatarID}.webp`;
}

export function getCDNUrlForProfilePicture(user: User): string {
  return `${process.env.CDN_PUBLIC}/${getStoragePicturePath(user)}`;
}

export function getCDNUrlForQR(user: User): string {
  return `${process.env.CDN_PUBLIC}/${getStorageQRCodePath(user)}`;
}
