import { IsEmail, IsString } from 'class-validator';

export class VerifyTokenDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  token: string;
}
