import { TextareaField } from "@/components/ui/textarea-field";
import { TextField } from "@/components/ui/text-field";
import type { DiscoveryInput, ReadinessLevel } from "@/lib/types";
import { linesFromList, splitLines } from "@/lib/format";

type DiscoveryFormProps = {
  discovery: DiscoveryInput;
  onChange: (discovery: DiscoveryInput) => void;
};

const readinessLevels: ReadinessLevel[] = ["low", "medium", "high"];

export function DiscoveryForm({ discovery, onChange }: DiscoveryFormProps) {
  function update<K extends keyof DiscoveryInput>(
    key: K,
    value: DiscoveryInput[K],
  ) {
    onChange({ ...discovery, [key]: value });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Company name"
          value={discovery.companyName}
          onChange={(value) => update("companyName", value)}
        />
        <TextField
          label="Domain"
          value={discovery.domain}
          onChange={(value) => update("domain", value)}
        />
        <TextField
          label="Workflow name"
          value={discovery.workflowName}
          onChange={(value) => update("workflowName", value)}
        />
        <TextField
          label="Workflow owner"
          value={discovery.workflowOwner}
          onChange={(value) => update("workflowOwner", value)}
        />
        <TextField
          label="Estimated volume"
          value={discovery.estimatedVolume}
          onChange={(value) => update("estimatedVolume", value)}
        />
        <TextField
          label="Baseline metric"
          value={discovery.baselineMetric}
          onChange={(value) => update("baselineMetric", value)}
        />
      </div>

      <TextareaField
        label="Executive goal"
        value={discovery.executiveGoal}
        onChange={(value) => update("executiveGoal", value)}
        minRows={3}
      />

      <TextareaField
        label="Required human review point"
        value={discovery.humanReviewPoint}
        onChange={(value) => update("humanReviewPoint", value)}
        minRows={3}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <TextareaField
          label="Stakeholder notes"
          value={discovery.stakeholderNotes}
          onChange={(value) => update("stakeholderNotes", value)}
          minRows={5}
        />
        <TextareaField
          label="Operator notes"
          value={discovery.operatorNotes}
          onChange={(value) => update("operatorNotes", value)}
          minRows={5}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TextareaField
          label="Current workflow steps"
          value={linesFromList(discovery.currentWorkflowSteps)}
          onChange={(value) => update("currentWorkflowSteps", splitLines(value))}
          minRows={6}
          hint="One step per line."
        />
        <TextareaField
          label="Systems involved"
          value={linesFromList(discovery.systemsInvolved)}
          onChange={(value) => update("systemsInvolved", splitLines(value))}
          minRows={6}
          hint="One system per line."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TextareaField
          label="Rough business impact"
          value={discovery.roughBusinessImpact}
          onChange={(value) => update("roughBusinessImpact", value)}
          minRows={4}
        />
        <TextareaField
          label="Constraints"
          value={discovery.constraints}
          onChange={(value) => update("constraints", value)}
          minRows={4}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TextField
          label="Estimated time spent"
          value={discovery.estimatedTimeSpent}
          onChange={(value) => update("estimatedTimeSpent", value)}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Team readiness
          </span>
          <select
            value={discovery.teamReadiness}
            onChange={(event) =>
              update("teamReadiness", event.target.value as ReadinessLevel)
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {readinessLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Data availability
          </span>
          <select
            value={discovery.dataAvailability}
            onChange={(event) =>
              update("dataAvailability", event.target.value as ReadinessLevel)
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {readinessLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TextareaField
          label="Adoption concerns"
          value={discovery.adoptionConcerns}
          onChange={(value) => update("adoptionConcerns", value)}
          minRows={4}
        />
        <TextareaField
          label="Known failure modes"
          value={linesFromList(discovery.knownFailureModes)}
          onChange={(value) => update("knownFailureModes", splitLines(value))}
          minRows={4}
          hint="One failure mode per line."
        />
      </div>
    </div>
  );
}
