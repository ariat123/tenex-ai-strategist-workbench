# Tenex AI Strategist Workbench

Candidate workbench built by Aria Tabatabai for the Tenex AI Strategist role.

## What This App Is

Tenex AI Strategist Workbench turns discovery input into a strategist readout: recommended first AI pilot, decision snapshot, build handoff, adoption path, and final brief.

It is designed as a lightweight internal-style workbench for one slice of the AI Strategist role: moving from discovery evidence to a bounded first workflow pilot that a strategist, deployment lead, or FDE could review.

It is not an internal Tenex tool and does not claim Tenex-private process knowledge.

## What It Does

- Starts on Discovery so the user can paste raw notes or prepare a focused discovery guide
- Provides a guided discovery path for preparing questions and capturing answers during a client conversation
- Structures messy notes into editable discovery facts, bottlenecks, evidence, and assumptions
- Ranks possible AI pilots with visible deterministic scoring
- Recommends a first bounded workflow intervention with a human review boundary
- Produces an adoption and rollout plan, build handoff, value measurement plan, and final brief
- Keeps example cases available in a collapsed optional section
- Saves the current workbench in browser localStorage only
- Exports the strategist brief as copyable text or Markdown

## How It Works

The product loop is:

```text
Discovery notes or guided answers -> decision snapshot -> first pilot -> build handoff -> final brief
```

The Discovery page supports two paths:

- `Start from notes`: paste raw notes from a client conversation, then structure them.
- `Prepare discovery guide`: enter light client context, use a focused question guide, capture messy answers, and send those answers into the same raw-notes synthesis flow.

The discovery guide is deterministic and context-aware. It adapts question language based on industry, workflow area, stakeholder role, and business goal. It does not use web research and does not create the final readout directly.

AI synthesis is used only to structure discovery notes. The workbench then applies transparent strategist logic:

- AI extracts facts, evidence, assumptions, risks, metrics, and candidate opportunities.
- The user reviews and edits the fields that affect the recommendation.
- The app ranks opportunities with deterministic scoring.
- The output remains editable and inspectable rather than becoming a black-box report.

Scoring uses seven 1-5 dimensions, where 5 is always stronger for a first pilot:

- ROI potential: 22%
- Data readiness: 16%
- Implementation ease: 16%
- Adoption ease: 14%
- Strategic leverage: 14%
- Risk containment: 8%
- Stakeholder urgency: 10%

If a measurement or reporting layer scores highly, the recommendation can still prefer the highest-ranked workflow intervention unless the context is explicitly reporting-led.

## Live Deployment Model

The final app is intended to run on Vercel.

There is no database, auth provider, user account system, analytics service, storage bucket, background worker, or server-side project store. Opportunity ranking, editing, browser save, optional example cases, brief download, and the final strategist brief work in the deployed app without persistent server storage.

AI synthesis is the only feature that needs server-side configuration.

## AI Synthesis Configuration

This app uses server-side environment variables for AI synthesis.

For the deployed Vercel app, configure these in:

`Vercel Project Settings -> Environment Variables`

Required for AI synthesis:

```text
OPENAI_API_KEY
```

Recommended for protecting public usage:

```text
SYNTHESIS_ACCESS_CODE
```

Optional:

```text
OPENAI_MODEL
```

Do not commit secrets to GitHub.

AI synthesis works only when `OPENAI_API_KEY` is configured. `SYNTHESIS_ACCESS_CODE` is optional but recommended; when set, the synthesis panel asks for the matching access code before the server calls OpenAI.

When `OPENAI_API_KEY` is not configured, the app still loads normally. Opportunity ranking, build handoff, adoption and rollout planning, value measurement, browser save, brief download, and optional example cases continue to work. The AI synthesis panel says that AI synthesis is not configured for this deployment.

## Example Cases

Example cases are intentionally secondary. They are available from the collapsed `Example cases` section in Discovery and are useful for exploring the workbench without entering notes.

Included example cases:

- National insurer
- Healthcare system
- Private equity portfolio operations
- Custom workflow outline

These cases are illustrative and editable. They are not Tenex-internal material.

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

## Walkthrough

Use this structure for a 5-7 minute Loom:

1. Open with the intent: this shows one slice of the AI Strategist role, turning messy discovery into a prioritized first pilot and FDE-ready build handoff.
2. Start on Discovery and explain the two paths: paste existing notes, or prepare a guided discovery conversation.
3. Briefly show the guided discovery path: enter company context, review tailored question groups, and capture messy answers.
4. Click `Use these answers as discovery notes`, or paste the QA fixture below into the notes path.
5. Enter the access code if required and structure the discovery notes.
6. Show that synthesis redirects to Decision snapshot so the strategist conclusion appears immediately.
7. Explain the Decision Snapshot: workflow, readiness, recommended first pilot, bottlenecks, assumptions, human review, and next action.
8. Return briefly to Discovery only if you need to show the post-synthesis review fields: validate core facts first, use advanced edits only when needed.
9. Open First pilot and explain why the recommendation is a bounded workflow intervention, not blind automation.
10. Open Build handoff and show the FDE implementation brief structure.
11. Open Final brief and copy or download the artifact.
12. Mention Opportunity ranking and Adoption & rollout as supporting sections for transparent scoring and usage planning.
13. If asked, open Opportunity ranking and explain the deterministic 1-5 scoring dimensions and weights.
14. Close with what would improve next with strategist or FDE feedback: scoring calibration, stronger evidence review, more workflow-specific validation, and integration into real implementation tooling.

QA fixture for AI synthesis:

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

## Disclosure

Candidate workbench built by Aria Tabatabai for the Tenex AI Strategist role. Based on public Tenex role language and public AI transformation materials. Includes optional example cases. Not an internal Tenex tool.
