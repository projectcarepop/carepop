# Security Logging Specification - Medical Records Download

## Overview
This document outlines the comprehensive logging strategy implemented for medical record downloads in the CarePoP system. All download activities are logged for security monitoring, compliance auditing, and incident investigation.

## Log Categories

### 1. User Downloads (`[USER_DOWNLOAD]`)
**Endpoint**: `GET /api/me/records/:recordId/download`
**Purpose**: Patient accessing their own medical documents

#### Log Events:
- **Request Initiation**: User requests download
- **Authorization Check**: Record ownership verification
- **File Access**: Document file retrieval
- **URL Generation**: Signed URL creation
- **Success/Failure**: Download outcome

#### Sample Log Entries:
```
[USER_DOWNLOAD] User 123e4567-e89b-12d3-a456-426614174000 (patient@example.com) requesting download for record abc-123
[USER_DOWNLOAD] User 123e4567-e89b-12d3-a456-426614174000 accessing record abc-123 (type: CLINICAL_DOCUMENT, appointment: def-456)
[USER_DOWNLOAD] File details: name='Lab Results - CBC.pdf', path='def-456/1234567890-lab-results.pdf', type='application/pdf'
[USER_DOWNLOAD] SUCCESS - User 123e4567-e89b-12d3-a456-426614174000 generated download for record abc-123 (Lab Results - CBC.pdf)
```

### 2. Admin Downloads (`[ADMIN_DOWNLOAD]`)
**Endpoint**: `GET /api/admin/records/:recordId/download`
**Purpose**: Admin/Manager accessing patient medical documents

#### Log Events:
- **Request Initiation**: Admin requests download with patient context
- **Record Verification**: Medical record existence check
- **Patient Information**: Associated patient and appointment details
- **File Type Handling**: Support for CLINICAL_DOCUMENT and PRESCRIPTION types
- **Audit Metadata**: Comprehensive download context

#### Sample Log Entries:
```
[ADMIN_DOWNLOAD] Admin 789e4567-e89b-12d3-a456-426614174000 (admin@clinic.com) requesting download for record abc-123
[ADMIN_DOWNLOAD] SUCCESS - Admin 789e4567-e89b-12d3-a456-426614174000 downloading record abc-123 (patient: 123e4567-e89b-12d3-a456-426614174000, type: CLINICAL_DOCUMENT)
```

### 3. File Upload Security (`[UPLOAD_DOC]`, `[UPLOAD_PRESCRIPTION]`)
**Purpose**: Document upload validation and security monitoring

#### Log Events:
- **Upload Initiation**: Admin uploading documents
- **File Validation**: Security checks and file validation
- **Security Warnings**: Suspicious file names or content
- **Storage Success**: Successful file storage confirmation

#### Sample Log Entries:
```
[UPLOAD_DOC] Admin 789e4567-e89b-12d3-a456-426614174000 (admin@clinic.com) uploading document
[UPLOAD_DOC] Details: appointmentId=def-456, documentName='X-Ray Results', fileName='xray-chest.pdf', fileSize=2048576, fileType='application/pdf'
[UPLOAD_DOC] SECURITY WARNING: Suspicious file name detected: ../../../malicious.exe by admin 789e4567-e89b-12d3-a456-426614174000
```

### 4. Client-Side Tracking (`[CLIENT_DOWNLOAD]`, `[CLIENT_ADMIN_DOWNLOAD]`)
**Purpose**: Frontend download initiation and outcome tracking

#### Log Events:
- **Download Initiation**: User/Admin starts download process
- **Success Confirmation**: Download link generated successfully
- **Error Tracking**: Failed download attempts with reasons

## Log Data Structure

### Required Fields for All Download Logs:
- **Timestamp**: ISO 8601 formatted timestamp
- **User ID**: UUID of the requesting user
- **User Email**: Email address for audit trail
- **Record ID**: UUID of the medical record
- **Action**: Specific action being performed
- **Outcome**: SUCCESS, FAILED, or ERROR

### Extended Fields for Admin Downloads:
- **Patient ID**: UUID of the patient whose record is accessed
- **Appointment ID**: Associated appointment context
- **Record Type**: CLINICAL_DOCUMENT, PRESCRIPTION, etc.
- **File Details**: Name, type, and size information

### Security-Specific Fields:
- **IP Address**: Client IP address (TODO: implement)
- **User Agent**: Browser/client information (TODO: implement)
- **Suspicious Activity Flags**: Security warnings and alerts

## Monitoring & Alerting

### Security Patterns to Monitor:
1. **Excessive Downloads**: Multiple downloads by same user/admin in short time
2. **Off-Hours Access**: Downloads outside normal business hours
3. **Suspicious File Names**: Files with path traversal or script indicators
4. **Failed Authorization**: Repeated failed access attempts
5. **Admin Cross-Patient Access**: Admins accessing multiple different patients

### Recommended Alert Thresholds:
- **High-Frequency Downloads**: >10 downloads per user per hour
- **Failed Authorizations**: >5 failed attempts per user per 15 minutes
- **Suspicious File Uploads**: Any file with security warnings
- **Admin Activity**: Any admin download activity (for compliance audit)

## Future Audit Log Implementation

### Planned Database Schema:
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    patient_id UUID, -- For admin actions on patient data
    outcome VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, ERROR
    metadata JSONB, -- Flexible additional data
    ip_address INET,
    user_agent TEXT,
    session_id UUID
);
```

### Benefits of Structured Audit Logs:
- **Compliance**: Meet DPA/HIPAA audit requirements
- **Security**: Detect unauthorized access patterns
- **Performance**: Query-optimized audit trails
- **Reporting**: Generate compliance reports
- **Incident Response**: Detailed forensic capabilities

## Compliance Considerations

### DPA (Data Protection Act) Requirements:
- Log all access to personal health information
- Retain audit logs for minimum required period
- Provide access logs to data subjects upon request
- Implement data retention policies

### HIPAA Requirements:
- Track all PHI access and downloads
- Maintain detailed audit trails
- Regular audit log reviews
- Incident detection and response

## Implementation Status

### ✅ Completed:
- Backend comprehensive logging for user and admin downloads
- File upload security logging with validation
- Client-side download tracking
- Structured log format with consistent prefixes
- Security warning detection for suspicious files

### 🔄 TODO (Future Improvements):
- Database audit log table implementation
- IP address and user agent tracking
- Automated monitoring and alerting
- Log aggregation and analysis tools
- Regular audit log reviews and reporting
- Data retention policy implementation 