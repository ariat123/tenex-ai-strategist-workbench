# Tenex AI Strategist Workbench

Candidate prototype built by Aria Tabatabai for the Tenex AI Strategist role.

## What This App Is

Tenex AI Strategist Workbench is a production-deployed candidate prototype for turning discovery notes into a first AI pilot recommendation and implementation-ready handoff.

It is designed to feel like a lightweight internal strategy review surface: serious, editable, evidence-aware, and explainable. It is not a marketing page, a generic AI report generator, or an internal Tenex tool.

## What It Does

- Starts with a Decision Snapshot: client/workflow, readiness, recommended pilot, bottlenecks, assumptions, not-yet scope, and next action
- Supports synthetic demo scenarios for insurance, healthcare, private equity operations, and a custom workflow
- Optionally synthesizes pasted discovery notes into structured strategist outputs with AI
- Keeps generated outputs editable through a compact Discovery Review first, with deeper edits available only when needed
- Applies transparent deterministic scoring to rank opportunities
- Recommends a bounded first workflow pilot with explicit human review
- Produces an FDE handoff brief, adoption plan, value measurement plan, and Markdown strategist brief
- Saves the current workbench in browser localStorage only

## How It Works

The app has two operating modes:

- Demo mode uses synthetic preset scenarios and requires no environment variables.
- AI synthesis mode sends pasted discovery notes to a server-side Next.js route, structures them with the OpenAI Responses API, validates the model output, and then applies the app's deterministic scoring logic.

AI helps structure messy notes. The workbench decides how to rank opportunities using visible scoring weights and editable inputs.

Scoring is deterministic and local. Each opportunity is scored from 1 to 5, where 5 is always stronger for a first pilot:

- ROI potential: 22%
- Data readiness: 16%
- Implementation ease: 16%
- Adoption ease: 14%
- Strategic leverage: 14%
- Risk containment: 8%
- Stakeholder urgency: 10%

If a measurement or reporting layer scores highest, the recommendation can still prefer the highest-ranked workflow intervention unless the context is explicitly reporting-led.

## Live Deployment Model

The final app is intended to run on Vercel.

There is no database, auth provider, user account system, analytics service, storage bucket, or background worker. Demo scenarios, scoring, editing, local browser save, and Markdown export all work in the deployed app without server persistence.

AI synthesis is the only feature that needs server-side configuration.

## AI Synthesis Configuration

This app uses server-side environment variables for AI synthesis.

For the deployed Vercel app, configure these in:

`Vercel Project Settings -> Environment Variables`

Required for AI synthesis:

```text
OPENAI_API_KEY
```

Recommended for public demos:

```text
SYNTHESIS_ACCESS_CODE
```

Optional:

```text
OPENAI_MODEL
```

Do not commit secrets to GitHub.

Demo mode works without these variables. AI synthesis only works when `OPENAI_API_KEY` is configured. `SYNTHESIS_ACCESS_CODE` is optional but recommended for protecting public demo usage; when set, the synthesis panel asks for the matching AI demo code before the server calls OpenAI.

When `OPENAI_API_KEY` is not configured, the app still loads normally. Demo scenarios, scoring, FDE handoff, adoption plan, value measurement, local browser save, and Markdown export continue to work. The AI synthesis panel says that AI synthesis is not configured for this deployment.

## Demo Mode

Demo mode is the default fallback and is safe for public review.

It uses synthetic scenarios only:

- National insurer
- Healthcare system
- Private equity portfolio operations
- Custom workflow starting point

These scenarios are intentionally synthetic and editable. They let a reviewer understand the strategist workflow even when AI synthesis is disabled.

## What Is Intentionally Out Of Scope

- No authentication
- No database
- No user accounts
- No analytics
- No PDF export
- No file upload
- No team workspace
- No background jobs
- No complex project management workflow
- No autonomous workflow execution
- No Tenex-private claims or confidential methodology

## Demo Walkthrough

Use this structure for a 5-7 minute Loom:

1. Open with the intent: this shows one slice of the AI Strategist role, turning messy discovery into a prioritized first pilot and FDE-ready handoff.
2. Start on the Decision Snapshot and explain why the conclusion appears first.
3. Show the selected demo scenario and switch scenarios briefly.
4. Open Discovery Review and explain the progressive editing model: validate the few fields that affect the recommendation first, then use advanced edits only when needed.
5. If AI synthesis is configured, paste the sample note below and synthesize it. If not, state that demo mode is intentionally still useful without AI.
6. Open Scoring and explain the deterministic 1-5 dimensions and weights.
7. Open Pilot and explain why the first recommendation is a bounded workflow intervention, not blind automation.
8. Open Adoption and show stakeholder risks, assumptions to validate, and the 30/60/90 rollout.
9. Open FDE handoff and show the implementation brief structure.
10. Open Export and copy or download the Markdown strategist brief.
11. Close with what would improve next with strategist or FDE feedback: scoring calibration, stronger evidence review, more scenario-specific validation, and integration into real implementation tooling.

Sample messy discovery note for AI synthesis QA:

```text
Stakeholder notes from Acme Specialty Services discovery:
COO wants to reduce backlog in customer onboarding and stop losing revenue because new accounts sit in limbo. Ops director says the workflow owner is the onboarding operations manager. Baseline should be cycle time from signed contract to active account, rework rate, and manual review time. Compliance is nervous about anything that sends customer-facing messages or updates the system of record without review.

Operator notes:
Requests come from Salesforce after a deal closes, but the onboarding team also watches a shared intake inbox. Operators check Salesforce, NetSuite, the implementation tracker, customer email threads, and a manual tracking sheet. They classify the account, look for missing tax forms and billing contacts, assign the implementation owner, and draft follow-up emails. Edge cases go to a senior specialist in Slack.

Bottlenecks and constraints:
Missing billing contacts are often found late. Some customers have special contract terms that are buried in notes. Operators copy status between Salesforce and the tracking sheet. There is no clean exception queue. NetSuite access is limited, and write-back to Salesforce needs approval. Adoption concern: operators do not want another queue unless it saves time and managers can see override reasons.

Metrics mentioned:
Roughly 450 onboarding requests per month. Manual review takes 15-25 minutes per account. Current cycle time is inconsistent, estimated 6-10 business days. Target would be faster first-pass completeness checks, fewer rework loops, and clearer owner assignment. Human review should approve routing, missing-info requests, and any customer-facing follow-up before anything is sent or written back.
```

## Optional Local Development

Local development is optional private testing. The final app is intended to run on Vercel.

To test locally, create `.env.local` on your own machine with:

```text
OPENAI_API_KEY=...
SYNTHESIS_ACCESS_CODE=...
```

Then run:

```bash
npm install
npm run dev
```

Do not commit `.env.local` or any secrets.

## Prototype Disclosure

Candidate prototype built by Aria Tabatabai for the Tenex AI Strategist role. Based on public Tenex role language and public AI transformation materials. Uses synthetic scenarios only. Not an internal Tenex tool.
