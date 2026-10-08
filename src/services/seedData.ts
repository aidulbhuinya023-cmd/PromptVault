import { PromptItem } from '../types';

export const INITIAL_SEED_PROMPTS: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Senior Software Engineer: Pull Request Security & Quality Review',
    description: 'Deep-dive review on code diffs focusing on security vulnerabilities, edge-case coverage, time complexity, and API ergonomics.',
    promptText: `You are a Principal Software Engineer and Staff Security Reviewer at our organization.
Perform an exhaustive code review of the following pull request:

### Pull Request Context
- Repository/Service: {{service_name}}
- Primary Language & Framework: {{tech_stack}}
- Performance SLA: {{latency_slo}}

### Code Diff / Implementation
\`\`\`
{{code_diff}}
\`\`\`

### Review Directives
1. **Security Vulnerabilities**: Inspect for OWASP Top 10, SQL/command injections, authorization flaws, sensitive data leaks in logs, and insecure deserialization.
2. **Algorithmic Complexity & Scale**: Evaluate memory footprint and compute complexity. Identify potential N+1 queries, unindexed lookups, or race conditions.
3. **Idiomatic Clean Architecture**: Evaluate testability, loose coupling, idempotency, and error propagation.
4. **Actionable Suggestions**: Provide refactored code snippets with concrete rationale.`,
    category: 'Engineering',
    targetTools: ['Claude', 'ChatGPT', 'Gemini'],
    tags: ['Code Review', 'Security', 'Architecture', 'TypeScript', 'Go'],
    variables: ['service_name', 'tech_stack', 'latency_slo', 'code_diff'],
    systemInstruction: 'Act as a pragmatic, highly experienced Staff Software Engineer. Be precise, candid, and provide copy-pasteable improved code blocks.',
    temperature: 0.2,
    exampleOutput: '## Security Assessment: PASS WITH ADVISORY\n- Line 42: Potential unhandled promise rejection under timeout...\n- Recommendation: Implement exponential backoff with jitter...',
    tips: 'Best used with Claude 3.5 Sonnet or Gemini 3.1 Pro for large context windows up to 200k tokens.',
    authorId: 'system_admin',
    authorName: 'Engineering Platform Team',
    authorEmail: 'platform-leads@company.internal',
    isStaffPick: true,
    isVerified: true,
    ratingAverage: 4.9,
    ratingCount: 38,
    favoritesCount: 74,
    copyCount: 285,
  },
  {
    title: 'Enterprise RFP & Proposal Response Generator',
    description: 'Transform customer RFPs into compelling, compliant, and security-validated responses aligned with company brand standards.',
    promptText: `You are our Enterprise Bid & Solutions Director.
Draft a rigorous proposal response to the following customer RFP requirement:

### Customer Context
- Prospective Client: {{client_name}}
- Industry Sector: {{industry}}
- RFP Question / Requirement:
"""
{{rfp_requirement}}
"""

### Our Solution Differentiators
- Core Strengths: {{our_advantages}}
- Compliance Certifications: SOC 2 Type II, ISO 27001, GDPR, HIPAA
- Deployment Model: Private VPC / Dedicated Single-Tenant

### Response Structure
1. **Executive Summary Statement**: Direct compliance verification and core value proposition.
2. **Technical & Operational Solution**: Step-by-step description of how our platform satisfies the specification.
3. **Enterprise Security & Reliability**: Data residency, encryption standards, and uptime guarantees.
4. **Customer Proof Point**: Reference metric illustrating proven success.`,
    category: 'Sales',
    targetTools: ['ChatGPT', 'Claude'],
    tags: ['RFP', 'Enterprise Sales', 'Proposals', 'Compliance'],
    variables: ['client_name', 'industry', 'rfp_requirement', 'our_advantages'],
    systemInstruction: 'Adopt a confident, authoritative enterprise sales tone that reassures risk-averse procurement evaluators.',
    temperature: 0.4,
    exampleOutput: '### Executive Summary\nOur enterprise platform natively satisfies Acme Corp\'s multi-region failover requirement...',
    tips: 'Include specific customer pain points in {{rfp_requirement}} to yield customized value messaging.',
    authorId: 'system_admin',
    authorName: 'Solutions Architecture Team',
    authorEmail: 'sales-eng@company.internal',
    isStaffPick: true,
    isVerified: true,
    ratingAverage: 4.8,
    ratingCount: 22,
    favoritesCount: 49,
    copyCount: 164,
  },
  {
    title: 'Product Requirements Document (PRD) Synthesizer',
    description: 'Convert scattered user feedback, stakeholder desires, and market signals into a structured, engineer-ready 1-pager PRD.',
    promptText: `You are a Principal Product Manager.
Translate the following raw feature brief into a high-clarity Product Requirements Document (PRD):

### Input Context
- Proposed Feature Name: {{feature_name}}
- Target Persona: {{target_persona}}
- Raw Problem Statement & User Quotes:
"""
{{user_problem}}
"""
- Strategic Goal & North Star Metric: {{target_kpi}}

### PRD Framework
1. **Problem Statement & "Why Now?"**: The specific customer friction and business opportunity cost.
2. **Target Personas & User Stories**: "As a [persona], I want to [action], so that [outcome]."
3. **In-Scope vs. Out-of-Scope (Strict Non-Goals)**: Clear boundary lines for v1.
4. **Functional Requirements Table**: ID, User Story, P0/P1 Priority, Acceptance Criteria.
5. **Success Metrics & Analytics Events**: Key conversion milestones and tracking specifications.
6. **Technical & Security Considerations**: Latency constraints, data privacy, and rollback strategies.`,
    category: 'Product',
    targetTools: ['ChatGPT', 'Claude', 'Gemini'],
    tags: ['PRD', 'Product Management', 'Specs', 'Agile'],
    variables: ['feature_name', 'target_persona', 'user_problem', 'target_kpi'],
    systemInstruction: 'Think like a veteran Head of Product at Stripe or Linear. Ruthlessly cut fluff; emphasize clear acceptance criteria.',
    temperature: 0.3,
    exampleOutput: '# PRD: Real-time Multi-Seat Workspace Permissions\n\n## 1. Problem Statement...',
    tips: 'Share the generated output directly in Linear or Notion for sprint planning.',
    authorId: 'system_admin',
    authorName: 'Product Operations',
    authorEmail: 'product-ops@company.internal',
    isStaffPick: true,
    isVerified: true,
    ratingAverage: 4.9,
    ratingCount: 45,
    favoritesCount: 89,
    copyCount: 312,
  },
  {
    title: 'Customer Success Escalation & Incident De-escalator',
    description: 'Craft empathetic, transparent, and legally sound communications to enterprise clients during major system disruptions.',
    promptText: `You are our VP of Customer Success.
Draft a calm, transparent, and reassuring incident communication to our key enterprise stakeholders:

### Incident Details
- Incident Severity & Impact: {{incident_severity}}
- Affected Capabilities: {{affected_services}}
- Root Cause (High-Level): {{root_cause_summary}}
- Mitigation & ETA: {{eta_fix}}
- Customer Contact / Tier: {{client_tier}}

### Guidelines
- Express genuine empathy without making premature liability admissions.
- Provide clear workarounds if available.
- Establish an explicit next status update time window.
- Reiterate our commitment to high reliability.`,
    category: 'Customer Support',
    targetTools: ['ChatGPT', 'Claude'],
    tags: ['Customer Success', 'Incident Management', 'Crisis Comms'],
    variables: ['incident_severity', 'affected_services', 'root_cause_summary', 'eta_fix', 'client_tier'],
    temperature: 0.3,
    exampleOutput: 'Dear Partner,\nWe are writing to provide a transparent update regarding the intermittent degradation observed...',
    tips: 'Pair with our incident command center status page URL.',
    authorId: 'system_admin',
    authorName: 'Support Operations',
    authorEmail: 'cs-leads@company.internal',
    isStaffPick: false,
    isVerified: true,
    ratingAverage: 4.7,
    ratingCount: 19,
    favoritesCount: 34,
    copyCount: 98,
  },
  {
    title: 'High-Impact B2B Product Marketing Launch Campaign',
    description: 'Generate multi-channel launch collateral: LinkedIn announcement, changelog entry, customer email digest, and value messaging matrix.',
    promptText: `You are our Head of Growth & Product Marketing.
Create a complete multi-channel go-to-market campaign for our upcoming feature release:

### Product Release Details
- Feature Name: {{feature_name}}
- Target Market / Customers: {{target_audience}}
- Top 3 Key Differentiators: {{top_benefits}}
- Call to Action: {{primary_cta}}

### Required Deliverables
1. **Value Proposition Hierarchy**: Hook, Primary Value Proposition, Supporting Pillars.
2. **Executive LinkedIn Post**: Punchy, insight-driven, with hook line and engagement question.
3. **Changelog Post**: Clear, technical yet accessible summary with bulleted capabilities.
4. **Customer Announcement Email**: Subject lines (3 variations with estimated open rate rationale), body copy, and secondary CTA.`,
    category: 'Marketing',
    targetTools: ['ChatGPT', 'Claude', 'Gemini'],
    tags: ['Marketing', 'Product Launch', 'Copywriting', 'Changelog'],
    variables: ['feature_name', 'target_audience', 'top_benefits', 'primary_cta'],
    temperature: 0.7,
    exampleOutput: '### Value Proposition Hierarchy\nStop drowning in manual data pipelines...',
    tips: 'Test temperature at 0.7 for creative flair, then 0.3 when finalizing technical changelogs.',
    authorId: 'system_admin',
    authorName: 'Growth Marketing',
    authorEmail: 'marketing@company.internal',
    isStaffPick: true,
    isVerified: true,
    ratingAverage: 4.8,
    ratingCount: 29,
    favoritesCount: 62,
    copyCount: 220,
  },
  {
    title: 'SQL & Database Query Optimizer with Execution Plan Audit',
    description: 'Diagnose slow SQL queries, rewrite joins and subqueries, recommend optimal composite indexing strategies, and minimize disk I/O.',
    promptText: `You are our Staff Database Administrator and Performance Specialist.
Analyze and optimize the following SQL query for high-throughput enterprise scale:

### Database Engine & Table Schema
- Database: {{db_engine}} (e.g., PostgreSQL 16, MySQL 8, Snowflake)
- Table Sizes & Indexes:
"""
{{table_metadata}}
"""

### Slow Query
\`\`\`sql
{{slow_query}}
\`\`\`

### Execution Directives
1. **Bottleneck Diagnosis**: Highlight full-table scans, temporary disk spillage, suboptimal joins, or filter pushdown failures.
2. **Rewritten Query**: Provide rewritten SQL using CTEs, window functions, or partitioned scans where advantageous.
3. **Recommended Index Strategy**: DDL commands for creating exact B-tree, GiST, or partial composite indexes.
4. **Estimated Performance Multiplier**: Projected runtime and cost improvement.`,
    category: 'Engineering',
    targetTools: ['Claude', 'Gemini', 'ChatGPT'],
    tags: ['SQL', 'PostgreSQL', 'Performance', 'Database'],
    variables: ['db_engine', 'table_metadata', 'slow_query'],
    temperature: 0.1,
    exampleOutput: '### 1. Bottleneck Analysis\nThe correlated subquery forces an O(N*M) nested loop join...\n\n### 2. Optimized SQL...',
    tips: 'Works best when you paste the output of EXPLAIN (ANALYZE, BUFFERS) into {{table_metadata}}.',
    authorId: 'system_admin',
    authorName: 'Data Infrastructure Team',
    authorEmail: 'data-eng@company.internal',
    isStaffPick: false,
    isVerified: true,
    ratingAverage: 4.9,
    ratingCount: 31,
    favoritesCount: 81,
    copyCount: 247,
  }
];
