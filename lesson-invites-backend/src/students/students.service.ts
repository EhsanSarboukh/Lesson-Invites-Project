import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateStudentDto) {
    try {
      const created = await this.prisma.student.create({
        data: { name: createDto.name, email: createDto.email }
      });
      return created;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }
      throw err;
    }
  }

  async findAll() {
    return this.prisma.student.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const s = await this.prisma.student.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Student not found');
    return s;
  }

  async update(id: number, updateDto: UpdateStudentDto) {
    await this.findOne(id);
    try {
      const updated = await this.prisma.student.update({
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
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { success: true };
  }
}
