# AI Generation Contract

Endpoint: `POST /api/experience`

Request:
```json
{"subject":"FAITH","mode":"journey","day":1,"duration":30}
```

The server returns a complete experience payload for:
IT IS WRITTEN™ → SEE™ → DOMINION1st MINDSET™ → DOMINION1st DECLARATION™ → DOiT!™

## Non-negotiable generation rules
- Scripture quotations labeled KJV must be KJV.
- Scripture reference and quotation are distinct from generated teaching/application.
- Do not invent lexical definitions or biblical chronology.
- Dynamic visual prompts may be creative but may not be represented as Scripture.
- AI credentials stay server-side.
- Unknown subjects must never silently masquerade as verified generated content when the provider is unavailable.

## Provider boundary
`generateWithProvider()` is intentionally provider-neutral. The prototype can later connect to the approved model/runtime without rewriting the browser experience.

## Future visual contract
The response includes `scenePrompt`. A separate image-generation service can consume that prompt and return an approved/generated background asset. This keeps text generation and image generation independently auditable.
