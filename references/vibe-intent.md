# Intent Capture

Capture user intent through conversational Q&A and generate PROJECT.md + PRD.md.

## Q&A Protocol

### Round 1: Core Vision (5 questions)

1. **What problem are you solving?**
   - Who feels this pain?
   - How often does it happen?
   - What happens if it's not solved?

2. **Who is this for?**
   - Primary user persona
   - Secondary user (if any)
   - User's technical skill level

3. **What's the solution?**
   - Core feature (1-2 sentences)
   - How is it different from existing solutions?
   - What's the "magic moment"?

4. **What's at stake?**
   - If this fails, what happens?
   - What does success look like?
   - Timeline pressure?

5. **What's the MVP scope?**
   - Must-have features (1-3)
   - Nice-to-have (2-5)
   - Explicitly out of scope

### Round 2: Technical Details (5 questions)

6. **Tech stack preference?**
   - Language/framework preference
   - Infrastructure preference
   - Integration requirements

7. **Performance requirements?**
   - Expected load
   - Latency tolerance
   - Storage constraints

8. **Security requirements?**
   - Authentication method
   - Data sensitivity level
   - Compliance needs

9. **Existing codebase?**
   - Starting from scratch?
   - Integrating with existing system?
   - Migration requirements?

10. **Team and constraints?**
    - Team size
    - Budget constraints
    - Hard deadlines

### Round 3: Validation (2 questions)

11. **Quick recap:**
    - Restate the problem, solution, and MVP
    - Ask: "Did I get this right?"

12. **Anything else?**
    - Open-ended catch-all
    - Edge cases
    - Future vision

## Skip Protocol

If user wants to skip Q&A:
1. Require minimum: project name + one-line description
2. Apply smart defaults based on project type
3. Flag areas that need review in generated docs

## Smart Defaults

| Project Type | Tech Stack | Timeline | MVP |
|-------------|-----------|----------|-----|
| SaaS | Next.js + Supabase | 2 weeks | Auth + Core Feature |
| API | Node.js + PostgreSQL | 1 week | CRUD + Auth |
| CLI | Node.js + oclif | 3 days | Core Command |
| Extension | TypeScript + Plasmo | 1 week | Content Script + Popup |
| Mobile | React Native + Expo | 3 weeks | Core Screen + Auth |
| Agent | Python + LangChain | 2 weeks | Single Tool + Memory |

## Output

Generated files:
- `PROJECT.md` — Problem, users, stakes, solution, MVP, out of scope, success metrics
- `PRD.md` — Overview, user stories, acceptance criteria, tech stack, performance, security

## Token Budget

- Reference: lazy-loaded on demand
- Size: ~180 lines
- Re-attach: only when capturing new intent
