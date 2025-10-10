# Mentor-Mentee Assignment Cycle Management System

## Overview
A comprehensive yearly assignment cycle management system with strict controls, validation, and audit trails.

## Key Features Implemented

### 1. Assignment Cycles (Yearly Management)
- **Academic Year Cycles**: Create and manage assignment cycles tied to academic years (e.g., "2024-2025")
- **Cycle Statuses**: 
  - `draft` - Being prepared
  - `active` - Currently accepting assignments
  - `locked` - No changes allowed (permanent for the year)
  - `archived` - Past cycles
- **Lock Mechanism**: Once locked, NO changes can be made to any assignments in that cycle

### 2. Super Admin Controls
- **ONLY Super Administrators** can:
  - Create assignment cycles
  - Create mentor-mentee assignments
  - Lock/unlock cycles
  - Make any changes to assignments
- Regular users and admins can only VIEW assignments

### 3. Validation & Constraints
All assignments are automatically validated to ensure:
- **Same Institution**: Mentor and student from same institution
- **Same Department**: Mentor and student from same department  
- **Same Program**: Student must be in a program compatible with mentor's department
- **No Duplicates**: Each student can only have ONE active assignment per cycle
- **Cycle Status**: Cannot create assignments in locked cycles

### 4. Comprehensive Audit Trail
Every change is automatically logged:
- Assignment creation
- Assignment updates
- Mentor reassignments
- Status changes
- Lock/unlock events
- Actor (who made the change)
- Timestamp
- Old and new values
- Change reason

### 5. Database Security (RLS)
- Super admins: Full access
- Mentors: Can view their own assignments and history
- Students: Can view their own assignments
- All operations require authentication
- Locked assignments cannot be modified by anyone

## Usage Workflow

### For Super Administrators:

1. **Create an Assignment Cycle** (Start of Academic Year)
   ```
   - Go to Assignments → Assignment Cycles tab
   - Click "Create New Cycle"
   - Enter: Academic Year (e.g., "2024-2025")
   - Enter: Cycle Name (e.g., "Academic Year 2024-2025 Assignment Cycle")
   - Select: Start Date and End Date
   - Set: Initial Status (draft or active)
   - Click "Create Cycle"
   ```

2. **Activate the Cycle**
   ```
   - Find the cycle in the list
   - Click "Activate" button
   - Only ONE cycle can be active at a time
   ```

3. **Create Assignments (Bulk or Individual)**
   ```
   - Go to Assignments tab
   - Click "Create Assignment"
   - Select Mentor (validates department automatically)
   - Select Students (only shows students from same department)
   - System validates:
     * Same institution/department
     * No existing assignment in cycle
     * Cycle is not locked
   - Create assignments
   ```

4. **Lock the Cycle** (Once Assignments are Finalized)
   ```
   - Go to Assignment Cycles tab
   - Find the active cycle
   - Click "Lock Cycle"
   - Confirm the action
   - ⚠️ THIS IS PERMANENT - No changes allowed after this!
   ```

5. **View Audit History**
   ```
   - Click on any assignment
   - View "History" tab
   - See all changes: who, when, what changed
   ```

## Database Tables Created

### 1. `assignment_cycles`
Tracks yearly assignment periods with lock mechanisms
- `academic_year` (unique) - e.g., "2024-2025"
- `cycle_name` - Descriptive name
- `start_date`, `end_date` - Date range
- `status` - draft | active | locked | archived
- `is_locked` - Boolean flag
- `locked_at`, `locked_by` - Lock timestamp and user

### 2. `assignment_history`
Comprehensive audit trail for all changes
- `assignment_id` - Link to assignment
- `cycle_id` - Link to cycle
- `action_type` - created | updated | reassigned | ended | locked | unlocked
- `changed_by` - User who made the change
- `changed_at` - Timestamp
- `old_values`, `new_values` - Full state before/after
- `change_reason` - Why the change was made

### 3. Updated `assignments` table
Added columns:
- `cycle_id` - Link to assignment cycle
- `is_locked` - Boolean flag
- `locked_at` - Lock timestamp
- `institution` - Institution name
- `department` - Department name
- `program` - Program name

## Database Functions

### `validate_assignment_constraints()`
Validates mentor-student compatibility:
- Same institution check
- Same department check  
- Duplicate assignment check
- Cycle lock status check
Returns: `is_valid`, `error_message`, and details

### `is_super_admin()`
Checks if user has super_admin role
Used in RLS policies to restrict access

### `log_assignment_change()` (Trigger)
Automatically logs all assignment changes
Fired on INSERT, UPDATE, DELETE

## Views

### `assignments_with_validation`
Enhanced view showing:
- Assignment details
- Cycle information
- Student and mentor names
- Department matching status
- Lock status
- Validation status

## Security Implementation

### Row Level Security (RLS) Policies:

**assignment_cycles:**
- Super admins: Full access (manage)
- All authenticated: Read access (view)

**assignment_history:**
- Super admins: Full access (view all)
- Mentors: View their own assignment history
- System: Insert access (for triggers)

**assignments:**
- Super admins: Create and update (only if not locked)
- All authenticated: View access
- Locked assignments: NO updates allowed

## Best Practices

### Do's:
✅ Create ONE cycle per academic year
✅ Validate all assignments before locking
✅ Lock the cycle once assignments are finalized
✅ Review audit logs regularly
✅ Use bulk operations for large-scale assignments
✅ Communicate lock dates to all users in advance

### Don'ts:
❌ Don't create multiple active cycles
❌ Don't lock a cycle prematurely
❌ Don't try to modify locked assignments
❌ Don't assign across different departments
❌ Don't create assignments without an active cycle
❌ Don't delete cycles with assignments

## Error Messages & Troubleshooting

### "No Active Cycle"
**Problem**: Trying to create assignment without active cycle
**Solution**: Create and activate a cycle first

### "Student already has an active assignment"
**Problem**: Attempting to assign same student twice in one cycle
**Solution**: End existing assignment first or use reassignment

### "Mentor and student must be from same department"
**Problem**: Cross-department assignment attempt
**Solution**: Select mentor from same department

### "Assignment cycle is locked"
**Problem**: Trying to modify locked cycle
**Solution**: Cycles cannot be unlocked once locked (by design)

### "Access Denied - Only super admins"
**Problem**: Non-super-admin trying to manage assignments
**Solution**: Contact super administrator

## Future Enhancements (Not Yet Implemented)
- Email notifications for assignments
- Bulk import via CSV
- Assignment templates
- Student preferences/requests
- Mentor workload balancing
- Mid-year reassignment workflows
- Reporting dashboard
- Export to PDF/Excel

## Technical Notes
- Uses PostgreSQL triggers for audit logging
- Implements database-level validation
- RLS enforced at database level
- All operations are transactional
- Locked assignments are immutable
- History is preserved indefinitely

## Support & Contact
For issues or questions:
1. Check audit logs first
2. Review validation messages
3. Verify user role (super_admin required)
4. Contact system administrator

---

**Last Updated**: 2025-10-10
**Version**: 1.0.0
**Status**: Production Ready