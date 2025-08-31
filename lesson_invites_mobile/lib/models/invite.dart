// lib/models/invite.dart
class Teacher {
  final int id;
  final String? name;
  final String? email;

  Teacher({required this.id, this.name, this.email});

  factory Teacher.fromJson(Map<String, dynamic> json) {
    return Teacher(
      id: (json['id'] is int) ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] as String?,
      email: json['email'] as String?,
    );
  }
}

class Invite {
  final int id;
  final int? teacherId;
  final int? studentId;
  final String status;
  final String? scheduledAt; // ISO string
  final String? scheduled_at;
  final Teacher? teacher;
  final dynamic student;

  Invite({
    required this.id,
    this.teacherId,
    this.studentId,
    required this.status,
    this.scheduledAt,
    this.scheduled_at,
    this.teacher,
    this.student,
  });

  factory Invite.fromJson(Map<String, dynamic> json) {
    Teacher? teacher;
    try {
      if (json['teacher'] != null && json['teacher'] is Map) {
        teacher = Teacher.fromJson(Map<String, dynamic>.from(json['teacher']));
      }
    } catch (_) {
      teacher = null;
    }

    int? parseInt(dynamic v) {
      if (v == null) return null;
      if (v is int) return v;
      final s = v.toString();
      return int.tryParse(s);
    }

    return Invite(
      id: parseInt(json['id']) ?? 0,
      teacherId: parseInt(json['teacherId']) ?? parseInt(json['teacher_id']),
      studentId: parseInt(json['studentId']) ?? parseInt(json['student_id']),
      status: (json['status'] as String?) ?? 'pending',
      scheduledAt: json['scheduledAt'] as String?,
      scheduled_at: json['scheduled_at'] as String?,
      teacher: teacher,
      student: json['student'],
    );
  }
}
