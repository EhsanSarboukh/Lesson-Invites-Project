import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTeacherDto) {
    try {
      const created = await this.prisma.teacher.create({
        data: { name: createDto.name, email: createDto.email }
      });
      return created;
    } catch (err: any) {
      // Prisma unique constraint code
      if (err?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw err;
    }
  }

  async findAll() {
    return this.prisma.teacher.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const t = await this.prisma.teacher.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Teacher not found');
    return t;
  }

  async update(id: number, updateDto: UpdateTeacherDto) {
    // ensure exists
    await this.findOne(id);
    try {
      const updated = await this.prisma.teacher.update({
        where: { id },
        data: updateDto
      });
      return updated;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw err;
    }
  }

  async remove(id: number) {
    // Ensure exists first to return 404 if not.
    await this.findOne(id);
    await this.prisma.teacher.delete({ where: { id } });
    return { success: true };
  }
}
