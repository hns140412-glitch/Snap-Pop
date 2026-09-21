# SNAP & POP REBUILD MANIFEST V01

## Preserve as domain assets
- semantic-writing-runtime.js
- authorship guard contracts
- learning-context-runtime.js
- vocabulary-material-runtime.js
- voice boundary contracts
- badge/crew contracts
- shared release/PWA/event mechanisms

## Rewrite/split targets
- app.js -> shell + exploration/writing/records composition
- direct DOM handlers -> view controllers/actions
- state mutation -> store/domain actions
- family-expansion-app.js -> family feature module

## Target tree
src/
  shell/
  exploration/
  writing/
  crew/
  badge/
  records/
  family/
  integrations/
  persistence/
  views/

## Migration order
S0 shell/store boundary
S1 exploration state machine
S2 writing session
S3 crew/badge
S4 records/growth
S5 family
S6 integrations + old-path removal after parity

## Guard
Child authorship remains final. Hide vocabulary stays EXPRESSION_MATERIAL_ONLY.
