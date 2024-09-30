import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/auth/public.decorator';
import { UserDecorator } from './user.decorator';
import { ContactType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUser(@UserDecorator() userID: number) {
    const user = await this.userService.findWithID(userID, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password; // make sure that the password field is removed

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get(':id/info')
  async getInfo(@Param('id', ParseIntPipe) id: number) {
    // no need to check if the user with this id actually exists
    const user = await this.userService.findWithID(id);
    delete user.password;

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Put('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @UserDecorator() userID: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 4096 * 4096 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const url = await this.userService.updateAvatar(userID, file);
    return { status: true, avatarURL: url };
  }

  @HttpCode(HttpStatus.OK)
  @Put('/contact')
  async updateContact(
    @UserDecorator() userID: number,
    @Body('platform') platform: ContactType,
    @Body('value') value: string,
    @Body('visible') visible: boolean,
    @Body('preferred') preferred: boolean,
  ) {
    await this.userService.updateContact(
      userID,
      platform,
      value,
      visible,
      preferred,
    );
    return { status: true, message: 'Credentials updated sucessfully' };
  }
}
