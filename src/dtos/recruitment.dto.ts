import { IsDateString, IsEnum, IsInt, IsString, Matches, Min } from 'class-validator';

import { Period } from '@constants/enums';

export class SetRecruitmentScheduleBody {
    @IsDateString()
    beginning!: string;

    @IsDateString()
    deadline!: string;

    @IsDateString()
    end!: string;
}

export class SetRecruitmentInterviewsBody {
    @IsDateString()
    date!: string;

    @IsEnum(Period)
    period!: Period;

    @IsInt()
    @Min(0)
    slotNumber!: number;
}

export class CreateRecruitmentBody extends SetRecruitmentScheduleBody {
    @IsString()
    @Matches(/^\d{4}[ASC]$/)
    name!: string;
}
