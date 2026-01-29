# Operational Runbooks Plan

This document provides a template and plan for creating operational runbooks for the Cloudflare Workers AI multi-tenant platform. Runbooks are a critical tool for ensuring that incidents are handled quickly, consistently, and with minimal impact.

## 1. Runbook Philosophy

- **Action-Oriented:** Runbooks should be checklists, not essays. Use clear, concise language and focus on the steps needed to resolve the issue.
- **Living Documents:** Runbooks will be continuously updated based on incident post-mortems and system changes.
- **Accessible:** All runbooks will be stored in a centralized location and easily accessible to the on-call team.

## 2. Runbook Template

Each runbook will follow this template:

---

### Runbook: [Alert Name]

- **Alert:** The name of the alert that triggered this runbook.
- **Severity:** `SEV-1` (Critical), `SEV-2` (High), `SEV-3` (Medium), `SEV-4` (Low)
- **Dashboard:** A link to the relevant monitoring dashboard.

#### 1. Triage & Diagnosis

1.  **[Step 1]** - A clear, concise step to take.
    - `code snippet or command to run`
    - *Expected outcome or what to look for.*
2.  **[Step 2]**
    - `...`
    - *...*

#### 2. Remediation

1.  **[Step 1]** - Steps to fix the issue.
    - `...`
    - *...*
2.  **[Step 2]**
    - `...`
    - *...*

#### 3. Escalation

- If the issue is not resolved after following the remediation steps, escalate to **[Team/Person]**.
- **Contact:** [Slack Channel/Email/Phone]

#### 4. Post-Mortem

- A link to the post-mortem document for this incident.

---

## 3. Initial Set of Runbooks

We will create the following runbooks as a starting point. This list will grow as we develop the platform and gain operational experience.

### 3.1. SEV-1 (Critical)

- **High API Error Rate:** Triggered when the percentage of 5xx errors on the `worker-api` exceeds a threshold.
- **AI Gateway Unreachable:** Triggered when we see a high rate of errors connecting to the AI Gateway.
- **Tenant Data Leak Suspected:** A manual trigger for a critical security incident.

### 3.2. SEV-2 (High)

- **High API Latency:** Triggered when the p95 latency on the `worker-api` exceeds a threshold.
- **Durable Object Errors:** Triggered when we see a high rate of errors from a Durable Object.
- **Vectorize Errors:** Triggered when we see a high rate of errors from Vectorize.

### 3.3. SEV-3 (Medium)

- **High Rate Limiting:** Triggered when a single tenant or IP is being excessively rate-limited.
- **Ingestion Pipeline Lag:** Triggered when the `ingest-worker` is falling behind on processing documents.
- **High AI Costs:** Triggered when a tenant's AI usage exceeds their budget.

## 4. Runbook Maintenance

- **Ownership:** The on-call team is responsible for maintaining the runbooks.
- **Review Cadence:** All runbooks will be reviewed and updated on a quarterly basis.
- **Post-Mortem Driven:** Every incident post-mortem must include an action item to update or create a runbook.
