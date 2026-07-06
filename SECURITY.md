# 🔐 Security Documentation — FIFA StadiumIQ 2026

## Overview

This document outlines the security measures implemented in FIFA StadiumIQ 2026, following OWASP Top 10 guidelines.

---

## Security Controls

### 1. Input Validation & Sanitization
- All user inputs sanitized via `lib/utils.ts#sanitizeInput()`
- HTML entity encoding for `<>'"&` characters
- Maximum input length of 2000 characters enforced
- Zod schema validation on all API endpoints

### 2. Rate Limiting
- In-memory rate limiting on all AI API routes
- AI chat: 15 requests/minute per IP
- Emergency: 5 requests/minute per IP
- Sliding window algorithm with IP-based keys

### 3. HTTP Security Headers (next.config.js)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(self), geolocation=(self)
Content-Security-Policy: (strict policy)
```

### 4. Authentication & Authorization
- Role-based access control (fan, organizer, volunteer, security, staff, transport)
- Supabase Auth for session management
- Server-side role validation on protected routes

### 5. API Security
- CORS headers configured
- Environment variables never exposed to client
- API keys server-side only
- No sensitive data in URL parameters

### 6. Data Protection
- Supabase Row-Level Security (RLS) policies
- No PII logged to console
- GDPR-compliant data handling

---

## OWASP Top 10 Mapping

| OWASP | Control |
|-------|---------|
| A01 Broken Access Control | RBAC, Supabase RLS |
| A02 Cryptographic Failures | HTTPS only, Supabase encryption |
| A03 Injection | Input sanitization, Zod validation |
| A04 Insecure Design | Security-first architecture |
| A05 Security Misconfiguration | Hardened headers, CSP |
| A06 Vulnerable Components | npm audit in CI |
| A07 Auth Failures | Supabase Auth, rate limiting |
| A08 Integrity Failures | HTTPS, no CDN for scripts |
| A09 Logging Failures | Error logging without PII |
| A10 SSRF | No user-controlled URLs in fetch |

---

## Reporting Vulnerabilities

Please report security vulnerabilities to: security@stadiumiq.example.com
