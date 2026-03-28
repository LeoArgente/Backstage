# Backstage Token Reference

Documento de referência técnica compartilhado por todos os agentes do pipeline.
Consultar quando precisar de valores específicos — mas nunca tratar compliance
como o objetivo principal do trabalho.

## Superfícies
- Cards/seções: `rgba(255, 255, 255, 0.04)` + `border: var(--border-width) solid var(--color-border)`
- Hover: `rgba(255, 255, 255, 0.07–0.10)`
- Inputs: `rgba(255, 255, 255, 0.05)`
- Superfícies elevadas (modais, dropdowns): `var(--color-surface-raised)` é aceitável

## Texto
- Primário: `#fff` ou `var(--color-text-primary)`
- Secundário: `rgba(255, 255, 255, 0.55–0.70)` ou `var(--color-text-secondary)`
- Terciário/labels: `rgba(255, 255, 255, 0.30–0.45)` ou `var(--color-text-muted)`
- Desabilitado: `rgba(255, 255, 255, 0.20)` ou `var(--color-text-disabled)`

Nota: os aliases de `base.css` (`var(--text-primary)`, etc.) são aceitos em código
existente. Em código novo, preferir os tokens canônicos (`var(--color-text-primary)`).
Não gastar tempo migrando aliases que já funcionam.

## Botões
- Primário: `background: var(--color-brand)` ou `var(--gradient-brand)`, `border-radius: var(--radius-full)`, `color: #fff`
- Secundário/Ghost: `background: rgba(255, 255, 255, 0.06)`, `border: var(--border-width) solid var(--color-border)`, `border-radius: var(--radius-full)`

## Tokens obrigatórios
- Spacing: `var(--space-*)` — 1(4px) 2(8px) 3(12px) 4(16px) 5(20px) 6(24px) 8(32px) 10(40px) 12(48px)
- Font sizes: `var(--font-size-2xs)` até `var(--font-size-5xl)`
- Font weights: `var(--font-weight-medium)` corpo | `var(--font-weight-semibold)` labels | `var(--font-weight-bold)` títulos
- Radius: `var(--radius-*)`
- Transitions: `var(--duration-*)` + `var(--ease-*)`
- Cores semânticas: `var(--color-brand)`, `var(--color-border)`, `var(--color-star)`, `var(--color-accent)`
- Gradientes: `var(--gradient-brand)` para CTAs e destaques hero
- Nunca usar hex hardcoded (exceto `#fff`, `transparent`, padrões `rgba()`)

## Anti-patterns (evitar fortemente)
- `!important`
- Inline styles duplicando stylesheet
- Arquivos CSS novos desnecessários
- `::after` decorativo em títulos (exceto se serve um propósito claro de design)
- `animation: fadeInUp` ou stagger genérico em todo card (usar com intenção, não como default)

## Sobre "regras" vs "julgamento"
Estas são diretrizes, não leis absolutas. Exemplos de quando quebrar a regra é correto:
- `box-shadow` em hover É válido quando cria profundidade intencional (não como default em tudo)
- `linear-gradient` em botões primários é parte do design system (`--gradient-brand`)
- Aliases antigos são aceitáveis em código existente que funciona bem
- Uma animação de entrada pode ser memorável se usada com parcimônia (1 por página, não em todo card)

A pergunta certa não é "isso segue a regra?" mas "isso serve ao design?"
