# Security Review Workflow

This workflow defines when and how to trigger the Security Agent for the Bready application.

## Workflow Triggers

### 1. Pre-Commit Review (API Changes)
**When:** Before committing changes to any file in `app/api/`

**Steps:**
1. Detect API file changes: `git diff --cached --name-only | grep "app/api/"`
2. Run `/security` command
3. Review output for Critical (🔴) and High Priority (🟠) issues
4. Fix all Critical issues before committing
5. Document High Priority issues in GitHub Issues or todo list
6. Commit only after security review passes

**Example Git Hook:**
```bash
#!/bin/sh
# .git/hooks/pre-commit

API_FILES=$(git diff --cached --name-only | grep "app/api/")

if [ -n "$API_FILES" ]; then
    echo "🔒 API files changed. Running security review..."
    echo "Please run: /security"
    echo "Review findings and address critical issues before committing."
    exit 1
fi
```

### 2. Schema Change Review
**When:** After modifying `prisma/schema.prisma`

**Steps:**
1. Review cascade delete patterns
2. Check for unintended data exposure through relations
3. Verify proper indexes on security-relevant fields
4. Run `/security` command focusing on Prisma section
5. Create migration only after security review

**Checklist:**
- [ ] Cascade deletes are intentional
- [ ] No sensitive data exposed through relations
- [ ] Proper indexes on filtered/searched fields
- [ ] Foreign key constraints are correct

### 3. Phase Completion Review
**When:** Before marking any development phase as complete

**Steps:**
1. Run comprehensive `/security` audit
2. Create security findings document
3. Fix all Critical (🔴) issues
4. Plan High Priority (🟠) fixes for next sprint
5. Document Medium Priority (🟡) issues for backlog
6. Update PROGRESS.md with security status

**Required Criteria:**
- ✅ Zero critical security issues
- ✅ All High Priority issues documented
- ✅ Security strengths documented
- ✅ Dependencies checked with `npm audit`

### 4. Pre-Deployment Review
**When:** Before deploying to production or staging

**Steps:**
1. Run full security audit with `/security`
2. Run `npm audit` for dependency vulnerabilities
3. Review environment variables for exposed secrets
4. Check error handling doesn't expose stack traces
5. Verify CORS configuration if applicable
6. Document security posture in deployment notes

**Production Checklist:**
- [ ] No critical or high priority security issues
- [ ] All secrets in environment variables
- [ ] Error messages don't leak system info
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] API routes have proper error handling

### 5. New Feature Review
**When:** After implementing any new feature with user input or data storage

**Steps:**
1. Identify all new user input points
2. Review input validation implementation
3. Check database operations for injection risks
4. Run targeted `/security` review on new code
5. Document security considerations in PR description

**Focus Areas:**
- Input validation completeness
- Proper error handling
- Authorization checks (if applicable)
- Data sanitization before storage/display

### 6. Monthly Security Review
**When:** First Monday of each month

**Steps:**
1. Run comprehensive `/security` audit
2. Run `npm audit` and update dependencies
3. Review security log (if implemented)
4. Check for new CVEs affecting tech stack
5. Update security documentation
6. Plan security improvements for upcoming sprint

**Deliverables:**
- Monthly security report
- Updated dependency audit
- Security backlog prioritization
- Documentation updates

## Security Review Template

Use this template when documenting security reviews:

```markdown
# Security Review - [Feature/Phase Name]
**Date:** YYYY-MM-DD
**Reviewer:** [Name or "Security Agent"]
**Scope:** [What was reviewed]

## Findings

### 🔴 Critical Issues
[List or "None found"]

### 🟠 High Priority
[List or "None found"]

### 🟡 Medium Priority
[List or "None found"]

### ✅ Security Strengths
[What's working well]

## Actions Taken
- [List of fixes applied]

## Follow-Up Required
- [List of items for future sprints]

## Sign-Off
- [ ] All critical issues resolved
- [ ] High priority issues documented
- [ ] Ready for [commit/deployment/phase completion]
```

## Integration with Development Process

### During Development
1. **Write code** → Run feature-specific security check
2. **Before commit** → Run `/security` if API changed
3. **Create PR** → Include security review findings
4. **Before merge** → Ensure critical issues resolved

### During Deployment
1. **Pre-deployment** → Full security audit
2. **Environment setup** → Verify secrets management
3. **Post-deployment** → Smoke test security controls
4. **Monitoring** → Track security-relevant events

### During Maintenance
1. **Weekly** → Check `npm audit`
2. **Monthly** → Full security review
3. **Quarterly** → Penetration testing (if applicable)
4. **Annually** → Security architecture review

## Escalation Process

### Critical Security Issue Found
1. **Stop development** immediately
2. **Assess impact:** Is production affected?
3. **Fix immediately** or revert changes
4. **Document** issue and resolution
5. **Post-mortem:** How did this slip through?

### High Priority Issue Found
1. **Create GitHub Issue** with priority label
2. **Add to current sprint** if capacity allows
3. **Document workarounds** if not immediately fixable
4. **Track** in security backlog

### False Positive
1. **Document** why it's a false positive
2. **Update** security agent configuration if needed
3. **Add exception** to security documentation

## Success Metrics

Track these metrics over time:
- **Issues Found:** Count by severity
- **Time to Fix:** Average resolution time
- **False Positive Rate:** < 10%
- **Coverage:** % of code reviewed
- **Regression Rate:** Issues reoccurring

## Agent Training

As you use the Security Agent, update its configuration when:
- False positives are detected consistently
- New security patterns emerge
- Framework updates change security best practices
- New attack vectors become relevant

Update `.claude/agents/security-agent.md` with lessons learned.
