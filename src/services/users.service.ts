import { randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

import { Group } from '@constants/enums';
import { UserEntity } from '@entities/user.entity';
import { BasicCRUDService } from '@services/basicCRUD.service';
import { hash } from '@utils/scrypt';

@Injectable()
export class UsersService extends BasicCRUDService<UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        repository: Repository<UserEntity>
    ) {
        super(repository);
    }

    findIdentityByPhone(phone: string) {
        return this.findOne(
            {
                phone,
            },
            {
                select: ['id', 'password.hash' as keyof UserEntity, 'password.salt' as keyof UserEntity],
            }
        );
    }

    findInGroup(group: Group) {
        return this.find({ where: { group: Equal(group) } });
    }

    hashPassword(password: string) {
        return hash(password);
    }

    async hashPasswordAndCreate(data: Partial<UserEntity>, password = randomBytes(512).toString('hex')) {
        const { hash, salt } = await this.hashPassword(password);
        return await this.createAndSave({
            ...data,
            password: {
                hash: hash,
                salt,
            },
        });
    }
}