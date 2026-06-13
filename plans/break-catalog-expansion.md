# Break: Catalog Expansion Tasks

## Milestone Dependency Graph

```
M1: Code Generation ──┐
M2: Testing & QA   ──┼──► M5: Verify & Close
M3: Deployment     ──┤
M4: Knowledge      ──┘
```

All independent — can run in parallel.

## Milestone 1: Code Generation (3 tools)

### Slice 1.1: Research + add top AI coding tool #1
- [ ] Search GitHub for popular AI coding tools
- [ ] Verify repo is active (updated in last 6 months)
- [ ] Check license is compatible (MIT/Apache 2.0)
- [ ] Add entry to catalog/tools.yaml
- [ ] Document how agent uses it

### Slice 1.2: Research + add #2
[repeat pattern]

### Slice 1.3: Research + add #3
[repeat pattern]

## Milestone 2: Testing & QA (3 tools)

### Slice 2.1: Research + add top testing tool #1
### Slice 2.2: Research + add #2
### Slice 2.3: Research + add #3

## Milestone 3: Deployment (3 tools)

### Slice 3.1: Research + add top deploy tool #1
### Slice 3.2: Research + add #2
### Slice 3.3: Research + add #3

## Milestone 4: Knowledge & Memory (3 tools)

### Slice 4.1: Research + add top knowledge tool #1
### Slice 4.2: Research + add #2
### Slice 4.3: Research + add #3

## Milestone 5: Verify & Close

### Slice 5.1: Validate all entries
- [ ] Every entry has all 7 required fields
- [ ] Every repo URL is valid
- [ ] No duplicate entries
- [ ] All licenses are compatible

### Slice 5.2: Update SKILL.md if new categories added
### Slice 5.3: Commit and push

## Total: 16 slices, all independent (parallel-friendly)
