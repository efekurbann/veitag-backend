import { ConflictException, Injectable } from '@nestjs/common';
import { ContactType, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { uploadProfilePicture } from 'src/util/cdn.utils';
import { getCDNUrlForProfilePicture, getCDNUrlForQR } from 'src/util/constants';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findWithID(id: number, showAll?: boolean): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        contactInfo: true,
      },
    });

    const qr = getCDNUrlForQR(user);
    const avatar = getCDNUrlForProfilePicture(user);

    user['qrURL'] = qr;
    user['avatarURL'] = avatar;

    user.contactInfo = user.contactInfo.filter((info) => {
      return info.show;
    });

    return user;
  }

  async create(name: string, email: string, pass: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existing) {
      throw new ConflictException('User already exists!');
    }

    return await this.prisma.user.create({
      data: {
        email: email,
        password: pass,
        name: name,
      },
    });
  }

  async getQRUrl(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return getCDNUrlForQR(user);
  }

  async getContacts(id: number) {
    const contacts = await this.prisma.contactInfo.findMany({
      where: {
        userID: id,
      },
    });

    return contacts;
  }

  async updateAvatar(id: number, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    // first time uploading an avatar
    if (!user.avatarID) {
      user.avatarID = randomUUID();

      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          avatarID: user.avatarID,
        },
      });
    }

    await uploadProfilePicture(user, file);

    return getCDNUrlForProfilePicture(user);
  }

  async updateContact(
    id: number,
    platform: ContactType,
    value: string,
    visible: boolean,
    preferred: boolean,
  ): Promise<void> {
    const existing = await this.prisma.contactInfo.findFirst({
      where: {
        userID: id,
        type: platform,
      },
    });

    if (existing) {
      await this.prisma.contactInfo.update({
        where: {
          id: existing.id,
        },
        data: {
          value: value,
          show: visible,
          preferred: preferred,
        },
      });
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    await this.prisma.contactInfo.create({
      data: {
        userID: user.id,
        type: platform,
        value: value,
        show: visible,
        preferred: preferred,
      },
    });
  }
}
