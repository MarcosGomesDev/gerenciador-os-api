import { Sanitize } from '@common/decorators';
import { CreateServiceOrderStatusDTO } from '@modules/service-order-status';
import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class UpdateServiceOrderLabFieldsDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Sanitize()
  labDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  labTechnicianId?: string;
}

export class UpdateServiceOrderDTO extends IntersectionType(
  OmitType(CreateServiceOrderStatusDTO, ['serviceOrderId'] as const),
  UpdateServiceOrderLabFieldsDTO,
) {}
