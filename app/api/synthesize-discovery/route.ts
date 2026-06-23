import { buildSynthesisPrompt, synthesisSystemPrompt } from "@/lib/synthesis-prompt";
import { synthesisJsonSchema } from "@/lib/synthesis-schema";
import { normalizeSynthesisDraft } from "@/lib/synthesis-validation";
import type { DiscoveryInput } from "@/lib/types";

export const runtime = "nodejs";

type SynthesisRequest = {
  rawNotes?: unknown;
  currentDiscovery?: DiscoveryInput;
  accessCode?: unknown;
};

function errorResponse(
  code:
    | "missing_api_key"
    | "invalid_input"
    | "protected"
    | "openai_error"
    | "invalid_model_output",
  message: string,
  status: number,
) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as { content?: unknown }).content)
      ? ((item as { content: unknown[] }).content)
      : [];

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") {
        continue;
      }

      const maybeText = contentItem as { text?: unknown; type?: unknown };

      if (
        (maybeText.type === "output_text" || maybeText.type === "text") &&
        typeof maybeText.text === "string"
      ) {
        return maybeText.text;
      }
    }
  }

  return "";
}

export function GET() {
  return Response.json({
    ok: true,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    requiresAccessCode: Boolean(process.env.SYNTHESIS_ACCESS_CODE),
  });
}

export async function POST(request: Request) {
  let body: SynthesisRequest;

  try {
    body = (await request.json()) as SynthesisRequest;
  } catch {
    return errorResponse("invalid_input", "Request body must be valid JSON.", 400);
  }

  const rawNotes =
    typeof body.rawNotes === "string" ? body.rawNotes.trim() : "";
  const requiredAccessCode = process.env.SYNTHESIS_ACCESS_CODE;
  const suppliedAccessCode =
    typeof body.accessCode === "string" ? body.accessCode.trim() : "";

  if (requiredAccessCode && suppliedAccessCode !== requiredAccessCode) {
    return errorResponse(
      "protected",
      "AI synthesis is protected for this demo. Demo mode still works.",
      403,
    );
  }

  if (rawNotes.length < 220) {
    return errorResponse(
      "invalid_input",
      "Paste more discovery detail before synthesizing.",
      400,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return errorResponse(
      "missing_api_key",
      "AI synthesis is not configured for this deployment. Demo mode still works.",
      400,
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.5";

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(45000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: synthesisSystemPrompt }],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildSynthesisPrompt(rawNotes, body.currentDiscovery),
              },
            ],
          },
        ],
        max_output_tokens: 6000,
        text: {
          format: {
            type: "json_schema",
            ...synthesisJsonSchema,
          },
        },
      }),
    });
  } catch {
    return errorResponse(
      "openai_error",
      "OpenAI synthesis failed. Current workbench was not changed.",
      502,
    );
  }

  if (!response.ok) {
    return errorResponse(
      "openai_error",
      "OpenAI synthesis failed. Current workbench was not changed.",
      502,
    );
  }

  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const outputText = extractOutputText(payload);

    if (!outputText) {
      return errorResponse(
        "invalid_model_output",
        "The model returned incomplete structure. Current workbench was not changed.",
        502,
      );
    }

    const parsed = JSON.parse(outputText) as unknown;
    const { workbenchCase, warnings } = normalizeSynthesisDraft(
      parsed,
      rawNotes,
      body.currentDiscovery,
    );

    return Response.json({
      ok: true,
      workbenchCase,
      warnings,
      model,
    });
  } catch {
    return errorResponse(
      "invalid_model_output",
      "The model returned incomplete structure. Current workbench was not changed.",
      502,
    );
  }
}
