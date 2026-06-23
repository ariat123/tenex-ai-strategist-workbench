import type { ScenarioPreset } from "@/lib/types";

export const scenarios: ScenarioPreset[] = [
  {
    id: "insurer",
    label: "National insurer",
    summary:
      "Claims intake, underwriting support, broker follow-up, and operational routing across high-volume service teams.",
    discoveryEvidence: [
      "Operators reconcile portal notes, email attachments, and policy context before routing.",
      "Escalations often happen through manager review instead of a consistent exception path.",
      "Broker follow-up depends on the intake specialist noticing missing information early.",
    ],
    assumptionsToValidate: [
      "Routing accuracy must be validated against override reasons before expansion.",
      "Guidewire, broker portal, and document records can be read with enough context for triage.",
      "Compliance will accept reviewed recommendations with source links and event history.",
    ],
    discovery: {
      companyName: "Northstar Mutual",
      domain: "Insurance",
      workflowName: "Claims intake and routing",
      workflowOwner: "Claims operations manager",
      baselineMetric: "Current intake handling time and routing rework rate",
      humanReviewPoint:
        "Intake specialist approves the routing recommendation before adjuster assignment or broker communication.",
      executiveGoal:
        "Reduce new-claim cycle time while improving routing quality and broker visibility.",
      stakeholderNotes:
        "Claims leadership wants faster triage without losing auditability. Compliance wants explainable routing. Broker service leaders care about follow-up consistency.",
      operatorNotes:
        "Intake specialists review emails, portal notes, policy data, and attachments before deciding claim type, severity, and owner. Complex cases are escalated through Slack and manager review.",
      currentWorkflowSteps: [
        "New claim arrives through portal, email, or broker service queue.",
        "Intake specialist reviews policy context and attachments.",
        "Specialist identifies claim type, missing information, severity, and likely routing path.",
        "High-risk or ambiguous cases are escalated to a lead.",
        "Claim is assigned to an adjuster queue and broker follow-up is drafted manually.",
      ],
      systemsInvolved: [
        "Guidewire",
        "Salesforce",
        "Outlook shared mailbox",
        "Broker portal",
        "Document management system",
      ],
      estimatedVolume: "18,000 new claims per month",
      estimatedTimeSpent: "9-14 minutes of intake handling per claim",
      roughBusinessImpact:
        "Delayed routing creates adjuster idle time, duplicate broker follow-up, and avoidable escalation volume.",
      constraints:
        "Regulated communications, legacy policy data, variable attachment quality, and strict audit requirements.",
      adoptionConcerns:
        "Adjusters will reject routing suggestions unless explanations are specific and managers can inspect exceptions.",
      teamReadiness: "medium",
      dataAvailability: "high",
      knownFailureModes: [
        "Claim routed to wrong severity queue",
        "Missing attachments not requested before assignment",
        "Duplicate broker follow-up",
        "High-risk claim bypasses lead review",
      ],
    },
    opportunities: [
      {
        id: "claims-triage",
        title: "Claims intake triage and routing assistant",
        description:
          "Classify new claims, flag missing information, propose routing, and present an explanation for human review.",
        targetWorkflow:
          "Intake specialist reviews a suggested claim type, severity, missing-info checklist, and queue assignment before submitting.",
        pilotKind: "workflow",
        dimensions: {
          roiPotential: 5,
          dataReadiness: 4,
          implementationEase: 4,
          adoptionEase: 3,
          strategicLeverage: 5,
          riskContainment: 3,
          stakeholderUrgency: 5,
        },
        rationale:
          "It sits at the front door of the workflow, has clear human review, and creates reusable routing patterns for adjacent service queues.",
        notYet:
          "Do not auto-assign high-risk claims or send broker-facing messages without human review in v1.",
      },
      {
        id: "underwriting-pack",
        title: "Underwriting evidence pack builder",
        description:
          "Assemble policy, loss history, broker notes, and prior correspondence into a structured underwriting review packet.",
        targetWorkflow:
          "Underwriter receives a generated review packet with source links, missing fields, and risk notes before making a decision.",
        pilotKind: "knowledge",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 3,
          implementationEase: 3,
          adoptionEase: 3,
          strategicLeverage: 4,
          riskContainment: 2,
          stakeholderUrgency: 4,
        },
        rationale:
          "Good leverage, but input normalization and underwriting risk sensitivity make it a second pilot after intake patterns are proven.",
        notYet:
          "Do not recommend underwriting decisions or pricing changes until evidence quality and review behavior are measured.",
      },
      {
        id: "broker-follow-up",
        title: "Broker follow-up draft queue",
        description:
          "Generate follow-up drafts for missing information, status updates, and intake clarification requests.",
        targetWorkflow:
          "Broker service specialist reviews suggested drafts, edits language, and sends through approved channels.",
        pilotKind: "follow-up",
        dimensions: {
          roiPotential: 3,
          dataReadiness: 4,
          implementationEase: 4,
          adoptionEase: 4,
          strategicLeverage: 3,
          riskContainment: 2,
          stakeholderUrgency: 3,
        },
        rationale:
          "Useful and low effort, but narrower strategic leverage than fixing routing quality at intake.",
        notYet:
          "Do not send externally without a specialist approving content and recipient context.",
      },
      {
        id: "subrogation-signal",
        title: "Subrogation signal detector",
        description:
          "Flag claims with potential third-party recovery indicators for specialist review.",
        targetWorkflow:
          "Claims lead sees suggested recovery indicators and sends confirmed cases to the subrogation team.",
        pilotKind: "workflow",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 3,
          implementationEase: 2,
          adoptionEase: 3,
          strategicLeverage: 3,
          riskContainment: 3,
          stakeholderUrgency: 3,
        },
        rationale:
          "Material value exists, but the signal needs more historical validation than the intake pilot.",
        notYet:
          "Do not suppress or close claims based on this signal; keep it as a review prompt.",
      },
    ],
    stakeholders: [
      {
        role: "Claims operations VP",
        priority: "primary",
        concern: "Cycle time, queue balance, and adjuster productivity.",
        alignmentMove: "Agree on routing accuracy and intake time baseline before build.",
      },
      {
        role: "Intake specialists",
        priority: "primary",
        concern: "Extra review steps or suggestions that miss case nuance.",
        alignmentMove: "Co-design explanation fields and collect weekly override reasons.",
      },
      {
        role: "Compliance lead",
        priority: "supporting",
        concern: "Audit trail and external communication control.",
        alignmentMove: "Keep v1 as reviewed recommendations with source links and immutable event logs.",
      },
      {
        role: "FDE team",
        priority: "supporting",
        concern: "Access to representative cases and system owners.",
        alignmentMove: "Secure sample records, API owners, and exception examples in the first 30 days.",
      },
    ],
    adoptionRisks: [
      {
        risk: "Operators override suggestions without feedback.",
        signal: "High override rate with sparse comments.",
        mitigation: "Make override reasons one-click and review them in pilot standups.",
        owner: "Claims ops manager",
      },
      {
        risk: "Compliance blocks expansion.",
        signal: "Concern that routing logic is opaque or hard to audit.",
        mitigation: "Show source fields, confidence reason, and human approval status for each recommendation.",
        owner: "Compliance lead",
      },
      {
        risk: "System integration slows MVP.",
        signal: "Guidewire and mailbox access require separate approvals.",
        mitigation: "Start with read-only exports and a manual review queue while API access is finalized.",
        owner: "FDE lead",
      },
    ],
    valueMetrics: [
      {
        name: "Baseline KPI",
        baseline: "9-14 minutes intake handling per claim",
        target: "25% reduction for pilot claim types",
        owner: "Claims operations",
        cadence: "Weekly during pilot",
        confidence: "high",
      },
      {
        name: "Quality KPI",
        baseline: "Routing rework rate not consistently measured",
        target: "Routing rework below 8% with tracked override reasons",
        owner: "Claims QA",
        cadence: "Weekly sample review",
        confidence: "medium",
      },
      {
        name: "Adoption KPI",
        baseline: "No assistant usage",
        target: "75% of pilot intake specialists use recommendations on eligible claims",
        owner: "Pilot manager",
        cadence: "Twice weekly",
        confidence: "medium",
      },
      {
        name: "Operational KPI",
        baseline: "Broker follow-up often delayed until assignment",
        target: "Same-day missing-info request for 80% of eligible cases",
        owner: "Broker service lead",
        cadence: "Weekly",
        confidence: "medium",
      },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare system",
    summary:
      "Patient access, referral intake, scheduling triage, and internal handoff across clinical and administrative teams.",
    discoveryEvidence: [
      "Referral coordinators spend time checking demographics, diagnosis, insurance, and attachments before routing.",
      "Specialty-specific rules create rework when missing information is discovered after scheduling.",
      "Clinical operations needs a clear line between administrative routing and clinical judgment.",
    ],
    assumptionsToValidate: [
      "The pilot specialty has enough repeatable referral patterns to test safely.",
      "Administrative urgency signals can be separated from clinical triage decisions.",
      "Coordinator review time and missing-document rework can be measured before rollout.",
    ],
    discovery: {
      companyName: "Riverside Health Network",
      domain: "Healthcare",
      workflowName: "Referral intake and scheduling triage",
      workflowOwner: "Patient access manager",
      baselineMetric: "Referral review time, conversion rate, and missing-document rework",
      humanReviewPoint:
        "Coordinator approves routing and missing-document requests before patient outreach or clinical handoff.",
      executiveGoal:
        "Improve referral conversion and reduce avoidable scheduling delays while preserving clinical review boundaries.",
      stakeholderNotes:
        "Patient access leaders want fewer stalled referrals. Clinical operations wants safer triage. IT wants minimal disruption to the EHR and call center tools.",
      operatorNotes:
        "Referral coordinators review faxed and portal referrals, verify required documents, check specialty rules, and route to schedulers or clinical review.",
      currentWorkflowSteps: [
        "Referral arrives through fax, portal, or partner office email.",
        "Coordinator checks patient demographics, insurance, diagnosis, and required attachments.",
        "Coordinator identifies specialty, urgency, missing information, and eligibility rules.",
        "Complex referrals are sent to clinical review before scheduling.",
        "Patient or referring office is contacted for missing details or appointment options.",
      ],
      systemsInvolved: [
        "Epic",
        "RightFax",
        "Call center platform",
        "Provider directory",
        "Document imaging queue",
      ],
      estimatedVolume: "7,500 referrals per month",
      estimatedTimeSpent: "12-20 minutes of coordinator review per referral",
      roughBusinessImpact:
        "Incomplete referrals and slow routing create appointment leakage, patient frustration, and provider-office rework.",
      constraints:
        "HIPAA obligations, specialty-specific routing rules, EHR workflow constraints, and variable referral quality.",
      adoptionConcerns:
        "Clinical teams need confidence that the assistant distinguishes administrative routing from clinical decision-making.",
      teamReadiness: "medium",
      dataAvailability: "medium",
      knownFailureModes: [
        "Urgent referral routed as routine",
        "Missing prior authorization discovered after scheduling",
        "Patient contacted before specialty review",
        "Duplicate referral creates duplicate outreach",
      ],
    },
    opportunities: [
      {
        id: "referral-routing",
        title: "Referral intake routing copilot",
        description:
          "Extract referral fields, flag missing documents, suggest specialty routing, and identify cases needing clinical review.",
        targetWorkflow:
          "Coordinator reviews extracted fields, routing suggestion, urgency signal, and missing-info checklist before moving the referral.",
        pilotKind: "workflow",
        dimensions: {
          roiPotential: 5,
          dataReadiness: 3,
          implementationEase: 3,
          adoptionEase: 3,
          strategicLeverage: 5,
          riskContainment: 2,
          stakeholderUrgency: 5,
        },
        rationale:
          "It targets the highest-friction access point while preserving human review and clinical escalation boundaries.",
        notYet:
          "Do not automate clinical triage decisions or patient-facing scheduling messages without coordinator approval.",
      },
      {
        id: "missing-docs",
        title: "Missing-document request assistant",
        description:
          "Detect missing referral materials and draft request language for referring offices.",
        targetWorkflow:
          "Coordinator approves a missing-document checklist and sends a standardized request to the referring office.",
        pilotKind: "follow-up",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 4,
          implementationEase: 4,
          adoptionEase: 4,
          strategicLeverage: 3,
          riskContainment: 3,
          stakeholderUrgency: 4,
        },
        rationale:
          "Low-risk and practical, but it solves a slice of the intake problem rather than the full routing bottleneck.",
        notYet:
          "Do not close or reject referrals automatically when information appears incomplete.",
      },
      {
        id: "capacity-matcher",
        title: "Specialty capacity matching view",
        description:
          "Recommend eligible appointment pathways based on specialty rules, provider availability, and referral attributes.",
        targetWorkflow:
          "Scheduler sees eligible provider groups and constraints after coordinator validation.",
        pilotKind: "workflow",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 3,
          implementationEase: 2,
          adoptionEase: 2,
          strategicLeverage: 4,
          riskContainment: 2,
          stakeholderUrgency: 3,
        },
        rationale:
          "Potentially valuable, but it depends on cleaner routing data and specialty alignment first.",
        notYet:
          "Do not rebalance provider panels or override scheduling templates in v1.",
      },
    ],
    stakeholders: [
      {
        role: "Patient access director",
        priority: "primary",
        concern: "Referral leakage and coordinator throughput.",
        alignmentMove: "Define conversion, cycle time, and missing-info baselines before pilot launch.",
      },
      {
        role: "Referral coordinators",
        priority: "primary",
        concern: "Assistant creates more clicks or misses specialty nuance.",
        alignmentMove: "Pilot with coordinators who can tune checklist language and exception categories.",
      },
      {
        role: "Clinical operations lead",
        priority: "supporting",
        concern: "Administrative automation may cross into clinical triage.",
        alignmentMove: "Separate administrative routing suggestions from clinical review decisions in UI and logs.",
      },
      {
        role: "IT/EHR owner",
        priority: "supporting",
        concern: "Integration risk inside core EHR workflow.",
        alignmentMove: "Start with a reviewed queue and minimal write-back until workflow value is proven.",
      },
    ],
    adoptionRisks: [
      {
        risk: "Clinical boundary confusion.",
        signal: "Users treat administrative urgency hints as clinical decisions.",
        mitigation: "Label review-required cases clearly and require clinical signoff for ambiguous referrals.",
        owner: "Clinical operations",
      },
      {
        risk: "Coordinator workload increases during pilot.",
        signal: "Users spend time correcting extracted fields without downstream time savings.",
        mitigation: "Limit pilot to a specialty with common referral patterns and track correction reasons.",
        owner: "Patient access manager",
      },
      {
        risk: "Data access delays.",
        signal: "Fax, imaging, and EHR data owners have different approval paths.",
        mitigation: "Use exported sample packets for discovery validation while integration is scoped.",
        owner: "IT owner",
      },
    ],
    valueMetrics: [
      {
        name: "Baseline KPI",
        baseline: "12-20 minutes coordinator review per referral",
        target: "20% reduction for pilot specialty",
        owner: "Patient access",
        cadence: "Weekly",
        confidence: "medium",
      },
      {
        name: "Quality KPI",
        baseline: "Urgency and missing-document defects sampled manually",
        target: "95% reviewed routing accuracy on pilot sample",
        owner: "Clinical operations",
        cadence: "Weekly sample review",
        confidence: "medium",
      },
      {
        name: "Adoption KPI",
        baseline: "No copilot usage",
        target: "70% coordinator usage on eligible referrals",
        owner: "Referral manager",
        cadence: "Twice weekly",
        confidence: "medium",
      },
      {
        name: "Operational KPI",
        baseline: "Referral status visibility is inconsistent",
        target: "90% of pilot referrals have missing-info status captured same day",
        owner: "Patient access analytics",
        cadence: "Weekly",
        confidence: "low",
      },
    ],
  },
  {
    id: "pe-ops",
    label: "Private equity portfolio operations",
    summary:
      "Portfolio company operations review, diligence workflow, KPI reporting, and value creation follow-up.",
    discoveryEvidence: [
      "Portfolio companies submit KPI packs and commentary in inconsistent formats.",
      "Operating partners spend review time normalizing variance before they can ask better follow-up questions.",
      "Repeated board-prep questions suggest unresolved owners and weak action tracking.",
    ],
    assumptionsToValidate: [
      "A minimum KPI dictionary can be agreed across the first pilot companies.",
      "Variance cards can stay source-linked enough for partner review.",
      "Portfolio leaders will engage if the output reduces repeated follow-up rather than adding reporting work.",
    ],
    discovery: {
      companyName: "Cobalt Ridge Capital",
      domain: "Private equity portfolio operations",
      workflowName: "Portfolio KPI review and value creation follow-up",
      workflowOwner: "Operating partner",
      baselineMetric:
        "Hours per monthly portfolio review cycle and material variances with assigned follow-up",
      humanReviewPoint:
        "Operating partner approves variance interpretation before portfolio-company follow-up or board-prep use.",
      executiveGoal:
        "Create a repeatable operating cadence that surfaces KPI variance, owner follow-up, and cross-portfolio playbook opportunities.",
      stakeholderNotes:
        "Operating partners want faster visibility across portfolio companies. Deal teams need context before board prep. Portfolio operators do not want another reporting burden.",
      operatorNotes:
        "Portfolio companies send spreadsheets, board materials, and commentary in different formats. Operating partners reconcile metrics, identify variance, and chase owners manually.",
      currentWorkflowSteps: [
        "Portfolio company submits monthly KPI pack and operating commentary.",
        "Ops team normalizes metrics and compares against plan.",
        "Operating partner identifies variance drivers and missing context.",
        "Follow-up questions are sent to portfolio executives.",
        "Board-prep notes and value creation actions are assembled manually.",
      ],
      systemsInvolved: [
        "Excel KPI packs",
        "Google Drive",
        "Salesforce",
        "Board deck repository",
        "Email",
      ],
      estimatedVolume: "24 portfolio companies, monthly KPI cycles",
      estimatedTimeSpent: "4-6 hours per company per monthly review cycle",
      roughBusinessImpact:
        "Manual normalization slows variance detection and makes value creation follow-up inconsistent across companies.",
      constraints:
        "Inconsistent KPI definitions, sensitive portfolio data, and varied reporting maturity by company.",
      adoptionConcerns:
        "Portfolio leaders may see the system as oversight unless the output helps them prepare and act faster.",
      teamReadiness: "high",
      dataAvailability: "medium",
      knownFailureModes: [
        "KPI definition changes without notice",
        "Variance driver is buried in commentary",
        "Follow-up owner is unclear",
        "Board prep repeats prior-month questions",
      ],
    },
    opportunities: [
      {
        id: "kpi-variance",
        title: "Portfolio variance triage and follow-up assistant",
        description:
          "Normalize KPI packs, flag material variance, summarize likely drivers, and draft owner-specific follow-up questions.",
        targetWorkflow:
          "Operating partner reviews variance cards, source references, and suggested follow-up before sending actions to portfolio executives.",
        pilotKind: "workflow",
        dimensions: {
          roiPotential: 5,
          dataReadiness: 3,
          implementationEase: 3,
          adoptionEase: 3,
          strategicLeverage: 5,
          riskContainment: 3,
          stakeholderUrgency: 5,
        },
        rationale:
          "It directly supports operating cadence, creates a reusable portfolio playbook, and keeps sensitive judgment with the operating partner.",
        notYet:
          "Do not auto-score management teams or publish board-ready conclusions without partner review.",
      },
      {
        id: "diligence-reader",
        title: "Diligence document review assistant",
        description:
          "Extract diligence issues, unresolved questions, and operating assumptions from uploaded materials.",
        targetWorkflow:
          "Deal team reviews extracted issues and assigns follow-up owners before IC or operating review.",
        pilotKind: "knowledge",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 3,
          implementationEase: 3,
          adoptionEase: 4,
          strategicLeverage: 4,
          riskContainment: 2,
          stakeholderUrgency: 3,
        },
        rationale:
          "Strong productivity fit, but less tied to post-close adoption and repeatable portfolio operating cadence.",
        notYet:
          "Do not generate investment recommendations or risk ratings without senior deal-team review.",
      },
      {
        id: "initiative-tracker",
        title: "Value creation initiative tracker",
        description:
          "Track initiatives, owners, blockers, and KPI impact across portfolio companies.",
        targetWorkflow:
          "Operating team sees owner status, stale actions, and KPI-linked initiative notes in one review view.",
        pilotKind: "measurement",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 4,
          implementationEase: 4,
          adoptionEase: 2,
          strategicLeverage: 5,
          riskContainment: 4,
          stakeholderUrgency: 4,
        },
        rationale:
          "High leverage and low technical risk, but adoption complexity is higher because many portfolio operators must maintain status data.",
        notYet:
          "Do not create a new mandatory reporting process until the KPI review pilot proves value.",
      },
      {
        id: "board-prep",
        title: "Board-prep narrative assembler",
        description:
          "Draft board-prep narratives from KPI variance, prior questions, and initiative status.",
        targetWorkflow:
          "Operating partner receives a draft narrative with source links and unresolved questions.",
        pilotKind: "reporting",
        dimensions: {
          roiPotential: 3,
          dataReadiness: 3,
          implementationEase: 4,
          adoptionEase: 3,
          strategicLeverage: 3,
          riskContainment: 2,
          stakeholderUrgency: 3,
        },
        rationale:
          "Useful downstream output, but it should follow a cleaner variance and follow-up workflow.",
        notYet:
          "Do not produce final board materials without partner review and source verification.",
      },
    ],
    stakeholders: [
      {
        role: "Operating partner",
        priority: "primary",
        concern: "Slow variance detection and inconsistent follow-up.",
        alignmentMove: "Anchor pilot around one monthly review cycle and a defined action log.",
      },
      {
        role: "Portfolio company CFO/COO",
        priority: "primary",
        concern: "Additional reporting burden or perceived surveillance.",
        alignmentMove: "Show how standardized follow-up reduces repeated questions and board-prep churn.",
      },
      {
        role: "Deal team",
        priority: "supporting",
        concern: "Need context for board prep and value creation narrative.",
        alignmentMove: "Provide source-linked variance summaries and open questions before prep meetings.",
      },
      {
        role: "Data operations",
        priority: "supporting",
        concern: "Inconsistent KPI definitions and file formats.",
        alignmentMove: "Define a minimum metric dictionary and exception log in the first 30 days.",
      },
    ],
    adoptionRisks: [
      {
        risk: "Portfolio company resistance.",
        signal: "Operators delay inputs or provide shallow commentary.",
        mitigation: "Position pilot as fewer repeated questions and clearer owner follow-up.",
        owner: "Operating partner",
      },
      {
        risk: "KPI definitions drift.",
        signal: "Month-over-month variance is caused by definition changes rather than performance.",
        mitigation: "Maintain metric dictionary and require definition-change notes.",
        owner: "Data operations",
      },
      {
        risk: "Narratives overstate confidence.",
        signal: "Draft summaries imply causality without supporting source context.",
        mitigation: "Use source-linked evidence and confidence labels for variance drivers.",
        owner: "Deal team lead",
      },
    ],
    valueMetrics: [
      {
        name: "Baseline KPI",
        baseline: "4-6 hours per company per monthly review cycle",
        target: "30% reduction for pilot companies",
        owner: "Operating partner",
        cadence: "Monthly",
        confidence: "medium",
      },
      {
        name: "Quality KPI",
        baseline: "Variance follow-up quality varies by reviewer",
        target: "90% of material variances have owner, source, and next action",
        owner: "Portfolio operations",
        cadence: "Monthly",
        confidence: "medium",
      },
      {
        name: "Adoption KPI",
        baseline: "Manual review cadence",
        target: "5 pilot companies reviewed through workbench by day 90",
        owner: "Operating partner",
        cadence: "Monthly",
        confidence: "high",
      },
      {
        name: "Operational KPI",
        baseline: "Repeated follow-up questions across board cycles",
        target: "25% fewer repeated unresolved questions",
        owner: "Deal team",
        cadence: "Monthly",
        confidence: "low",
      },
    ],
  },
  {
    id: "custom",
    label: "Custom workflow",
    summary:
      "Template-driven starting point for replacing the notes with your own discovery context.",
    discoveryEvidence: [
      "Use this area as a placeholder for operator observations from discovery.",
      "Capture where work waits, where judgment happens, and where exceptions break the process.",
      "Treat generated output as a starting structure until real evidence is added.",
    ],
    assumptionsToValidate: [
      "The workflow owner can name the baseline metric before build starts.",
      "The required human review point is clear enough to keep v1 bounded.",
      "The first pilot should improve an actual workflow before adding broader reporting.",
    ],
    discovery: {
      companyName: "Client operations team",
      domain: "Client operations",
      workflowName: "High-friction operating workflow",
      workflowOwner: "Operations lead or workflow manager",
      baselineMetric:
        "Current cycle time, rework rate, backlog, or manual review time",
      humanReviewPoint:
        "Human approves recommendation before customer, clinical, financial, or system-of-record action.",
      executiveGoal:
        "Improve cycle time, quality, and visibility without removing necessary human judgment.",
      stakeholderNotes:
        "Add executive goals, owner concerns, approval constraints, and stakeholder incentives.",
      operatorNotes:
        "Add what frontline users do today, where judgment happens, and what workarounds exist.",
      currentWorkflowSteps: [
        "Work request or case arrives through an intake channel.",
        "Operator gathers context from source systems.",
        "Operator classifies the request and identifies missing information.",
        "Edge cases are escalated to a lead or specialist.",
        "Next action is completed and status is updated manually.",
      ],
      systemsInvolved: [
        "Primary system of record",
        "Shared intake channel",
        "Manual tracking sheet",
      ],
      estimatedVolume: "Add monthly or weekly volume",
      estimatedTimeSpent: "Add time per item or per review cycle",
      roughBusinessImpact:
        "Add the cost of delay, rework, missed revenue, quality risk, or poor customer experience.",
      constraints:
        "Add regulatory, data, system, timing, or organizational constraints.",
      adoptionConcerns:
        "Add why users may resist the workflow change or distrust the output.",
      teamReadiness: "medium",
      dataAvailability: "medium",
      knownFailureModes: [
        "Wrong routing or prioritization",
        "Missing information discovered late",
        "No clear owner for exceptions",
      ],
    },
    opportunities: [
      {
        id: "custom-triage",
        title: "Intake triage and routing assistant",
        description:
          "Classify incoming work, identify missing information, and suggest the next owner for human review.",
        targetWorkflow:
          "Operator reviews a suggested classification, missing-info checklist, and owner assignment before submitting.",
        pilotKind: "workflow",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 4,
          implementationEase: 5,
          adoptionEase: 4,
          strategicLeverage: 4,
          riskContainment: 4,
          stakeholderUrgency: 4,
        },
        rationale:
          "A reviewed triage layer is usually a practical first pilot because it improves the front door without requiring full automation.",
        notYet:
          "Do not automate final decisions or external communications until review quality is measured.",
      },
      {
        id: "custom-operator-copilot",
        title: "Operator context copilot",
        description:
          "Gather relevant records, summarize context, and prepare a suggested next action for the operator.",
        targetWorkflow:
          "Operator opens a case view with source-linked context and approves or edits the next action.",
        pilotKind: "knowledge",
        dimensions: {
          roiPotential: 4,
          dataReadiness: 3,
          implementationEase: 3,
          adoptionEase: 3,
          strategicLeverage: 4,
          riskContainment: 3,
          stakeholderUrgency: 3,
        },
        rationale:
          "Useful where operators spend time searching across systems, but it needs clean source access.",
        notYet:
          "Do not hide source records or make the summary the only review artifact.",
      },
      {
        id: "custom-metrics",
        title: "Exception and KPI visibility layer",
        description:
          "Track exception categories, cycle time, owner handoffs, and adoption signals in one operating view.",
        targetWorkflow:
          "Managers review exception patterns and KPI movement before deciding which workflow to expand next.",
        pilotKind: "measurement",
        dimensions: {
          roiPotential: 3,
          dataReadiness: 3,
          implementationEase: 3,
          adoptionEase: 3,
          strategicLeverage: 3,
          riskContainment: 3,
          stakeholderUrgency: 3,
        },
        rationale:
          "Good supporting layer, but it becomes more valuable when paired with an actual pilot workflow.",
        notYet:
          "Do not turn the dashboard into a reporting burden; collect events from the pilot where possible.",
      },
    ],
    stakeholders: [
      {
        role: "Executive sponsor",
        priority: "primary",
        concern: "Needs measurable improvement tied to business goals.",
        alignmentMove: "Confirm the one KPI that determines whether the pilot expands.",
      },
      {
        role: "Workflow operators",
        priority: "primary",
        concern: "Need help without extra clicks or loss of judgment.",
        alignmentMove: "Design the first version around review, edit, and override behavior.",
      },
      {
        role: "Technical owner",
        priority: "supporting",
        concern: "Needs clear system boundaries and data access plan.",
        alignmentMove: "Document source systems, write-back needs, and MVP integration assumptions.",
      },
    ],
    adoptionRisks: [
      {
        risk: "Unclear ownership.",
        signal: "No single operator or manager owns pilot feedback.",
        mitigation: "Name a workflow owner before build begins.",
        owner: "Executive sponsor",
      },
      {
        risk: "Data quality is assumed rather than tested.",
        signal: "Sample records do not match the happy-path workflow.",
        mitigation: "Review representative examples and exceptions during the first 30 days.",
        owner: "Technical owner",
      },
      {
        risk: "Pilot scope expands too early.",
        signal: "Stakeholders ask for adjacent automations before baseline metrics exist.",
        mitigation: "Use the scoring model to keep expansion decisions explicit.",
        owner: "Pilot lead",
      },
    ],
    valueMetrics: [
      {
        name: "Baseline KPI",
        baseline: "Current cycle time or handling time",
        target: "20% improvement for eligible pilot work",
        owner: "Workflow owner",
        cadence: "Weekly",
        confidence: "medium",
      },
      {
        name: "Quality KPI",
        baseline: "Manual rework or override rate",
        target: "Tracked review accuracy and override reasons",
        owner: "Pilot lead",
        cadence: "Weekly",
        confidence: "medium",
      },
      {
        name: "Adoption KPI",
        baseline: "No assistant usage",
        target: "70% usage on eligible work by pilot users",
        owner: "Workflow manager",
        cadence: "Twice weekly",
        confidence: "medium",
      },
      {
        name: "Operational KPI",
        baseline: "Exception volume and owner handoffs",
        target: "Visible exception categories and owner aging",
        owner: "Operations lead",
        cadence: "Weekly",
        confidence: "low",
      },
    ],
  },
];
