# Mantra — ARCHITECTURE (v0.1)

pnpm monorepo: one app + four library packages, matching the pipeline
**parse → detect → score → report**.

## Data flow

```
file ──▶ parser ──▶ ToolDefinition[] ──▶ rules ──▶ Finding[] ──▶ scorer ──▶ RiskReport ──▶ reporter ──▶ stdout
```

The CLI owns all I/O (fs read, stdout, exit codes). Every library package is a
**pure function of its input** — no fs, no console, no process. The reporter
returns strings; the CLI prints them.

## Packages

### `packages/parser`  → `@mantra/parser`
- `parse(input: string): ToolDefinition[]` — accepts a JSON string, normalizes
  `{tools:[...]}` or `[...]`, validates the minimal shape (`name` required).
  Throws `ParseError` on malformed JSON / no tools.
- Owns types: `ToolDefinition`, `JSONSchemaLike`, `ParseError`.

### `packages/rules`  → `@mantra/rules`
- Each rule is `(tools: ToolDefinition[]) => Finding[]`.
- `runRules(tools): Finding[]` runs all built-in rules and concatenates.
- Rules: `r1-imperative`, `r2-secret-seeking`, `r3-overlap`, `r4-ambiguous-params`.
- Pattern/word lists live here as plain constants (`patterns.ts`).
- Owns types: `Finding`, `Severity`, `RuleId`.

### `packages/scorer`  → `@mantra/scorer`
- `score(tools, findings): RiskReport` — applies severity weights and the
  formulas in SPEC.md, assigns grade bands.
- Owns types: `RiskReport`, `ToolScore`, `Grade`. Weight constants live here.

### `packages/reporter`  → `@mantra/reporter`
- `renderText(report): string`, `renderJson(report): string`. No console writes.

### `apps/cli`  → bin `mantra`
- Commander program with the `analyze` command.
- Wires: read file → `parse` → `runRules` → `score` → `render*` → print.
- Sole owner of fs, stdout, and `process.exit` codes.

## Dependency direction (no cycles)

```
cli ──▶ parser, rules, scorer, reporter
scorer ──▶ parser (types), rules (types)
rules  ──▶ parser (types)
reporter ──▶ scorer (types)
```

Types live where they're produced and flow downstream: parser owns
`ToolDefinition`, rules owns `Finding`, scorer owns `RiskReport`.

## Contracts (shared types)

```ts
// @mantra/parser
interface ToolDefinition { name: string; description?: string; inputSchema?: JSONSchemaLike; }

// @mantra/rules
type Severity = 'low' | 'medium' | 'high';
type RuleId   = 'R1' | 'R2' | 'R3' | 'R4';
interface Finding { ruleId: RuleId; toolName: string; severity: Severity;
                    message: string; evidence?: string; path?: string; }

// @mantra/scorer
type Grade = 'low' | 'medium' | 'high';
interface ToolScore  { toolName: string; score: number; findings: Finding[]; }
interface RiskReport { overall: number; grade: Grade; tools: ToolScore[]; findings: Finding[]; }
```

## Tech

- **TypeScript** (strict), ESM.
- **pnpm** workspaces — one `package.json` per package.
- **tsup** builds each package (esm + dts); cli builds the `mantra` bin.
- **vitest** per package; root `pnpm -r test` runs all.
- Runtime deps: **commander** (cli only). Detectors are plain TS + regex —
  no NLP/parsing dependency. R3 similarity = Jaccard on word sets.

## Decision notes

- Detectors are pure functions, not a class/registry — v0.1 has a fixed rule
  set. <!-- ponytail: a plugin/registry is YAGNI until external rules exist -->
- Scorer weights & formula are constants, not config. <!-- ponytail: config when a user actually needs to retune, not before -->
- The four-package split is **as specified in the brief**. For a v0.1 of this
  size it could collapse to one package with `src/{parser,rules,scorer,reporter}.ts`
  (~10 fewer config files). Honoring the spec; say the word to collapse.
