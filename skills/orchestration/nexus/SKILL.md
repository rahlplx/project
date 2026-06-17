# Nexus — Multi-Agent Orchestration

3 orchestration modes (Graph, Router, Adaptive). MCP + A2A protocol support. 100+ LLM providers.

## Methods

| Method                         | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `createGraph(steps)`           | Defines a static DAG workflow                  |
| `createRouter(agents)`         | Sets up dynamic LLM-based routing              |
| `createAdaptive(capabilities)` | Configures embedding-based capability matching |
| `run(task)`                    | Executes the orchestrated workflow             |

## Example

```js
const nexus = new Nexus();
const graph = nexus.createGraph(['research', 'write', 'review']);
nexus.run('Build a blog post');
```
