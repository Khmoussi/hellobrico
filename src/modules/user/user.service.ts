import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, type FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto.ts';
import { FileNotImageException } from '../../exceptions/file-not-image.exception.ts';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';
import type { IFile } from '../../interfaces/IFile.ts';
import { ValidatorService } from '../../shared/services/validator.service.ts';
import type { Reference } from '../../types.ts';
import { RoleType } from '../../constants/role-type.ts';
import { UserRegisterDto } from '../auth/dto/user-register.dto.ts';
import { CreateSettingsCommand } from './commands/create-settings.command.ts';
import { CreateSettingsDto } from './dtos/create-settings.dto.ts';
import type { UpdateAdminUserDto } from './dtos/update-admin-user.dto.ts';
import type { UserDto } from './dtos/user.dto.ts';
import type { UsersPageOptionsDto } from './dtos/users-page-options.dto.ts';
import { UserEntity } from './user.entity.ts';
import { UserSettingsEntity } from './user-settings.entity.ts';
import { FilesService } from '../files/files.service.ts';

const DELETABLE_BACKOFFICE_ROLES: RoleType[] = [
  RoleType.COMMERCIAL,
  RoleType.SUPERVISOR,
];

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingsEntity)
    private userSettingsRepository: Repository<UserSettingsEntity>,
    private validatorService: ValidatorService,
    private filesService: FilesService,
    private commandBus: CommandBus,
  ) {}

  /**
   * Find single user
   */
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  findOneById(id: Uuid): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * Find users by IDs.
   */
  findUsersInIds(ids: string[]): Promise<UserEntity[]> {
    if (!ids?.length) return Promise.resolve([]);
    return this.userRepository.find({ where: { id: In(ids) } });
  }

  /**
   * Find users having one of the given roles (e.g. ADMIN, SUPERVISOR, COMMERCIAL).
   */
  findUsersByRoles(roles: RoleType[]): Promise<UserEntity[]> {
    if (!roles?.length) return Promise.resolve([]);
    return this.userRepository.find({ where: { role: In(roles) } });
  }

  findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect<UserEntity, 'user'>('user.settings', 'settings');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', {
        email: options.email,
      });
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  @Transactional()
  async createUser(
    userRegisterDto: UserRegisterDto,
    file?: Reference<IFile>,
    role?: RoleType,
  ): Promise<UserEntity> {
    const user = this.userRepository.create(userRegisterDto);

    if (role) {
      user.role = role;
    }

    if (file && !this.validatorService.isImage(file.mimetype)) {
      throw new FileNotImageException();
    }
    
    if (file) {
       const result = await this.filesService.uploadFile(file);
       user.avatar=result.public_url;
    }

    await this.userRepository.save(user);

    user.settings = await this.createSettings(
      user.id,
      plainToClass(CreateSettingsDto, {
        isEmailVerified: false,
        isPhoneVerified: false,
      }),
    );

    return user;
  }

  /**
   * Create a commercial user (backoffice).
   */
  @Transactional()
  async createCommercial(
    userRegisterDto: UserRegisterDto,
    file?: Reference<IFile>,
  ): Promise<UserEntity> {
    return this.createUser(userRegisterDto, file, RoleType.COMMERCIAL);
  }

  /**
   * Create a supervisor user (backoffice).
   */
  @Transactional()
  async createSupervisor(
    userRegisterDto: UserRegisterDto,
    file?: Reference<IFile>,
  ): Promise<UserEntity> {
    return this.createUser(userRegisterDto, file, RoleType.SUPERVISOR);
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.id = :userId', { userId });

    const userEntity = await queryBuilder.getOne();

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity.toDto();
  }

  async updateUser(
    userId: Uuid,
    dto: UpdateAdminUserDto,
    file?: Express.Multer.File,
  ): Promise<UserDto> {
    const userEntity = await this.userRepository.findOneBy({ id: userId });

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    if (dto.firstName !== undefined) userEntity.firstName = dto.firstName;
    if (dto.lastName !== undefined) userEntity.lastName = dto.lastName;
    if (dto.email !== undefined) userEntity.email = dto.email;
    if (dto.phone !== undefined) userEntity.phone = dto.phone;
    if (dto.password !== undefined) userEntity.password = dto.password;
    if (dto.role !== undefined) userEntity.role = dto.role;

    if (file) {
      if (!this.validatorService.isImage(file.mimetype)) {
        throw new FileNotImageException();
      }
      const result = await this.filesService.uploadFile(file);
      userEntity.avatar = result.public_url;
    }

    await this.userRepository.save(userEntity);

    return userEntity.toDto();
  }

  createSettings(
    userId: Uuid,
    createSettingsDto: CreateSettingsDto,
  ): Promise<UserSettingsEntity> {
    return this.commandBus.execute<CreateSettingsCommand, UserSettingsEntity>(
      new CreateSettingsCommand(userId, createSettingsDto),
    );
  }

  /**
   * Delete a commercial or supervisor user. Admins and regular users cannot be deleted via this.
   */
  async deleteCommercialOrSupervisor(userId: Uuid): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!DELETABLE_BACKOFFICE_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Only commercial or supervisor users can be deleted',
      );
    }
    await this.userSettingsRepository.delete({ userId });
    await this.userRepository.delete(userId);
  }
}
