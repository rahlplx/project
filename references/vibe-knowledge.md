# Knowledge Base

Store and retrieve patterns from completed projects for future reference.

## Knowledge Base Protocol

### Step 1: Capture Patterns

After each project:
1. **Auth patterns**: What worked for authentication?
2. **API patterns**: What worked for API design?
3. **UI patterns**: What worked for UI components?
4. **Billing patterns**: What worked for billing integration?
5. **Permission patterns**: What worked for access control?

### Step 2: Validate Patterns

Before storing:
1. **Name**: Pattern must have a descriptive name
2. **Category**: Must be one of: auth, api, ui, billing, permissions
3. **Description**: Must explain what the pattern does
4. **Confidence**: Must be between 0 and 1

### Step 3: Store Patterns

Add validated patterns to knowledge base:
- Store with metadata (project name, date, confidence)
- Track statistics (total projects, total patterns)
- Enable retrieval by category

### Step 4: Retrieve Patterns

When starting a new project:
1. Query knowledge base by category
2. Filter by confidence threshold (e.g., > 0.7)
3. Apply relevant patterns to new project
4. Track which patterns were used

## Pattern Storage

| Field | Description |
|-------|-------------|
| name | Pattern name |
| category | auth, api, ui, billing, permissions |
| description | What the pattern does |
| confidence | 0-1 confidence score |
| projectName | Source project |
| timestamp | When captured |

## Feedback Loop

1. **Capture**: After project completion, capture patterns
2. **Validate**: Ensure patterns meet quality criteria
3. **Store**: Add to knowledge base
4. **Retrieve**: Use patterns in future projects
5. **Improve**: Update confidence based on usage

## Token Budget

- Reference: lazy-loaded on demand
- Size: ~150 lines
- Re-attach: only when capturing or retrieving patterns
