import { buildSynthesisPrompt, synthesisSystemPrompt } from "@/lib/synthesis-prompt";
import { synthesisJsonSchema } from "@/lib/synthesis-schema";
import { normalizeSynthesisDraft } from "@/lib/synthesis-validation";
import type { DiscoveryInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const envNamesExpected = [
  "OPENAI_API_KEY",
  "SYNTHESIS_ACCESS_CODE",
  "OPENAI_MODEL",
] as const;
const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

type FailureStage =
  | "access_code"
  | "input_validation"
  | "openai_request"
  | "openai_response_parse"
  | "schema_validation"
  | "app_exception";

type SynthesisRequest = {
  rawNotes?: unknown;
  currentDiscovery?: DiscoveryInput;
  accessCode?: unknown;
};

type ValidationIssues = {
  count: number;
  names: string[];
};

type DiagnosticErrorInput = {
  errorType:
    | "missing_api_key"
    | "invalid_input"
    | "protected"
    | "openai_error"
    | "invalid_model_output"
    | "app_exception";
  failureStage: FailureStage;
  message: string;
  httpStatus: number;
  statusCode?: number;
  modelUsed?: string;
  rawOpenAIErrorName?: string;
  rawOpenAIErrorCode?: string;
  validationIssues?: ValidationIssues;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readServerEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getModelUsed() {
  return readServerEnv("OPENAI_MODEL") || DEFAULT_OPENAI_MODEL;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function errorName(error: unknown) {
  if (error instanceof Error) {
    return error.name;
  }

  if (isRecord(error)) {
    return stringValue(error.name);
  }

  return undefined;
}

function errorCode(error: unknown) {
  if (isRecord(error)) {
    return stringValue(error.code);
  }

  return undefined;
}

function logSynthesisFailure(input: DiagnosticErrorInput) {
  console.error("[synthesize-discovery]", {
    failureStage: input.failureStage,
    modelUsed: input.modelUsed,
    statusCode: input.statusCode,
    errorType: input.errorType,
    rawOpenAIErrorName: input.rawOpenAIErrorName,
    rawOpenAIErrorCode: input.rawOpenAIErrorCode,
    validationIssues: input.validationIssues,
  });
}

function diagnosticErrorResponse(input: DiagnosticErrorInput) {
  logSynthesisFailure(input);

  return Response.json(
    {
      ok: false,
      error: {
        code: input.errorType,
        message: input.message,
      },
      errorType: input.errorType,
      failureStage: input.failureStage,
      statusCode: input.statusCode,
      modelUsed: input.modelUsed,
      message: input.message,
      rawOpenAIErrorName: input.rawOpenAIErrorName,
      rawOpenAIErrorCode: input.rawOpenAIErrorCode,
      validationIssues: input.validationIssues,
    },
    { status: input.httpStatus, headers: noStoreHeaders },
  );
}

function getEnvStatus() {
  const openAiKeyPresent = Boolean(readServerEnv("OPENAI_API_KEY"));
  const accessCodePresent = Boolean(readServerEnv("SYNTHESIS_ACCESS_CODE"));
  const modelConfigured = Boolean(readServerEnv("OPENAI_MODEL"));
  const modelUsed = getModelUsed();

  return {
    ok: true,
    aiConfigured: openAiKeyPresent,
    requiresAccessCode: accessCodePresent,
    runtime,
    envNamesExpected: [...envNamesExpected],
    openAiKeyPresent,
    accessCodePresent,
    hasOpenAiKey: openAiKeyPresent,
    hasAccessCode: accessCodePresent,
    modelConfigured,
    modelUsed,
    nodeEnv: readServerEnv("NODE_ENV") || "unknown",
    vercelEnv: readServerEnv("VERCEL_ENV") || "not-vercel",
  };
}

function openAiErrorDetails(payload: unknown) {
  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : {};

  return {
    rawOpenAIErrorName:
      stringValue(error.type) ?? stringValue(error.name) ?? stringValue(error.param),
    rawOpenAIErrorCode: stringValue(error.code),
  };
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
  return Response.json(getEnvStatus(), { headers: noStoreHeaders });
}

async function handleSynthesisPost(request: Request) {
  let body: SynthesisRequest;
  const model = getModelUsed();

  try {
    body = (await request.json()) as SynthesisRequest;
  } catch (error) {
    return diagnosticErrorResponse({
      errorType: "invalid_input",
      failureStage: "input_validation",
      message: "Request body must be valid JSON.",
      httpStatus: 400,
      modelUsed: model,
      rawOpenAIErrorName: errorName(error),
      rawOpenAIErrorCode: errorCode(error),
      validationIssues: { count: 1, names: ["invalid_request_json"] },
    });
  }

  const rawNotes =
    typeof body.rawNotes === "string" ? body.rawNotes.trim() : "";
  const requiredAccessCode = readServerEnv("SYNTHESIS_ACCESS_CODE");
  const suppliedAccessCode =
    typeof body.accessCode === "string" ? body.accessCode.trim() : "";

  if (requiredAccessCode && suppliedAccessCode !== requiredAccessCode) {
    return diagnosticErrorResponse({
      errorType: "protected",
      failureStage: "access_code",
      message: "AI synthesis is protected for this demo. Sample scenarios still work.",
      httpStatus: 403,
      statusCode: 403,
      modelUsed: model,
    });
  }

  if (rawNotes.length < 220) {
    return diagnosticErrorResponse({
      errorType: "invalid_input",
      failureStage: "input_validation",
      message: "Paste more discovery detail before synthesizing.",
      httpStatus: 400,
      statusCode: 400,
      modelUsed: model,
      validationIssues: { count: 1, names: ["raw_notes_too_short"] },
    });
  }

  const apiKey = readServerEnv("OPENAI_API_KEY");

  if (!apiKey) {
    return diagnosticErrorResponse({
      errorType: "missing_api_key",
      failureStage: "openai_request",
      message:
        "AI synthesis is not configured for this deployment. Sample scenarios still work.",
      httpStatus: 400,
      statusCode: 400,
      modelUsed: model,
    });
  }

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
  } catch (error) {
    return diagnosticErrorResponse({
      errorType: "openai_error",
      failureStage: "openai_request",
      message: "Synthesis failed before updating the workbench. Current case preserved.",
      httpStatus: 502,
      modelUsed: model,
      rawOpenAIErrorName: errorName(error),
      rawOpenAIErrorCode: errorCode(error),
    });
  }

  if (!response.ok) {
    let errorPayload: unknown;

    try {
      const errorText = await response.text();
      errorPayload = errorText ? JSON.parse(errorText) : undefined;
    } catch {
      errorPayload = undefined;
    }

    const details = openAiErrorDetails(errorPayload);

    return diagnosticErrorResponse({
      errorType: "openai_error",
      failureStage: "openai_request",
      message: "Synthesis failed before updating the workbench. Current case preserved.",
      httpStatus: 502,
      statusCode: response.status,
      modelUsed: model,
      rawOpenAIErrorName: details.rawOpenAIErrorName,
      rawOpenAIErrorCode: details.rawOpenAIErrorCode,
    });
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch (error) {
    return diagnosticErrorResponse({
      errorType: "invalid_model_output",
      failureStage: "openai_response_parse",
      message: "Synthesis failed before updating the workbench. Current case preserved.",
      httpStatus: 502,
      statusCode: response.status,
      modelUsed: model,
      rawOpenAIErrorName: errorName(error),
      rawOpenAIErrorCode: errorCode(error),
      validationIssues: { count: 1, names: ["invalid_openai_json_response"] },
    });
  }

  const outputText = extractOutputText(payload);

  if (!outputText) {
    return diagnosticErrorResponse({
      errorType: "invalid_model_output",
      failureStage: "openai_response_parse",
      message: "Synthesis failed before updating the workbench. Current case preserved.",
      httpStatus: 502,
      statusCode: response.status,
      modelUsed: model,
      validationIssues: { count: 1, names: ["missing_output_text"] },
    });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(outputText) as unknown;
    const { workbenchCase, warnings } = normalizeSynthesisDraft(
      parsed,
      rawNotes,
      body.currentDiscovery,
    );

    return Response.json(
      {
        ok: true,
        workbenchCase,
        warnings,
        model,
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    if (parsed === undefined) {
      return diagnosticErrorResponse({
        errorType: "invalid_model_output",
        failureStage: "openai_response_parse",
        message: "Synthesis failed before updating the workbench. Current case preserved.",
        httpStatus: 502,
        statusCode: response.status,
        modelUsed: model,
        rawOpenAIErrorName: errorName(error),
        rawOpenAIErrorCode: errorCode(error),
        validationIssues: { count: 1, names: ["invalid_output_json"] },
      });
    }

    return diagnosticErrorResponse({
      errorType: "invalid_model_output",
      failureStage: "schema_validation",
      message: "Synthesis failed before updating the workbench. Current case preserved.",
      httpStatus: 502,
      statusCode: response.status,
      modelUsed: model,
      rawOpenAIErrorName: errorName(error),
      rawOpenAIErrorCode: errorCode(error),
      validationIssues: {
        count: 1,
        names: [error instanceof Error ? error.message : "schema_validation_failed"],
      },
    });
  }
}

export async function POST(request: Request) {
  const model = getModelUsed();

  try {
    return await handleSynthesisPost(request);
  } catch (error) {
    return diagnosticErrorResponse({
      errorType: "app_exception",
      failureStage: "app_exception",
      message: "Synthesis failed before updating the workbench. Current case preserved.",
      httpStatus: 500,
      statusCode: 500,
      modelUsed: model,
      rawOpenAIErrorName: errorName(error),
      rawOpenAIErrorCode: errorCode(error),
    });
  }
}
