import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export';
export type AuditEntityType = 
  | 'assignment' 
  | 'counseling_session' 
  | 'goal' 
  | 'meeting_log' 
  | 'qa_question'
  | 'qa_answer'
  | 'attachment' 
  | 'system_setting'
  | 'user_profile';

interface AuditLogEntry {
  entity_type: AuditEntityType;
  entity_id: string;
  action: AuditAction;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  details?: Record<string, any>;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (entry: AuditLogEntry) => {
    if (!user) return;

    try {
      const auditEntry = {
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        action: entry.action,
        actor_id: user.id,
        actor_name: user.displayName || user.email || 'Unknown User',
        old_values: entry.old_values || null,
        new_values: entry.new_values || null,
        details: entry.details || null,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert([auditEntry]);

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }, [user]);

  const logCreate = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    newValues: Record<string, any>,
    details?: Record<string, any>
  ) => {
    return logAction({
      entity_type: entityType,
      entity_id: entityId,
      action: 'create',
      new_values: newValues,
      details
    });
  }, [logAction]);

  const logUpdate = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    details?: Record<string, any>
  ) => {
    return logAction({
      entity_type: entityType,
      entity_id: entityId,
      action: 'update',
      old_values: oldValues,
      new_values: newValues,
      details
    });
  }, [logAction]);

  const logDelete = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    oldValues: Record<string, any>,
    details?: Record<string, any>
  ) => {
    return logAction({
      entity_type: entityType,
      entity_id: entityId,
      action: 'delete',
      old_values: oldValues,
      details
    });
  }, [logAction]);

  const logView = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    details?: Record<string, any>
  ) => {
    return logAction({
      entity_type: entityType,
      entity_id: entityId,
      action: 'view',
      details
    });
  }, [logAction]);

  const logExport = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    details?: Record<string, any>
  ) => {
    return logAction({
      entity_type: entityType,
      entity_id: entityId,
      action: 'export',
      details
    });
  }, [logAction]);

  return {
    logCreate,
    logUpdate,
    logDelete,
    logView,
    logExport,
    logAction
  };
};

// Higher-order component to wrap operations with audit logging
export const withAuditLog = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  auditConfig: {
    entityType: AuditEntityType;
    action: AuditAction;
    getEntityId: (...args: T) => string;
    getValues?: (...args: T) => Record<string, any>;
    getDetails?: (...args: T) => Record<string, any>;
  }
) => {
  return async (...args: T): Promise<R> => {
    const result = await fn(...args);
    
    // Log after successful operation
    const auditLog = useAuditLog();
    await auditLog.logAction({
      entity_type: auditConfig.entityType,
      entity_id: auditConfig.getEntityId(...args),
      action: auditConfig.action,
      new_values: auditConfig.getValues?.(...args),
      details: auditConfig.getDetails?.(...args)
    });
    
    return result;
  };
};