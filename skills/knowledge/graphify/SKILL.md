# Graphify — Queryable Knowledge Graph from Code

Faithful port of safishamsi/graphify (https://github.com/safishamsi/graphify) —
turns a folder of source files into a queryable dependency graph, tagging every
edge EXTRACTED (found directly in source, confidence 1.0), INFERRED (a reasonable
guess with a confidence score), or AMBIGUOUS (low-confidence, flagged for review).
`analyze()`'s existing node/edge shape (`{from, to, type}`) is unchanged — every
method below is additive and composes on top of its output.

## When to use

- Understanding an unfamiliar codebase's dependency structure before refactoring.
- Building a `GRAPH_REPORT.md`-style summary (god nodes, surprising connections,
  suggested questions) for onboarding or architecture review.
- Answering "what depends on X" or "how does A connect to B" without manually
  tracing imports.

## Methods

| Method | Description |
|--------|-------------|
| `analyze(files)` | Builds the graph: `{nodes, edges, stats, summary}` from static `require`/`import` extraction. |
| `classifyEdges(edges)` | Tags edges EXTRACTED (confidence 1.0, the default for `analyze()`'s static-import edges), INFERRED (confidence ≥0.5), or AMBIGUOUS (confidence <0.5). |
| `godNodes(graph, topN)` | Ranks nodes by degree (in + out edges) — the highest-connectivity concepts. |
| `surprisingConnections(graph, topN)` | Edges linking otherwise low-degree nodes, ranked by composite score. |
| `suggestedQuestions(graph)` | Derives "What depends on X?"-style questions from the god nodes. |
| `buildReport(graph)` | `GRAPH_REPORT.md` equivalent: `{stats, godNodes, surprisingConnections, suggestedQuestions}`. |
| `query(graph, question)` | Keyword search over node ids/labels (`graphify query [question]`). |
| `tracePath(graph, fromId, toId)` | BFS shortest path between two nodes (`graphify path [a] [b]`). |
| `explain(graph, nodeId)` | Node detail plus every edge touching it (`graphify explain [concept]`). |
| `getCommands()` | The CLI command surface this module mirrors (`graphify .`, `--mode deep`, `--update`, `query`, `path`, `explain`, `--watch`, `--wiki`, `hook install`). |

## Example

```js
const Graphify = require('./index');
const g = new Graphify();

const graph = g.analyze([
  { name: 'app.js', content: 'import React from "react";' }
]);

g.classifyEdges(graph.edges); // [{ from: 'app.js', to: 'react', type: 'imports', tag: 'EXTRACTED', confidence: 1.0 }]
g.buildReport(graph);         // { stats, godNodes, surprisingConnections, suggestedQuestions }
g.explain(graph, 'react');    // { found: true, node: {...}, edges: [...] }
```
