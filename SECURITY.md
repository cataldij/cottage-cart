# Security Documentation

## Overview

This document outlines the security measures implemented in the Conference OS application.

## Database Security

### Row Level Security (RLS)

All tables have Row Level Security enabled with comprehensive policies:

- **Profiles**: Users can view all profiles (for networking) but only update their own
- **Conferences**: Public conferences are viewable by all; private conferences only by members
- **Conference Members**: Users can only view members of conferences they belong to
- **Sessions/Tracks/Rooms**: Only visible to conference members; manageable by organizers
- **Messages**: Only visible to chat room members
- **Orders**: Users can only view their own orders
- **Announcements**: Visible to conference members; only organizers can create

### Audit Logging

All sensitive operations are logged in the `audit_logs` table:
- Conference creation/updates/deletion
- Conference member changes
- Order operations

Logs include:
- User ID
- Action (INSERT/UPDATE/DELETE)
- Table name
- Record ID
- Old and new data (JSONB)
- Timestamp

### Rate Limiting

**Database Level**: The `check_rate_limit()` function provides rate limiting:
```sql
SELECT check_rate_limit(
  'user@example.com',  -- identifier
  'create_conference',  -- action
  10,                   -- max requests
  60                    -- window (minutes)
);
```

**Application Level**: Middleware provides basic rate limiting (100 requests/minute per IP)

### Data Validation

Built-in validation functions:
- `is_valid_email(text)` - Email format validation
- `is_valid_url(text)` - URL format validation
- `sanitize_html(text)` - XSS prevention via HTML sanitization

### Security Helper Functions

- `is_conference_organizer(user_id, conference_id)` - Check organizer status
- `is_conference_member(user_id, conference_id)` - Check membership
- `get_conference_role(user_id, conference_id)` - Get user's role

## Application Security

### Middleware Protection

The middleware (`apps/web/middleware.ts`) implements:

1. **Authentication**:
   - Dashboard routes require authentication
   - Auth pages redirect to dashboard if already logged in
   - API routes require authentication (except `/api/public/*`)

2. **Rate Limiting**:
   - 100 requests per minute per IP address
   - Returns 429 (Too Many Requests) when exceeded

3. **Security Headers**:
   - `X-Frame-Options: DENY` - Prevents clickjacking
   - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
   - `X-XSS-Protection: 1; mode=block` - XSS filter
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` - Disables camera, microphone, geolocation, FLoC
   - `Strict-Transport-Security` (production only) - Forces HTTPS
   - `Content-Security-Policy` - Comprehensive CSP

### Content Security Policy (CSP)

The CSP restricts:
- Scripts to self, Vercel analytics, and inline (required for Next.js)
- Styles to self and inline
- Images to self, data URIs, and HTTPS sources
- Connections to self, Supabase, and Vercel
- No iframes (frame-ancestors: none)
- Upgrade insecure requests to HTTPS

### Authentication

Uses Supabase Auth with `@supabase/ssr` for:
- Cookie-based sessions (secure, httpOnly)
- Automatic session refresh
- Server-side and client-side authentication

## API Security

### Protected Routes

- All `/api/*` routes require authentication (except `/api/public/*`)
- Admin routes `/api/admin/*` verify user permissions
- Uses `getUser()` instead of `getSession()` for security (prevents JWT spoofing)

### Input Sanitization

- All user input in bios is automatically sanitized via database trigger
- HTML tags and scripts are stripped to prevent XSS

## Best Practices

### For Developers

1. **Never bypass RLS**: Always use the `authenticated` role, never `service_role` in client code
2. **Validate input**: Use validation functions before database operations
3. **Check permissions**: Use helper functions to verify user roles
4. **Log sensitive operations**: Add audit triggers to new sensitive tables
5. **Test RLS policies**: Verify users can only access their authorized data
6. **Use parameterized queries**: Never concatenate user input into SQL

### For Deployment

1. **Environment Variables**:
   - Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
   - Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client access
   - Set `NODE_ENV=production` in production

2. **HTTPS Only**:
   - Always use HTTPS in production
   - HSTS header enforces this

3. **Regular Updates**:
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Review Supabase security advisories

## Monitoring

### What to Monitor

1. **Audit Logs**: Review `audit_logs` table for suspicious activity
2. **Rate Limits**: Check `rate_limits` table for abuse patterns
3. **Failed Auth**: Monitor Supabase auth logs for brute force attempts
4. **Error Logs**: Check Vercel logs for security-related errors

### Security Checklist

- [ ] RLS enabled on all tables
- [ ] Audit logging on sensitive tables
- [ ] Rate limiting configured
- [ ] Input validation in place
- [ ] Security headers configured
- [ ] HTTPS enforced in production
- [ ] Service role key kept secret
- [ ] Dependencies up to date
- [ ] Regular security audits scheduled

## Incident Response

If a security issue is discovered:

1. **Assess Impact**: Determine what data/systems are affected
2. **Contain**: Pause affected systems if necessary
3. **Investigate**: Check audit logs for breach extent
4. **Remediate**: Fix the vulnerability
5. **Notify**: Inform affected users if required
6. **Document**: Update this document with learnings

## Reporting Security Issues

To report a security vulnerability, please email: security@conference-os.com

Do not open public issues for security vulnerabilities.

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security](https://vercel.com/docs/security/overview)

## Updates

- **2026-01-26**: Initial security implementation
  - Comprehensive RLS policies
  - Audit logging
  - Rate limiting
  - Input sanitization
  - Security headers
  - CSP policy
