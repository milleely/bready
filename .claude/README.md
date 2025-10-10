# Claude Code Agent System

This directory contains specialized AI agents and workflows for the Bready project.

## Directory Structure

```
.claude/
├── agents/              # Agent configurations
│   ├── security-agent.md
│   └── performance-agent.md
├── commands/            # Slash commands
│   ├── security.md
│   └── performance.md
├── workflows/           # Agent workflows
│   ├── security-workflow.md
│   └── performance-workflow.md
└── README.md           # This file
```

## Available Agents

### 🔒 Security Agent
**Purpose:** Comprehensive security audits focused on Next.js 15 + Prisma security patterns

**Slash Command:** `/security`

**Key Responsibilities:**
- Authentication & authorization analysis
- Input validation review
- API security audit
- Data protection analysis
- Prisma-specific security checks
- Dependency vulnerability scanning

**When to Use:**
- Before committing API route changes
- After modifying Prisma schema
- Before production deployment
- Monthly security reviews

**Documentation:** `.claude/agents/security-agent.md`

**Workflow:** `.claude/workflows/security-workflow.md`

---

### ⚡ Performance Agent
**Purpose:** Ensure Bready meets all performance targets defined in PRD

**Slash Command:** `/performance`

**Performance Targets:**
- Dashboard load: < 2 seconds
- API responses: < 500ms
- Chart rendering: < 1 second
- Bundle size: < 500KB (gzipped)

**Key Responsibilities:**
- Page load performance analysis
- API response time optimization
- Client-side rendering performance
- Database query optimization
- Bundle size analysis
- Memory leak detection

**When to Use:**
- After implementing new features
- Before production deployment
- After Prisma schema changes
- Monthly performance reviews

**Documentation:** `.claude/agents/performance-agent.md`

**Workflow:** `.claude/workflows/performance-workflow.md`

---

## Slash Commands

### `/security`
Triggers a comprehensive security review of the codebase.

**Usage:**
```
/security
```

**Output Format:**
- 🔴 Critical Issues (immediate fix)
- 🟠 High Priority (fix before release)
- 🟡 Medium Priority (address soon)
- 🟢 Best Practices (nice to have)
- ✅ Security Strengths (what's working well)

---

### `/performance`
Triggers a comprehensive performance audit of the application.

**Usage:**
```
/performance
```

**Output Format:**
- 🔴 Critical Performance Issues (blocking UX)
- 🟠 High Priority Optimizations (before release)
- 🟡 Medium Priority Improvements (when capacity allows)
- 🟢 Low Priority Optimizations (nice to have)
- ✅ Performance Strengths (what's working well)

---

## Workflows

### Security Workflow

**Automated Triggers:**
- API file changes detected in git
- Prisma schema modifications
- Pre-deployment checks

**Manual Triggers:**
- Phase completion reviews
- Monthly security audits
- New feature implementations

**Key Checkpoints:**
1. Pre-commit review for API changes
2. Schema change security analysis
3. Phase completion audit
4. Pre-deployment review
5. Monthly security review

**See:** `.claude/workflows/security-workflow.md`

---

### Performance Workflow

**Automated Triggers:**
- New feature implementation
- Bundle size changes
- API route modifications

**Manual Triggers:**
- Pre-deployment audits
- Component optimization reviews
- Monthly performance reviews

**Key Checkpoints:**
1. Post-feature performance review
2. Pre-deployment performance audit
3. Prisma schema performance analysis
4. Component optimization review
5. Monthly performance tracking

**See:** `.claude/workflows/performance-workflow.md`

---

## How to Create Custom Slash Commands

1. Create a markdown file in `.claude/commands/`
2. Name it `your-command.md`
3. Write the prompt/instructions in the file
4. Use it in conversation: `/your-command`

**Example:**
```markdown
# My Custom Command

This command does X, Y, and Z.

## Instructions
1. First do this...
2. Then do that...

## Output Format
- Provide results in this format...
```

---

## How to Create Custom Agents

1. Create a markdown file in `.claude/agents/`
2. Name it `your-agent-name.md`
3. Define:
   - Agent purpose
   - Responsibilities
   - Workflow triggers
   - Output format
   - Success metrics

4. Optionally create a workflow file in `.claude/workflows/`

**Template:**
```markdown
# [Agent Name] Configuration

## Agent Purpose
[What this agent does]

## Agent Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]

## Workflow Triggers
- [When to run this agent]

## Output Format
[How results should be presented]

## Success Metrics
[How to measure agent effectiveness]
```

---

## Integration with Development Process

### Development Workflow
```
Write Code → Run Feature Tests → Run Agents → Fix Issues → Commit
```

### Deployment Workflow
```
Pre-deployment Audit → Security Review → Performance Review → Deploy
```

### Maintenance Workflow
```
Weekly: npm audit
Monthly: Full security + performance review
Quarterly: Architecture review
```

---

## Best Practices

### When to Run Security Agent
✅ **Always:**
- Before committing API changes
- Before production deployment
- After schema modifications

✅ **Regularly:**
- Monthly comprehensive audits
- After dependency updates

❌ **Don't:**
- Skip for "small" changes (they add up!)
- Ignore medium/low priority findings indefinitely

### When to Run Performance Agent
✅ **Always:**
- After implementing data-heavy features
- Before production deployment
- After adding dependencies

✅ **Regularly:**
- Monthly performance tracking
- After UI component changes

❌ **Don't:**
- Wait until users complain
- Ignore bundle size growth

---

## Metrics & Reporting

### Security Metrics
Track in monthly reports:
- Issues found (by severity)
- Time to fix (average)
- False positive rate
- Dependency vulnerabilities

### Performance Metrics
Track in monthly dashboard:
- Page load time (trend)
- API response time (p50, p95, p99)
- Bundle size (trend)
- Database query counts

---

## Agent Training & Improvement

As you use these agents:

1. **Document false positives** - Update agent configs to reduce noise
2. **Add new patterns** - Enhance agents with new best practices
3. **Refine workflows** - Adjust triggers based on what works
4. **Share learnings** - Update documentation with lessons learned

---

## Future Agent Ideas

Consider creating agents for:
- **Accessibility Audit Agent** - WCAG compliance checking
- **Testing Coverage Agent** - Identify untested code paths
- **Documentation Agent** - Keep docs in sync with code
- **Code Review Agent** - Pre-PR code quality review
- **Migration Agent** - Help with framework/library upgrades

---

## Support & Questions

For questions about the agent system:
1. Read the agent configuration files in `.claude/agents/`
2. Review workflow documentation in `.claude/workflows/`
3. Check PRD and CLAUDE.md for project context
4. Experiment with slash commands in conversation

---

**Last Updated:** 2025-10-10
**Version:** 1.0.0
