import { db } from './db';
import { auditLogs } from '../../../drizzle/schema';

export interface AuditLogEntry {
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  patientId?: string;
  outcome: 'SUCCESS' | 'FAILED' | 'ERROR';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Log an audit event for compliance tracking
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      userEmail: entry.userEmail,
      userRole: entry.userRole,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      patientId: entry.patientId || null,
      outcome: entry.outcome,
      metadata: entry.metadata || null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      sessionId: entry.sessionId || null,
    });

    console.log(`[AUDIT_LOG] ${entry.outcome} - ${entry.userEmail} (${entry.userRole}) performed ${entry.action} on ${entry.resourceType}:${entry.resourceId}`);
  } catch (error) {
    console.error('[AUDIT_LOG] Failed to write audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Log successful admin download
 */
export async function logAdminDownload(params: {
  adminUserId: string;
  adminEmail: string;
  recordId: string;
  patientId: string;
  recordType: string;
  fileName: string;
  fileType?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAuditEvent({
    userId: params.adminUserId,
    userEmail: params.adminEmail,
    userRole: 'admin',
    action: 'DOWNLOAD_MEDICAL_RECORD',
    resourceType: 'medical_record',
    resourceId: params.recordId,
    patientId: params.patientId,
    outcome: 'SUCCESS',
    metadata: {
      recordType: params.recordType,
      fileName: params.fileName,
      fileType: params.fileType,
      downloadType: 'admin_access'
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log user download (patient accessing their own records)
 */
export async function logUserDownload(params: {
  userId: string;
  userEmail: string;
  recordId: string;
  recordType: string;
  fileName: string;
  fileType?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAuditEvent({
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: 'patient',
    action: 'DOWNLOAD_MEDICAL_RECORD',
    resourceType: 'medical_record',
    resourceId: params.recordId,
    patientId: params.userId, // User is downloading their own record
    outcome: 'SUCCESS',
    metadata: {
      recordType: params.recordType,
      fileName: params.fileName,
      fileType: params.fileType,
      downloadType: 'patient_access'
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log failed download attempt
 */
export async function logFailedDownload(params: {
  userId: string;
  userEmail: string;
  userRole: string;
  recordId: string;
  errorMessage: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAuditEvent({
    userId: params.userId,
    userEmail: params.userEmail,
    userRole: params.userRole,
    action: 'DOWNLOAD_MEDICAL_RECORD',
    resourceType: 'medical_record',
    resourceId: params.recordId,
    outcome: 'FAILED',
    metadata: {
      errorMessage: params.errorMessage,
      downloadType: params.userRole === 'admin' ? 'admin_access' : 'patient_access'
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Log file upload by admin
 */
export async function logFileUpload(params: {
  adminUserId: string;
  adminEmail: string;
  appointmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  recordType: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await logAuditEvent({
    userId: params.adminUserId,
    userEmail: params.adminEmail,
    userRole: 'admin',
    action: 'UPLOAD_MEDICAL_DOCUMENT',
    resourceType: 'medical_record',
    resourceId: params.appointmentId,
    outcome: 'SUCCESS',
    metadata: {
      fileName: params.fileName,
      fileType: params.fileType,
      fileSize: params.fileSize,
      recordType: params.recordType,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | undefined {
  // Check various headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) {
    return clientIP;
  }
  
  return undefined;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
} 