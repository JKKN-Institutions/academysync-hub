# Mentoring Platform - Critical Data Constraints

## GUARDRAIL: People Data Management

**This app must not create or edit Mentor/Student master records. It only fetches them from the external People API and stores references (external IDs). All person views are read-only.**

### Key Architectural Constraints

1. **Single Source of Truth**: The external People API is the authoritative source for all mentor and student master data
2. **Read-Only Operations**: This application can only READ person data, never CREATE or EDIT
3. **Reference Storage**: Only external_id references are stored in the user_profiles table
4. **No Direct Manipulation**: UI must never allow direct creation or editing of person records

### Allowed Operations
- ✅ Fetch mentor/student data from People API
- ✅ Store external_id references locally
- ✅ Sync status updates (active/inactive)
- ✅ Display cached person data
- ✅ Create assignments linking existing people
- ✅ Manage counseling sessions and goals

### Forbidden Operations  
- ❌ Create new mentor/student records
- ❌ Edit personal information (names, emails, departments)
- ❌ Delete person records
- ❌ Modify any master data
- ❌ Show "Add Mentor" or "Add Student" buttons
- ❌ Allow manual person data entry

### Implementation Notes

- Directory pages must not show create/edit buttons for people
- Assignment forms can only select from synced records
- Sync operations are unidirectional (API → App)
- User profiles table links to auth.users but stores external_id references
- Demo mode uses clearly fake IDs (DEMO_*) to avoid confusion

This constraint ensures data integrity and prevents conflicts with the upstream system of record.