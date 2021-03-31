import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Role } from '@constants/enums';
import { JwtPayload } from '@interfaces/jwt.interface';
import { CandidatesService } from '@services/candidates.service';
import { UsersService } from '@services/users.service';
import { backwardCompatibleVerify, verify } from '@utils/scrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly candidatesService: CandidatesService,
        private readonly jwtService: JwtService,
    ) {
    }

    async validateUser(phone: string, password: string) {
        const user = await this.usersService.findIdentityByPhone(phone);
        if (user) {
            const { password: { hash, salt }, id } = user;
            if (Buffer.from(salt, 'base64').length !== 16 && await verify(hash, salt, password)) {
                return id;
            } else if (await backwardCompatibleVerify(Buffer.from(hash, 'base64').toString(), salt, password)) {
                user.password = await this.usersService.hashPassword(password);
                await user.save();
                return id;
            }
        }
        return;
    }

    async generateToken(id: string, role: Role.user | Role.candidate) {
        return await this.jwtService.signAsync({ id, role } as JwtPayload);
    }

    async validateToken(token: string) {
        try {
            const { id, role } = await this.jwtService.verifyAsync<JwtPayload>(token);
            switch (role) {
                case Role.user:
                    return await this.usersService.findOneById(id);
                case Role.candidate:
                    return await this.candidatesService.findOneById(id);
            }
        } catch {
            return;
        }
    }
}
