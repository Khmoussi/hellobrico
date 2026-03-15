import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import { ApiPageResponse } from '../../../decorators/api-page-response.decorator.ts';
import { Auth, UUIDParam } from '../../../decorators/http.decorators.ts';
import { UserRegisterDto } from '../../auth/dto/user-register.dto.ts';
import { UpdateAdminUserDto } from '../../user/dtos/update-admin-user.dto.ts';
import { UserDto } from '../../user/dtos/user.dto.ts';
import { UsersPageOptionsDto } from '../../user/dtos/users-page-options.dto.ts';
import { UserService } from '../../user/user.service.ts';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';


const multerConfig = {
    storage: multer.memoryStorage(), // store file in memory
    limits: { fileSize: 10 * 1024 * 1024 }, // optional: max 10MB
  };

@Controller('admin/users')
@ApiTags('admin-users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({
    description: 'Get paginated list of users for backoffice',
    type: PageDto,
  })
  async getUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getUsers(pageOptionsDto);
  }

  @Patch()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UserDto,
    description: 'User updated by admin',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiExtraModels(UpdateAdminUserDto)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Marie', description: 'First name' },
        lastName: { type: 'string', example: 'Martin', description: 'Last name' },
        email: { type: 'string', example: 'marie.martin@hellobrico.com', description: 'Email' },
        phone: { type: 'string', example: '+21612345678', description: 'Phone' },
        password: { type: 'string', example: 'NewSecureP@ss123', description: 'New password (min 6 chars)' },
        role: { type: 'string', enum: Object.values(RoleType), description: 'Role' },
        avatar: { type: 'string', format: 'binary', description: 'Profile avatar image' },
      },
    },
  })
  async updateUser(
    @Request() req: { user: { id: Uuid } },
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userService.updateUser(req.user.id, updateAdminUserDto, file);
  }

  @Post('commercial')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: UserDto,
    description: 'Commercial user created',
  })
  @ApiBody({
    type: UserRegisterDto,
    examples: {
      default: {
        summary: 'Create commercial',
        value: {
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@hellobrico.com',
          password: 'SecureP@ss123',
          phone: '+21612345678',
        },
      },
    },
  })
  async createCommercial(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserDto> {
    const user = await this.userService.createCommercial(userRegisterDto);
    return user.toDto({ isActive: true });
  }

  @Post('supervisor')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: UserDto,
    description: 'Supervisor user created',
  })
  @ApiBody({
    type: UserRegisterDto,
    examples: {
      default: {
        summary: 'Create supervisor',
        value: {
          firstName: 'Paul',
          lastName: 'Dubois',
          email: 'paul.dubois@hellobrico.com',
          password: 'SecureP@ss123',
          phone: '+21698765432',
        },
      },
    },
  })
  async createSupervisor(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserDto> {
    const user = await this.userService.createSupervisor(userRegisterDto);
    return user.toDto({ isActive: true });
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Commercial or supervisor user deleted',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', required: true })
  async deleteUser(@UUIDParam('id') id: Uuid): Promise<void> {
    return this.userService.deleteCommercialOrSupervisor(id);
  }
}
