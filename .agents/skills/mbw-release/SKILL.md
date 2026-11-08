---
name: mbw-release
description: "Preparar versão e candidato Windows do My Book Writer com issues, manifests alinhados e evidências de entrega, sem publicação implícita."
---

# mbw-release

Leia [workflow](../../../docs/development/workflow.md),
[CI/CD](../../../docs/development/ci-cd.md) e [estado](../../../docs/SYSTEM_STATE.md).

1. Confirme escopo das issues/milestone e compatibilidade. Versão atual de manifest
   não prova release publicada. Selecione impacto pelo conjunto de mudanças.
2. Alinhe os manifests documentados e seus lockfiles usando as ferramentas dos
   respectivos ecossistemas. Execute `python3 scripts/check_versions.py`.
3. Rode governança, frontend, Rust e browser. Registre diferenças entre testes
   locais, WebView2 e homologação de instalador; não declare etapas ausentes verdes.
4. Prepare notas e comandos para branch/tag/PR concretos. O workflow manual
   Windows produz instalador NSIS e checksum para revisão; não publica release.
5. Disparar workflow remoto, criar issue/PR/tag, push ou publicar só quando a ação
   estiver autorizada pelo usuário. Uma autorização existente não exige nova
   confirmação. Não configure certificado/updater sem decisão específica.
