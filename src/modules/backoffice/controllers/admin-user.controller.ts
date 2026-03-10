import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import { ApiPageResponse } from '../../../decorators/api-page-response.decorator.ts';
import { Auth } from '../../../decorators/http.decorators.ts';
import { UserRegisterDto } from '../../auth/dto/user-register.dto.ts';
import { UserDto } from '../../user/dtos/user.dto.ts';
import { UsersPageOptionsDto } from '../../user/dtos/users-page-options.dto.ts';
import { UserService } from '../../user/user.service.ts';

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
}
