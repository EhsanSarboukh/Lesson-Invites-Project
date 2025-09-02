// src/invites/invites.controller.ts
import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { InvitesService } from './invites.service';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post('create')
  createInvite(@Body() body: { teacherId: number; studentId: number; scheduledAt: string }) {
    return this.invitesService.createInvite(body.teacherId, body.studentId, new Date(body.scheduledAt));
  }

  @Post('respond/:id')
  respond(@Param('id') id: string, @Body() body: { status: 'accepted' | 'rejected' }) {
    return this.invitesService.respondToInvite(Number(id), body.status);
  }

  @Get()
  getAll(@Query('status') status?: string) {
    return this.invitesService.getAllInvites(status);
  }

  // NOTE: added optional query param 'status'
  @Get('student/:id')
  getStudentInvites(@Param('id') id: string, @Query('status') status?: string) {
    return this.invitesService.getStudentInvites(Number(id), status);
  }
}
