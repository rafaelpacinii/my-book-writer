#!/usr/bin/env python3
"""Validate canonical governance entrypoints and their local links, offline."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'TASK.md',
    'docs/README.md', 'docs/ai-governance.md', 'docs/BUSINESS_RULES.md',
    'docs/CONVENTIONS.md', 'docs/SYSTEM_STATE.md', 'docs/ROADMAP.md',
    'docs/development/workflow.md', 'docs/development/ci-cd.md',
    'docs/adr/0001-ai-governance-and-scoped-ci.md',
    '.codex/instructions.md', '.github/copilot-instructions.md',
    '.agents/rules/frontend.md', '.agents/rules/tauri-rust.md',
    '.agents/rules/governance.md',
)
SKILLS = ('mbw-feature', 'mbw-frontend', 'mbw-native', 'mbw-migration', 'mbw-export', 'mbw-release')


def link_errors(file, text, root):
    # Validate Markdown file targets, not external URLs or historical anchor slugs.
    text = re.sub(r'```.*?```', '', text, flags=re.S)
    errors = []
    for target in re.findall(r'\[[^\]]*\]\(([^\s)]+)\)', text):
        if re.match(r'^[a-zA-Z][\w+.-]*:', target) or target.startswith('#'):
            continue
        target = unquote(target.split('#')[0])
        destination = (file.parent / target).resolve()
        if not destination.is_relative_to(root.resolve()) or not destination.exists():
            errors.append(f'{file.relative_to(root)}: missing/nonportable link {target}')
    return errors


def check(root=ROOT):
    errors = []
    paths = [root / name for name in REQUIRED]
    paths += [root / f'.agents/skills/{name}/SKILL.md' for name in SKILLS]
    for file in paths:
        if not file.is_file():
            errors.append(f'Missing {file.relative_to(root)}')
            continue
        text = file.read_text()
        errors.extend(link_errors(file, text, root))
        if file.name in {'AGENTS.md', 'CLAUDE.md', 'SKILL.md', 'instructions.md', 'copilot-instructions.md'}:
            if len(text.splitlines()) > 180 or len(text) > 12000:
                errors.append(f'{file.relative_to(root)} exceeds entrypoint budget')
        if file.name == 'SKILL.md':
            match = re.match(r'^---\nname: ([a-z0-9-]+)\ndescription: "([^\n]+)"\n---\n', text)
            if not match or match[1] != file.parent.name:
                errors.append(f'{file.relative_to(root)}: invalid skill metadata')
    for name in ('src/AGENTS.md', 'src-tauri/AGENTS.md', '.agents/project.toml'):
        if not (root / name).is_file():
            errors.append(f'Missing {name}')
    return errors


if __name__ == '__main__':
    failures = check()
    print('\n'.join(failures) if failures else 'Governance metadata and local links: OK')
    sys.exit(bool(failures))
