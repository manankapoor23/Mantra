// A full JSON Schema is a large, recursive specification. MCP tools only use a
// small object-shaped subset to describe their parameters, so we model a loose
// version: the fields we care about, plus an open door for everything else.
export interface JSONSchemaLike {
  type?: string;
  description?: string;
  properties?: Record<string, JSONSchemaLike>;
  required?: string[];
  // Real schemas carry many more keys; allow them without modeling each one.
  [key: string]: unknown;
}

// The single thing Mantra analyzes: one MCP tool's definition.
export interface ToolDefinition {
  name: string; // required — the tool's identifier
  description?: string; // optional — the text shown to the LLM (where most risk hides)
  inputSchema?: JSONSchemaLike; // optional — the tool's parameters
}
