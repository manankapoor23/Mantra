import type { ToolDefinition } from "./types";

// Re-export the types so consumers can do: import { parse, ToolDefinition } from "@mantra/parser"
export type { ToolDefinition, JSONSchemaLike } from "./types";

/**
 * Parse a JSON string of MCP tool definitions into a clean ToolDefinition[].
 *
 * Accepts either:
 *   - the tools/list shape:  { "tools": [ ... ] }
 *   - a bare array:          [ ... ]
 *
 * Throws an Error if the JSON is malformed, the shape is unrecognized,
 * or any tool is missing a string `name`.
 */
export function parse(input: string): ToolDefinition[] {
  // ── TODO 1: Turn the JSON string into a JavaScript value ──────────────
  //   • JSON.parse(input) does the conversion.
  //   • BUT it THROWS if the text isn't valid JSON. Wrap it in try/catch,
  //     and in the catch, throw a clearer error like `Invalid JSON: <reason>`.
  //   • Store the result in a variable, e.g. `data`.

  // ── TODO 2: Find the array of tools ───────────────────────────────────
  //   • If `data` is an array            → that's our tools list.
  //   • Else if `data.tools` is an array → use `data.tools`.
  //   • Else                             → throw an error explaining the
  //     expected shapes.
  //   • Hint: `Array.isArray(x)` returns true/false.

  // ── TODO 3: Validate every tool has a string `name` ───────────────────
  //   • Loop over the tools. If any tool's `name` is not a string, throw.
  //   • Hint: `typeof t.name === "string"` checks that.

  // ── TODO 4: Return the tools as ToolDefinition[] ──────────────────────

  // Placeholder so the file compiles while you work. Replace it.
  return [];
}
