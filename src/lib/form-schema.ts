/**
 * form-schema.ts
 *
 * Utility library for converting annotated HTML forms into JSON Schema objects
 * and applying AI-extracted values back to the form.
 *
 * Designed to be extractable as a standalone npm package.
 */

export interface JSONSchemaProperty {
  description?: string;
  examples?: unknown[];
  type?: string | string[];
  format?: string;
  enum?: string[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  anyOf?: JSONSchemaProperty[];
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

/**
 * Scans a form element and builds a JSON Schema from toolparamdescription /
 * toolparamexamples attributes plus standard HTML5 constraints.
 */
export function formToJsonSchema(form: HTMLFormElement): JSONSchema {
  const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    '[toolparamdescription]'
  );

  const properties: Record<string, JSONSchemaProperty> = {};
  const required: string[] = [];

  inputs.forEach((el) => {
    const name = el.getAttribute('name');
    if (!name) return;

    const description = el.getAttribute('toolparamdescription') ?? undefined;
    const examplesRaw = el.getAttribute('toolparamexamples');
    let examples: unknown[] | undefined;
    if (examplesRaw) {
      try {
        examples = JSON.parse(examplesRaw);
      } catch {
        /* ignore malformed */
      }
    }

    let prop: JSONSchemaProperty = {};
    if (description) prop.description = description;
    if (examples) prop.examples = examples;

    // Derive type / format / constraints from HTML attributes
    if (el.tagName === 'SELECT') {
      const options = Array.from((el as HTMLSelectElement).options).map((o) => o.value).filter(Boolean);
      if (options.length) prop.enum = options;
    } else {
      const inputEl = el as HTMLInputElement;
      const type = inputEl.type;

      if (type === 'email') {
        prop.type = 'string';
        prop.format = 'email';
      } else if (type === 'date') {
        prop.type = 'string';
        prop.format = 'date';
      } else if (type === 'number' || type === 'range') {
        prop.type = 'number';
        if (inputEl.min !== '') prop.minimum = Number(inputEl.min);
        if (inputEl.max !== '') prop.maximum = Number(inputEl.max);
      } else {
        prop.type = 'string';
      }

      const pattern = inputEl.getAttribute('pattern');
      if (pattern) prop.pattern = pattern;
    }

    const isRequired = el.hasAttribute('required');
    if (isRequired) {
      required.push(name);
    } else {
      // Allow null so the model can signal "not provided"
      prop = { anyOf: [prop, { type: 'null' }] } as JSONSchemaProperty;
    }

    properties[name] = prop;
  });

  const schema: JSONSchema = { type: 'object', properties };
  if (required.length) schema.required = required;
  return schema;
}

/**
 * Writes extracted values back into the form and dispatches events so React
 * state and browser validation pick them up.
 */
export function applyValuesToForm(
  form: HTMLFormElement,
  values: Record<string, unknown>,
  onFieldFilled?: (name: string, el: Element) => void
): void {
  for (const [name, value] of Object.entries(values)) {
    if (value === null || value === undefined) continue;

    const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[name="${name}"]`
    );
    if (!el) continue;

    el.value = String(value);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    onFieldFilled?.(name, el);
  }
}

