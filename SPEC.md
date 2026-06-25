# Mantra — SPEC (v0.1)

## Purpose

Mantra is a CLI that **statically analyzes MCP (Model Context Protocol) tool
metadata** and flags *tool influence risks* — ways a tool definition can
manipulate, mislead, or extract from an LLM agent that has the tool installed.

It reads tool definitions, runs detectors, and emits a **risk score + findings**.
Think of it as a linter for tool descriptions, not a runtime monitor.

## Scope (v0.1)

**In:**
- Static analysis of tool definitions supplied as a JSON file.
- Four detectors (R1–R4 below) + a risk scorer.
- Per-tool and overall risk score with a grade band.
- Human text output and machine JSON output. CI-friendly exit code.

**Out (non-goals for v0.1):**
- Connecting to a live MCP server or invoking tools.
- Any network / remote fetching of definitions.
- Rewriting or auto-fixing definitions.
- Config files, plugins, or user-defined rules — the rule set is built-in and fixed.
- Analyzing runtime prompt injection in tool *outputs* (this is about the *metadata*).

## Input

MCP tool definitions as JSON. Two accepted shapes:

- `tools/list` response: `{ "tools": [ ToolDef, ... ] }`
- bare array: `[ ToolDef, ... ]`

`ToolDef` (the MCP-relevant subset; unknown fields are preserved but ignored):

```jsonc
{
  "name": "string",            // required
  "description": "string",     // optional
  "inputSchema": {             // optional, JSON-Schema object
    "type": "object",
    "properties": { "<param>": { "type": "...", "description": "..." } },
    "required": ["<param>"]
  }
}
```

## Detectors

Each detector consumes the normalized tool list and returns `Finding`s:

```jsonc
{ "ruleId": "R1", "toolName": "...", "severity": "low|medium|high",
  "message": "...", "evidence": "matched text", "path": "description | params.<name>" }
```

### R1 — Imperative / directive language  *(per tool)*
Flags descriptions that **command the model** instead of describing the tool:
`always`, `must`, `you must`, `do not`, `never`, `ignore previous`, `instead of`,
`before responding`, `as an AI`, `your job is`, leading second-person imperatives.
**Risk:** a description can hijack agent behaviour ("always call this tool first").

### R2 — Secret-seeking language  *(per tool — description + param descriptions)*
Flags requests for credentials / sensitive data: `api key`, `password`, `token`,
`secret`, `credential`, `ssh key`, `private key`, `env var`, `AWS_`, `.env`,
`authorization header`.
**Risk:** tools that ask the agent to pass secrets exfiltrate them.

### R3 — Tool overlap  *(cross-tool)*
Flags pairs of tools that are confusingly similar — near-duplicate **names** or
**descriptions**. Heuristic: normalized name equality/substring, or word-set
(Jaccard) description similarity above a threshold.
**Risk:** overlap lets a malicious tool shadow a trusted one.

### R4 — Ambiguous parameters  *(per tool, per param)*
Flags under-specified parameters: missing `description`, vague name
(`data`, `input`, `value`, `arg`, `payload`), missing `type`, or an unconstrained
free `string`/`any` where an enum/bound is expected.
**Risk:** ambiguous params widen what the agent can be coaxed into sending.

> Feature #6 "risk score" is the scorer, not a fifth detector. Feature #5
> "ambiguous parameters" maps to R4.

## Scoring

Each finding contributes a weight by severity: **low = 1, medium = 3, high = 8**
(tunable constants, defined in the scorer).

- `toolScore   = clamp(round(Σ weights_for_tool × 4), 0, 100)`
- `overallScore = clamp(round(0.6 × max(toolScores) + 0.4 × mean(toolScores)), 0, 100)`
  — the worst tool dominates, breadth still counts.
- **Grade:** `0–20` low · `21–50` medium · `51–100` high.

Higher score = riskier. A clean tool set scores 0 (grade low).

## CLI

```
mantra analyze <path>        analyze a JSON tool-definition file
  --json                     emit machine-readable JSON instead of text
  --fail-on <score>          exit 1 if overall score >= <score>  (CI gate)
```

**Exit codes:** `0` success · `1` `--fail-on` threshold breached · `2` bad input
(missing file / malformed JSON / no tools).

## Output

**Text (default):** summary line (overall score + grade + tool count), then
findings grouped per tool — each line: `severity · ruleId · message · evidence`.

**JSON (`--json`):** the full `RiskReport` object (overall, grade, per-tool
scores, all findings) — stable shape for CI consumption.
