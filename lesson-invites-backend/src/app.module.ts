import { Module } from '@nestjs/common';
import { InvitesModule } from './invites/invites.module';
import { PrismaModule } from './prisma/prisma.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [PrismaModule, InvitesModule, TeachersModule, StudentsModule]
})
export class AppModule {}
