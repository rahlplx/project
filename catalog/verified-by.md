# Verified By: Community Verification Registry

Each tool in the catalog is verified by a trusted source. This file tracks who verified what
and what "verified" means.

## Trust Levels

| Level  | Badge                    | Meaning                                             |
| ------ | ------------------------ | --------------------------------------------------- |
| Tier 1 | **official**             | Maintained by the company that built it             |
| Tier 2 | **community-vibe-stack** | Reviewed by the Vibe-Stack curation team            |
| Tier 3 | **community (N stars)**  | Widely adopted by the community (N+ GitHub stars)   |
| Tier 4 | **contributor**          | Contributed and self-verified by a community member |

## Verification Process (Tier 2)

To be `community-vibe-stack` verified:

1. **Exists.** The repo is real, maintained, not abandoned.
2. **Works.** Someone on the team installed and used it successfully.
3. **License is compatible.** MIT, Apache 2.0, BSD, or similar open-source.
4. **No red flags.** No crypto scams, no data-harvesting, no malware.
5. **Documents well.** README is clear, examples work, API is documented.

## Verified Sources

| Verifier               | Type          | Notes                                            |
| ---------------------- | ------------- | ------------------------------------------------ |
| `community-vibe-stack` | Curated team  | Vibe-Stack maintainers review each tool manually |
| `community (N+ stars)` | Market signal | N+ GitHub stars from real developers             |
| `microsoft`            | Official      | Maintained by Microsoft                          |
| `google-labs`          | Official      | Maintained by Google Labs                        |
| `anthropic`            | Official      | Maintained by Anthropic                          |
| `vercel`               | Official      | Maintained by Vercel                             |
| `netlify`              | Official      | Maintained by Netlify                            |
| `qdrant`               | Official      | Maintained by Qdrant                             |
| `langchain`            | Official      | Maintained by LangChain                          |
| `huggingface`          | Official      | Maintained by Hugging Face                       |

## Adding a New Tool

1. Add entry to `catalog/tools.yaml`
2. Add your verifier info here if new
3. Open a PR
4. Get community review

## Removing a Tool

Tools get removed if:

- Repository is archived or abandoned for >1 year
- License changes to incompatible
- Security vulnerability found
- Better alternative emerges in the catalog
