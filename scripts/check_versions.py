#!/usr/bin/env python3
"""Check application version alignment, without modifying dependency locks."""
import argparse
import json
from pathlib import Path
import re
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]


def versions(root=ROOT):
    package = json.loads((root / 'package.json').read_text())
    lock = json.loads((root / 'package-lock.json').read_text())
    cargo = tomllib.loads((root / 'src-tauri/Cargo.toml').read_text())['package']
    cargo_lock = tomllib.loads((root / 'src-tauri/Cargo.lock').read_text())
    local = [item['version'] for item in cargo_lock['package']
             if item['name'] == cargo['name'] and 'source' not in item]
    if len(local) != 1:
        raise ValueError('Expected exactly one local application package in Cargo.lock')
    return {
        'package.json': package['version'],
        'package-lock.json': lock['version'],
        'package-lock.json packages root': lock['packages']['']['version'],
        'Cargo.toml': cargo['version'], 'Cargo.lock application': local[0],
        'tauri.conf.json': json.loads((root / 'src-tauri/tauri.conf.json').read_text())['version'],
    }


def validate(values, tag=None):
    unique = set(values.values())
    if len(unique) != 1:
        raise ValueError(f'Application versions differ: {values}')
    version = next(iter(unique))
    if not re.fullmatch(r'(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)', version):
        raise ValueError(f'Expected a stable MAJOR.MINOR.PATCH version: {version}')
    if tag is not None and tag != f'v{version}':
        raise ValueError(f'Tag {tag} does not match v{version}')
    return version


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tag', help='Optional exact release tag, such as v0.1.0')
    args = parser.parse_args()
    try:
        print(f'Application version aligned: {validate(versions(), args.tag)}')
        return 0
    except (OSError, ValueError, KeyError) as error:
        print(error, file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
