import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  private logAction(action: string) {
    try {
      fs.appendFileSync('log.txt', `${new Date().toISOString()} - ${action}\n`);
    } catch {
      // ignore logging failures in dev
    }
  }

  /**
   * Create a new invite from teacher -> student at a scheduled time.
   * Enforces: a teacher cannot send more than one invite to the same student at the same time.
   */
  async createInvite(teacherId: number, studentId: number, scheduledAt: Date) {
    // prevent duplicate invites for same (teacher, student, scheduledAt)
    const existing = await this.prisma.lessonInvite.findFirst({
      where: { teacherId, studentId, scheduledAt },
    });
    if (existing) {
      throw new BadRequestException('An invite already exists for this student and time from this teacher.');
    }

    const invite = await this.prisma.lessonInvite.create({
      data: { teacherId, studentId, scheduledAt },
    });

    this.logAction(`SENT invite_id=${invite.id} teacher_id=${teacherId} student_id=${studentId} scheduled_at=${scheduledAt.toISOString()}`);
    return invite;
  }

  /**
   * Respond to an invite (accept/reject).
   * Enforces:
   *  - Only one future accepted invite per student at any time.
   *  - When an invite is accepted, all other invites for the same student & same time are auto-rejected.
   */
  async respondToInvite(inviteId: number, status: 'accepted' | 'rejected') {
    // Make sure invite exists first
    const current = await this.prisma.lessonInvite.findUnique({ where: { id: inviteId } });
    if (!current) throw new NotFoundException('Invite not found');

    // Fast path for rejection
    if (status === 'rejected') {
      const rejected = await this.prisma.lessonInvite.update({
        where: { id: inviteId },
        data: { status: 'rejected' },
      });
      this.logAction(`Student ${rejected.studentId} rejected invite ${inviteId}`);
      return rejected;
    }

    // Accept path: enforce single future accepted per student
    if (status === 'accepted') {
      const now = new Date();

      // If this invite is in the past, don't allow accepting (optional guard)
      if (current.scheduledAt <= now) {
        throw new BadRequestException('Cannot accept a lesson in the past.');
      }

      // Check if the student already has another FUTURE accepted invite
      const alreadyAccepted = await this.prisma.lessonInvite.findFirst({
        where: {
          studentId: current.studentId,
          status: 'accepted',
          scheduledAt: { gt: now },
          NOT: { id: inviteId },
        },
        select: { id: true, scheduledAt: true },
      });

      if (alreadyAccepted) {
        throw new BadRequestException(
          `Student already has a future accepted lesson (invite ${alreadyAccepted.id} at ${alreadyAccepted.scheduledAt.toISOString()}).`,
        );
      }

      // Transaction to (1) accept this invite, (2) auto-reject other invites at the same time for this student
      const [accepted] = await this.prisma.$transaction([
        this.prisma.lessonInvite.update({
          where: { id: inviteId },
          data: { status: 'accepted' },
        }),
        this.prisma.lessonInvite.updateMany({
          where: {
            studentId: current.studentId,
            scheduledAt: current.scheduledAt,
            NOT: { id: inviteId },
          },
          data: { status: 'rejected' },
        }),
      ]);

      this.logAction(`Student ${accepted.studentId} accepted invite ${inviteId}`);
      return accepted;
    }

    // If status is something else (shouldn't happen due to DTO), guard anyway
    throw new BadRequestException('Invalid status');
  }

  async getAllInvites(status?: string) {
    // If the status is 'all' or is not provided, return all invites.
    // Otherwise, filter by the provided status.
    const whereClause = status && status.toLowerCase() !== 'all' 
      ? { status: status } 
      : {};

    return this.prisma.lessonInvite.findMany({
      where: whereClause,
      include: { teacher: true, student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentInvites(studentId: number) {
    return this.prisma.lessonInvite.findMany({
      where: { studentId, status: 'pending' },
      include: { teacher: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
