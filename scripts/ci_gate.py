#!/usr/bin/env python3
"""Fail the required gate when a selected verification did not succeed."""
import json
import os
import sys


def validate(jobs):
    for name in ('changes', 'governance'):
        if jobs[name]['result'] != 'success':
            raise ValueError(f'{name} did not succeed')
    for name in ('frontend', 'native', 'browser'):
        selected = jobs['changes']['outputs'].get(name)
        if selected not in ('true', 'false'):
            raise ValueError(f'Missing scope decision for {name}')
        expected = 'success' if selected == 'true' else 'skipped'
        if jobs[name]['result'] != expected:
            raise ValueError(f'{name}: expected {expected}, got {jobs[name]["result"]}')


if __name__ == '__main__':
    try:
        validate(json.loads(os.environ['NEEDS_JSON']))
        print('All selected verification scopes passed.')
    except (ValueError, KeyError, TypeError) as error:
        print(f'CI gate failed: {error}', file=sys.stderr)
        sys.exit(1)
