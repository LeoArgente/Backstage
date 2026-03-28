You are orchestrating the Backstage aesthetic improvement pipeline for: $ARGUMENTS

If no specific area was mentioned, ask the user what they want to improve and STOP.

## PHASE 0 — Context (you do this yourself, do NOT invoke an agent)

1. Read `.claude/agents/token-reference.md` for technical reference
2. Identify the scope: which HTML templates and CSS files are involved (use Glob/Grep)
3. Read ALL target files (HTML, CSS) and `backstage/static/css/tokens.css`
4. Define the CREATIVE INTENTION — a specific, evocative phrase. Calibrated intentions:
   - **Filme**: "uma experiência editorial — como abrir uma matéria da Sight & Sound"
   - **Comunidade**: "uma sala de cinema lotada — energia coletiva, vozes cruzando, mas organizada"
   - **Listas**: "a vitrine de uma locadora curada — seleções com personalidade"
   - **Perfil**: "um acervo pessoal — a estante de um cinéfilo"
   - **Homepage**: "a marquise de um cinema independente à noite"
   - **Séries**: "uma grade de programação — TV Guide com tratamento editorial"
   - **Busca**: "o catálogo de uma cinemateca — funcional, denso, respeitoso"
   If none matches, create one: metaphor + emotion + visual quality.

## PHASE 1 — Critic (INVOKE as agent)

Use the Agent tool. In the prompt:
- Tell it: "You are the Critic. Read and follow `.claude/agents/critic.md`"
- Include the FULL content of target HTML and CSS files
- Include the INTENTION
- Ask it to return: diagnosis + art direction + implementation plan + anti-clichés (all in one document)

Save the output as `DIRECTION`.

## PHASE 2 — Craftsman (INVOKE as agent)

Use the Agent tool. In the prompt:
- Tell it: "You are the Craftsman. Read and follow `.claude/agents/craftsman.md`"
- Include the DIRECTION from Phase 1
- Include the INTENTION
- Include the exact file paths to modify
- Tell it to use Edit tool (never Write for existing files)
- Tell it to read `tokens.css` and `token-reference.md` before starting

Save the output as `CHANGES`.

## PHASE 3 — QA (INVOKE as agent)

Use the Agent tool. In the prompt:
- Tell it: "You are the QA. Read and follow `.claude/agents/qa.md`"
- Include the CHANGES from Phase 2
- Include the INTENTION
- Tell it to read the modified files and verify experience + compliance
- Tell it to use Edit tool to fix any issues found

## PHASE 4 — Report (you do this yourself)

Deliver a summary in Portuguese:
- Creative intention
- What each phase concluded (1-2 sentences)
- What changed and why
- Final status

## CRITICAL RULES
- You MUST use the Agent tool for phases 1-3. Do NOT role-play the agents yourself.
- Each Agent invocation must tell the subagent to READ its .md file from `.claude/agents/`
- Pass COMPLETE context between phases
- The INTENTION must be in EVERY agent invocation
- All agent prompts in English, final report in Portuguese
