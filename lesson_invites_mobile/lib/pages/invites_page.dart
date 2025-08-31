import 'package:flutter/material.dart';
import 'package:lesson_invites_mobile/services/api_service.dart';
import 'package:lesson_invites_mobile/models/invite.dart';
import 'package:intl/intl.dart';

class InvitesPage extends StatefulWidget {
  const InvitesPage({Key? key}) : super(key: key);

  @override
  State<InvitesPage> createState() => _InvitesPageState();
}

class _InvitesPageState extends State<InvitesPage> {
  late int studentId;
  bool _loading = false;
  List<Invite> _invites = [];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final arg = ModalRoute.of(context)!.settings.arguments;
    studentId = (arg is int) ? arg : 1;
    _loadInvites();
  }

  Future<void> _loadInvites() async {
    setState(() {
      _loading = true;
    });
    try {
      final list = await ApiService.fetchStudentInvites(studentId);
      setState(() {
        _invites = list;
      });
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to load invites: $e')));
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  String _fmt(String? iso) {
    if (iso == null) return '-';
    try {
      final dt = DateTime.parse(iso);
      return DateFormat.yMd().add_jm().format(dt);
    } catch (e) {
      return iso;
    }
  }

  Future<void> _respond(int inviteId, String status) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text('${status[0].toUpperCase()}${status.substring(1)} invite'),
        content: Text('Are you sure you want to $status this invite?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(c).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(c).pop(true),
            child: const Text('Yes'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Processing...')));
    try {
      await ApiService.respondInvite(inviteId, status);
      await _loadInvites();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Invite $status')));
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Action failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Pending Invites - Student #$studentId'),
        actions: [
          IconButton(onPressed: _loadInvites, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadInvites,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _invites.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'No pending invites',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                ],
              )
            : ListView.builder(
                itemCount: _invites.length,
                itemBuilder: (context, index) {
                  final inv = _invites[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Invite #${inv.id}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Teacher: ${inv.teacher?.name ?? 'Teacher #${inv.teacherId}'}',
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Scheduled: ${_fmt(inv.scheduledAt ?? inv.scheduled_at)}',
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: inv.status == 'pending'
                                      ? () => _respond(inv.id, 'accepted')
                                      : null,
                                  child: const Text('Accept'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: inv.status == 'pending'
                                      ? () => _respond(inv.id, 'rejected')
                                      : null,
                                  child: const Text('Reject'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
