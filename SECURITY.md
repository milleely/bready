# Security Policy

## Supported Versions

We release security updates for the following versions of Bready:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Bready seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please DO NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities by:

1. **Email**: Send details to [maintainer email - update this]
2. **Subject Line**: Start with `[SECURITY]` followed by a brief description
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if applicable)
   - Your contact information

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Initial Assessment**: We'll provide an initial assessment within 5 business days
- **Updates**: We'll keep you informed of progress toward a fix
- **Disclosure**: We'll work with you on coordinated disclosure timing
- **Credit**: We'll acknowledge your responsible disclosure (unless you prefer anonymity)

### Security Vulnerability Response Process

1. **Triage** (1-2 days): Verify and assess severity
2. **Fix Development** (3-7 days): Develop and test fix
3. **Release** (1-2 days): Deploy fix to production
4. **Disclosure** (After release): Publish security advisory

## Security Best Practices

### For Users

#### Environment Variables
- **NEVER** commit `.env` files to version control
- Use `.env.local` for local development (auto-ignored by git)
- Rotate all API keys immediately if exposed
- Use different keys for development and production

#### API Keys
- **Clerk Keys**:
  - Use test keys (`pk_test_`, `sk_test_`) for development
  - Use production keys (`pk_live_`, `sk_live_`) for production
  - Set up [Clerk security settings](https://clerk.com/docs/security)
- **OpenAI Keys**:
  - Set usage limits in OpenAI dashboard
  - Monitor API usage regularly
  - Rotate keys quarterly
- **Database Credentials**:
  - Use strong, unique passwords
  - Enable SSL/TLS connections
  - Restrict access to specific IP addresses when possible

#### Deployment
- Enable Vercel's [deployment protection](https://vercel.com/docs/security/deployment-protection)
- Use environment-specific secrets (never hardcode)
- Enable HTTPS everywhere (enforced by Vercel)
- Review security headers in `next.config.js`

### For Contributors

#### Code Security
- Use Prisma ORM (never write raw SQL queries)
- Validate and sanitize all user inputs
- Use TypeScript strict mode
- Follow authentication patterns in existing API routes

#### Authentication & Authorization
- Always check authentication BEFORE processing requests
- Verify household membership for all data operations
- Use `getHouseholdId()` helper for data scoping
- Never expose user data across households

#### Dependency Management
- Run `npm audit` before committing
- Keep dependencies updated monthly
- Review security advisories for dependencies
- Use `npm audit fix` to auto-fix vulnerabilities

## Known Security Considerations

### Handled
- ✅ **SQL Injection**: Protected by Prisma ORM
- ✅ **XSS**: React auto-escapes rendered content
- ✅ **CSRF**: Next.js has built-in CSRF protection
- ✅ **Authentication**: Clerk provides enterprise-grade auth
- ✅ **Multi-tenancy**: Household isolation prevents data leaks
- ✅ **File Uploads**: Whitelist validation + size limits

### Requires User Action
- ⚠️ **Rate Limiting**: Not implemented by default (see docs)
- ⚠️ **API Key Rotation**: Should be done manually/regularly
- ⚠️ **Monitoring**: Set up alerts for suspicious activity
- ⚠️ **Backups**: Configure database backups

## Security Features

### Authentication (Clerk)
- Email/password authentication
- Multi-factor authentication (MFA) support
- Session management
- Social OAuth providers (Google, GitHub)
- Webhook support for user sync

### Authorization
- Household-based multi-tenancy
- Server-side authorization checks
- Protected API routes with middleware
- Row-level security via Prisma queries

### Data Protection
- HTTPS enforced in production
- Secure session cookies
- Password hashing (handled by Clerk)
- Database encryption at rest (provider-dependent)

### File Upload Security
- File type whitelist (JPEG, PNG, PDF only)
- Size limits (5MB maximum)
- Extension validation
- Unique file naming (prevents collisions)

## Security Audit History

- **October 2025**: Initial security audit completed
- **Findings**: See [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)

## Compliance

### GDPR Compliance
This application collects minimal personal data:
- Email addresses (via Clerk authentication)
- Expense data (financial transactions)

**User Rights**:
- Right to access data (export functionality planned)
- Right to deletion (contact maintainer)
- Right to portability (export functionality planned)

### Data Retention
- Active household data: Retained indefinitely
- Deleted accounts: Data removed within 30 days
- Audit logs: Retained for 90 days

## Security Contacts

- **Maintainer**: [Update with your contact info]
- **Security Issues**: [security@yourdomain.com]
- **General Support**: [Create a GitHub issue](https://github.com/milleely/bready/issues)

## Hall of Fame

We'd like to thank the following individuals for responsibly disclosing security vulnerabilities:

- (None yet - be the first!)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Clerk Security Documentation](https://clerk.com/docs/security)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Vercel Security](https://vercel.com/docs/security)

---

**Last Updated**: 2025-10-17
**Next Review**: 2026-01-17 (Quarterly)
