#!/usr/bin/env python3
"""Classify the complete Git diff; unknown paths and missing history run all checks."""
import argparse
import json
import os
from pathlib import Path
import subprocess

SCOPES = ('governance', 'frontend', 'native', 'browser')
FRONTEND_CONFIG = {
    'package.json', 'package-lock.json', 'next-env.d.ts', 'next.config.ts',
    'tsconfig.json', 'eslint.config.mjs', 'postcss.config.mjs',
    'playwright.config.ts', 'vitest.config.ts',
}
SHARED_PREFIXES = (
    'src/lib/api/', 'src/types/', 'public/fonts/',
    'src-tauri/src/commands/', 'src-tauri/src/domain/',
    'src-tauri/capabilities/', 'src/tests/native/',
)
SHARED_FILES = {
    'src-tauri/resources/codex-presets.json', 'src-tauri/src/lib.rs',
    'src-tauri/prepareChromium.ts', 'src/lib/editor/bookTypography.css',
}


def classify(paths):
    if paths is None:
        return dict.fromkeys(SCOPES, True)
    result = dict.fromkeys(SCOPES, False)
    result['governance'] = True
    for path in paths:
        # Policy files inside application folders do not compile either runtime.
        if (path.endswith('.md') or path.startswith(('docs/', '.agents/', '.codex/',
                '.github/ISSUE_TEMPLATE/')) or path in {'.gitignore', '.github/dependabot.yml'}):
            continue
        if path.startswith(('.github/workflows/', 'scripts/')):
            return dict.fromkeys(SCOPES, True)
        if (path in SHARED_FILES or path.startswith(SHARED_PREFIXES)
                or path.startswith('src-tauri/tauri.') and path.endswith('.json')):
            result.update(frontend=True, native=True, browser=True)
        elif path.startswith('src-tauri/'):
            result['native'] = True
        elif path.startswith(('src/', 'public/', 'branding/')) or path in FRONTEND_CONFIG:
            result.update(frontend=True, browser=True)
            # npm lock/manifests also carry Tauri API/CLI and Chromium dependencies.
            if path in {'package.json', 'package-lock.json'}:
                result['native'] = True
        else:
            return dict.fromkeys(SCOPES, True)
    return result


def changed_paths(env, run=subprocess.run):
    event = env.get('GITHUB_EVENT_NAME')
    if (event in {'workflow_dispatch', 'merge_group'}
            or env.get('GITHUB_REF') == 'refs/heads/main'
            or env.get('BASE_BRANCH') == 'main'):
        return None
    base, head = env.get('BASE_SHA', ''), env.get('HEAD_SHA', 'HEAD')
    if event not in {'pull_request', 'push'} or not base or set(base) == {'0'}:
        return None
    revision = [f'{base}...{head}'] if event == 'pull_request' else [base, head]
    # Disable rename detection so both old and new paths are classified.
    response = run(['git', 'diff', '--name-only', '--no-renames', '-z', *revision, '--'],
                   capture_output=True, check=False)
    if response.returncode:
        print('Cannot resolve diff; selecting complete verification.')
        return None
    return response.stdout.decode('utf-8', errors='surrogateescape').rstrip('\0').split('\0') if response.stdout else []


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('paths', nargs='*', help='Explicit paths for local diagnosis')
    parser.add_argument('--full', action='store_true')
    args = parser.parse_args()
    paths = None if args.full else args.paths or changed_paths(os.environ)
    scopes = classify(paths)
    print(json.dumps(scopes, indent=2))
    if output := os.environ.get('GITHUB_OUTPUT'):
        with Path(output).open('a') as handle:
            for key, value in scopes.items():
                handle.write(f'{key}={str(value).lower()}\n')
    if summary := os.environ.get('GITHUB_STEP_SUMMARY'):
        with Path(summary).open('a') as handle:
            handle.write('## Verification scopes\n\n')
            handle.write('Full verification\n' if paths is None else f'{len(paths)} changed paths\n')
            for key, value in scopes.items():
                handle.write(f'- {key}: {"run" if value else "skip"}\n')


if __name__ == '__main__':
    main()
