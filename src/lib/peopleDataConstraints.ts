/**
 * CRITICAL GUARDRAIL: PEOPLE DATA MANAGEMENT
 * 
 * This app must not create or edit Mentor/Student master records. 
 * It only fetches them from the external People API and stores references (external IDs). 
 * All person views are read-only.
 * 
 * Key Constraints:
 * - NO direct creation of mentor/student records in this app
 * - NO editing of personal information (names, emails, departments, etc.)
 * - ONLY store external_id references in user_profiles table
 * - ALL person data comes from upstream People API
 * - Sync operations are READ-ONLY from external source
 * - UI must never show "Add Mentor" or "Add Student" buttons
 * - Forms must only allow selection from synced records
 * 
 * This ensures the People API remains the single source of truth
 * for all mentor and student master data.
 */

export const PEOPLE_DATA_CONSTRAINTS = {
  READ_ONLY: true,
  SOURCE_OF_TRUTH: 'External People API',
  ALLOWED_OPERATIONS: [
    'FETCH from API',
    'STORE external_id references', 
    'SYNC status updates',
    'VIEW cached data'
  ],
  FORBIDDEN_OPERATIONS: [
    'CREATE new person records',
    'EDIT personal information',
    'DELETE person records',
    'MODIFY master data'
  ]
} as const;