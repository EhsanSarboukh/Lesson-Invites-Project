import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateTeacherDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
