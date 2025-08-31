// lib/services/api_service.dart
import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:lesson_invites_mobile/models/invite.dart';

class ApiService {
  /// Choose the base URL depending on platform.
  /// - Android emulator (AVD): 10.0.2.2
  /// - iOS simulator or mac host: localhost
  /// - Web: use same-origin / localhost
  static String get apiBase {
    if (kIsWeb) {
      return 'http://localhost:3000';
    }
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:3000';
      if (Platform.isIOS) return 'http://localhost:3000';
    } catch (_) {}
    // fallback to localhost
    return 'http://localhost:3000';
  }

  static Future<List<Invite>> fetchStudentInvites(int studentId) async {
    final url =
        '${apiBase.replaceAll(RegExp(r'/$'), '')}/invites/student/$studentId?status=pending';
    print('[ApiService] GET $url');
    final uri = Uri.tryParse(url);
    if (uri == null) throw Exception('Invalid URI: $url');

    try {
      final res = await http.get(uri).timeout(const Duration(seconds: 10));

      print(
        '[ApiService] Response ${res.statusCode}: ${res.body.length} bytes',
      );
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw Exception('Server returned ${res.statusCode}: ${res.body}');
      }

      if (res.body == null || res.body.trim().isEmpty) {
        // empty body -> return empty list (or you can throw)
        print('[ApiService] Empty response body -> returning empty list');
        return <Invite>[];
      }

      final data = jsonDecode(res.body);
      if (data is! List) {
        throw Exception('Unexpected response format (expected list): $data');
      }

      final list = data
          .map<Invite>(
            (e) => Invite.fromJson(Map<String, dynamic>.from(e as Map)),
          )
          .toList();
      return list;
    } on http.ClientException catch (e) {
      print('[ApiService] ClientException: $e');
      rethrow;
    } on FormatException catch (e) {
      print('[ApiService] JSON FormatException: $e -- raw body: ${e.source}');
      rethrow;
    } on Exception catch (e) {
      print('[ApiService] Exception: $e');
      rethrow;
    }
  }

  static Future<void> respondInvite(int inviteId, String status) async {
    final url =
        '${apiBase.replaceAll(RegExp(r'/$'), '')}/invites/respond/$inviteId';
    print('[ApiService] POST $url body: {"status":"$status"}');
    final uri = Uri.tryParse(url);
    if (uri == null) throw Exception('Invalid URI: $url');

    try {
      final res = await http
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'status': status}),
          )
          .timeout(const Duration(seconds: 10));

      print('[ApiService] Response ${res.statusCode}: ${res.body}');
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw Exception('Server returned ${res.statusCode}: ${res.body}');
      }
    } on Exception catch (e) {
      print('[ApiService] respondInvite Error: $e');
      rethrow;
    }
  }
}
