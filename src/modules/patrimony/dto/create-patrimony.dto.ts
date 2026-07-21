import { Sanitize } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  patrimonySituations,
  PatrimonySituation,
} from 'types/patrimony';

export class CreatePatrimonyDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  inventoryNumber: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  description: string;

  @ApiProperty({
    enum: Object.values(patrimonySituations),
    enumName: 'PatrimonySituation',
  })
  @IsNotEmpty()
  @IsEnum(patrimonySituations, { message: 'Situação de patrimônio inválida' })
  situation: PatrimonySituation;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsNotEmpty()
  @IsString()
  patrimonyTypeId: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  locationName?: string;
}
