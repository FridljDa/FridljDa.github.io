import React, { useRef, useState, useCallback } from "react";
import { formToJsonSchema, applyValuesToForm, type JSONSchema } from "../lib/form-schema";

const EXAMPLE_TEXT = "I need to fly from Munich to Paris next Tuesday for me and my wife.";

type Status = "idle" | "loading" | "success" | "error";

export default function FormFillDemo() {
  const formRef = useRef<HTMLFormElement>(null);
  const [userText, setUserText] = useState(EXAMPLE_TEXT);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [schema, setSchema] = useState<JSONSchema | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [useOwnKey, setUseOwnKey] = useState(false);
  const [ownKey, setOwnKey] = useState("");

  const handleFill = useCallback(async () => {
    if (!formRef.current) return;
    setStatus("loading");
    setErrorMsg("");

    const builtSchema = formToJsonSchema(formRef.current);
    setSchema(builtSchema);
    const body = JSON.stringify({ text: userText, schema: builtSchema });

    try {
      const res = await fetch("/api/form-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.status === 501) {
        setUseOwnKey(true);
        setStatus("idle");
        setErrorMsg("No server-side API key configured. Please enter your own Gemini API key below.");
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { values?: Record<string, unknown>; error?: string };
      if (data.error) throw new Error(data.error);

      const values: Record<string, unknown> = data.values ?? {};
      const filled = new Set<string>();
      applyValuesToForm(formRef.current, values, (name) => filled.add(name));
      setHighlightedFields(filled);
      setTimeout(() => setHighlightedFields(new Set()), 1200);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }, [userText]);

  const handleFillWithOwnKey = useCallback(async () => {
    if (!formRef.current || !ownKey.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    const builtSchema = formToJsonSchema(formRef.current);
    setSchema(builtSchema);

    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${ownKey.trim()}`;

      const schemaForGemini = {
        type: "OBJECT",
        properties: Object.fromEntries(
          Object.entries(builtSchema.properties).map(([k, v]) => {
            const anyOf = (v as Record<string, unknown>).anyOf;
            if (Array.isArray(anyOf)) {
              const nonNull = (anyOf as Record<string, unknown>[]).find(
                (s) => (s as Record<string, unknown>).type !== "null"
              );
              return [k, { ...(nonNull ?? { type: "STRING" }), nullable: true }];
            }
            return [k, v];
          })
        ),
      };

      const prompt = `You are a form-filling assistant. Extract values from the user text. Return ONLY a JSON object matching the schema. If info is missing, return null for that field.\n\nUser text: "${userText}"`;

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schemaForGemini,
          },
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(data.error?.message ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const values = JSON.parse(text) as Record<string, unknown>;

      const filled = new Set<string>();
      applyValuesToForm(formRef.current, values, (name) => filled.add(name));
      setHighlightedFields(filled);
      setTimeout(() => setHighlightedFields(new Set()), 1200);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }, [userText, ownKey]);

  const rawHtml = formRef.current?.outerHTML ?? "(form not yet mounted)";

  return (
    <div className="my-8 p-6 border-2 border-surface-elevated rounded-lg bg-surface-elevated shadow-lg space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-heading mb-1">Live Demo</h3>
        <p className="text-body text-sm">
          Describe your trip in plain text, then click <strong>Fill with AI</strong>. The form is annotated
          with <code className="text-xs bg-surface px-1 py-0.5 rounded">toolparamdescription</code> and{" "}
          <code className="text-xs bg-surface px-1 py-0.5 rounded">toolparamexamples</code>.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-heading mb-1" htmlFor="user-text">
          Your travel request
        </label>
        <textarea
          id="user-text"
          rows={3}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          className="w-full px-3 py-2 border-2 border-surface rounded-lg bg-surface text-heading placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Describe your trip..."
        />
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <FormField
          name="departure_city"
          label="Departure city"
          type="text"
          desc="City the traveler is departing from"
          examples={["Munich", "MUC", "Berlin Tegel"]}
          placeholder="e.g. Munich"
          highlighted={highlightedFields.has("departure_city")}
        />
        <FormField
          name="arrival_city"
          label="Arrival city"
          type="text"
          desc="City the traveler is arriving at"
          examples={["Paris", "CDG", "Rome Fiumicino"]}
          placeholder="e.g. Paris"
          highlighted={highlightedFields.has("arrival_city")}
        />
        <FormField
          name="departure_date"
          label="Departure date"
          type="date"
          desc="Date of departure in ISO 8601 format (YYYY-MM-DD)"
          examples={["2026-05-14", "2026-06-02"]}
          highlighted={highlightedFields.has("departure_date")}
        />
        <FormField
          name="passengers"
          label="Passengers"
          type="number"
          desc="Number of passengers travelling"
          examples={["1", "2", "4"]}
          min="1"
          max="9"
          placeholder="e.g. 2"
          highlighted={highlightedFields.has("passengers")}
        />
      </form>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={handleFill}
          disabled={status === "loading" || !userText.trim()}
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {status === "loading" ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Thinking…
            </>
          ) : (
            "Fill with AI"
          )}
        </button>
        {status === "success" && (
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Form filled</span>
        )}
      </div>

      {useOwnKey && (
        <div className="p-4 rounded-lg border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 space-y-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Enter your <strong>Gemini API key</strong> to run the demo client-side. The key is only used in
            your browser and never sent to this server.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={ownKey}
              onChange={(e) => setOwnKey(e.target.value)}
              placeholder="AIza…"
              className="flex-1 px-3 py-2 border-2 border-surface rounded-lg bg-surface text-heading text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleFillWithOwnKey}
              disabled={status === "loading" || !ownKey.trim()}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? "Thinking…" : "Fill"}
            </button>
          </div>
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="p-3 rounded-lg border-2 border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
          ⚠ {errorMsg}
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-surface-elevated">
        <Collapsible
          label="Show synthesized schema"
          open={showSchema}
          onToggle={() => setShowSchema((v) => !v)}
        >
          <pre className="text-xs bg-surface rounded p-3 overflow-auto max-h-64 text-body">
            {schema
              ? JSON.stringify(schema, null, 2)
              : "(click \"Fill with AI\" first to generate the schema)"}
          </pre>
        </Collapsible>
        <Collapsible label="Show raw HTML" open={showHtml} onToggle={() => setShowHtml((v) => !v)}>
          <pre className="text-xs bg-surface rounded p-3 overflow-auto max-h-64 text-body whitespace-pre-wrap break-all">
            {rawHtml}
          </pre>
        </Collapsible>
      </div>
    </div>
  );
}

interface FieldDef {
  name: string;
  label: string;
  type: string;
  desc: string;
  examples: string[];
  placeholder?: string;
  min?: string;
  max?: string;
  highlighted: boolean;
}

function FormField({ name, label, type, desc, examples, placeholder, min, max, highlighted }: FieldDef) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-heading">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={min}
        max={max}
        placeholder={placeholder}
        {...{ toolparamdescription: desc, toolparamexamples: JSON.stringify(examples) }}
        className={`px-3 py-2 border-2 rounded-lg bg-surface text-heading text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 ${
          highlighted ? "border-green-400 bg-green-50 dark:bg-green-900/25" : "border-surface-elevated"
        }`}
      />
    </div>
  );
}

function Collapsible({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
      >
        <span>{open ? "▾" : "▸"}</span>
        {label}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

