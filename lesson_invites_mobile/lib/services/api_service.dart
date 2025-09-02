// lib/services/api_service.dart
import 'dart:convert';
import 'dart:io' show HttpException, Platform;
import 'dart:developer' as dev; // for structured logs
import 'package:flutter/foundation.dart' show kDebugMode, kIsWeb;
import 'package:http/http.dart' as http;

import 'package:lesson_invites_mobile/models/invite.dart';

// Simple logger that only logs in debug builds (no avoid_print warnings)
void _log(String message) {
  if (kDebugMode) dev.log(message, name: 'ApiService');
}

class ApiService {
  /// Pick the right base for your environment.
  /// For a real Android device, use your PC LAN IP (e.g. http://192.168.1.50:3000).
  static String get apiBase {
    if (kIsWeb) return 'http://localhost:3000';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:3000';
      if (Platform.isIOS) return 'http://localhost:3000';
      if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
        return 'http://localhost:3000';
      }
    } catch (_) {}
    return 'http://localhost:3000';
  }

  static String _normalizeBase(String base) =>
      base.endsWith('/') ? base.substring(0, base.length - 1) : base;

  static Future<List<Invite>> fetchStudentInvites(int studentId) async {
    final base = _normalizeBase(apiBase);
    final uri = Uri.parse('$base/invites/student/$studentId?status=pending');

    _log('GET $uri');

    final res = await http.get(uri).timeout(const Duration(seconds: 10));

    _log('Response ${res.statusCode}; bytes: ${res.bodyBytes.length}');

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw HttpException('Server returned ${res.statusCode}: ${res.body}');
    }

    final body = res.body
        .trim(); // <-- body is never null; trim and check empty
    if (body.isEmpty) {
      _log('Empty response body -> returning empty list');
      return <Invite>[];
    }

    final decoded = jsonDecode(body);
    if (decoded is! List) {
      throw const FormatException('Expected a JSON array for invites');
    }

    return decoded
        .map<Invite>(
          (e) => Invite.fromJson(Map<String, dynamic>.from(e as Map)),
        )
        .toList();
  }

  static Future<void> respondInvite(int inviteId, String status) async {
    final base = _normalizeBase(apiBase);
    final uri = Uri.parse('$base/invites/respond/$inviteId');

    final payload = jsonEncode({'status': status});
    _log('POST $uri body: $payload');

    final res = await http
        .post(uri, headers: {'Content-Type': 'application/json'}, body: payload)
        .timeout(const Duration(seconds: 10));

    _log('Response ${res.statusCode}; body bytes: ${res.bodyBytes.length}');

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw HttpException('Server returned ${res.statusCode}: ${res.body}');
    }
  }
}
