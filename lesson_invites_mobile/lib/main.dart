import 'package:flutter/material.dart';
import 'package:lesson_invites_mobile/pages/invites_page.dart';
import 'package:lesson_invites_mobile/pages/login_page.dart';

void main() {
  runApp(const LessonInvitesApp());
}

class LessonInvitesApp extends StatelessWidget {
  const LessonInvitesApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lesson Invites',
      theme: ThemeData(primarySwatch: Colors.green),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginPage(),
        '/invites': (context) => const InvitesPage(),
      },
    );
  }
}
