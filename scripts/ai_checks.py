#!/usr/bin/env python3
"""Execute documented verification presets without shell interpolation."""
import argparse
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]


def commands_for(scope, root=ROOT):
    config = tomllib.loads((root / '.agents/project.toml').read_text())
    names = list(config['scopes']) if scope == 'all' else [scope]
    for name in names:
        spec = config['scopes'][name]
        cwd = (root / spec['cwd']).resolve()
        if not cwd.is_relative_to(root.resolve()):
            raise ValueError(f'Working directory outside repository: {cwd}')
        for command in spec['commands']:
            if not command or not all(isinstance(arg, str) for arg in command):
                raise ValueError(f'Invalid command in scope {name}')
            yield cwd, command


def verify(scope, dry_run=False):
    for cwd, command in commands_for(scope):
        print(f'[{cwd.relative_to(ROOT) or "."}] {shlex.join(command)}', flush=True)
        if not dry_run:
            # Resolve npm.cmd/npx.cmd on Windows without enabling a shell.
            executable = shutil.which(command[0])
            if not executable:
                raise FileNotFoundError(f'Required command unavailable: {command[0]}')
            result = subprocess.run([executable, *command[1:]], cwd=cwd, check=False)
            if result.returncode:
                return result.returncode
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['verify'])
    parser.add_argument('--scope', choices=['governance', 'frontend', 'native', 'all'], required=True)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    try:
        return verify(args.scope, args.dry_run)
    except (OSError, ValueError, KeyError) as error:
        print(f'Verification unavailable: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
