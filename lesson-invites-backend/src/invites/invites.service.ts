// src/invites/invites.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  private logAction(action: string) {
    fs.appendFileSync('log.txt', `${new Date().toISOString()} - ${action}\n`);
  }

  async createInvite(teacherId: number, studentId: number, scheduledAt: Date) {
    const existing = await this.prisma.lessonInvite.findFirst({
      where: { teacherId, studentId, scheduledAt },
    });
    if (existing) throw new BadRequestException('Invite already exists for this student and time.');

    const invite = await this.prisma.lessonInvite.create({
      data: { teacherId, studentId, scheduledAt },
    });

    this.logAction(`SENT invite_id=${invite.id} teacher_id=${teacherId} student_id=${studentId} scheduled_at=${scheduledAt.toISOString()}`);
    return invite;
  }

  async respondToInvite(inviteId: number, status: 'accepted' | 'rejected' ) {
    const invite = await this.prisma.lessonInvite.update({
      where: { id: inviteId },
      data: { status },
    });

    this.logAction(`${status.toUpperCase()} invite_id=${invite.id} teacher_id=${invite.teacherId} student_id=${invite.studentId} scheduled_at=${invite.scheduledAt.toISOString()}`);

    if (status === 'accepted') {
      // auto-reject other invites for same student & time
      await this.prisma.lessonInvite.updateMany({
        where: {
          studentId: invite.studentId,
          scheduledAt: invite.scheduledAt,
          NOT: { id: inviteId },
        },
        data: { status: 'rejected' },
      });
      this.logAction(`AUTO-REJECT other invites for student_id=${invite.studentId} scheduled_at=${invite.scheduledAt.toISOString()} due_to_accept=${inviteId}`);
    }

    return invite;
  }

  // optional status filter
  async getAllInvites(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.lessonInvite.findMany({
      where,
      include: { teacher: true, student: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // optional status filter for student
  async getStudentInvites(studentId: number, status?: string) {
    const where: any = { studentId };
    if (status) where.status = status;
    return this.prisma.lessonInvite.findMany({
      where,
      include: { teacher: true, student: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
