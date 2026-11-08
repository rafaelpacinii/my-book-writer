#!/usr/bin/env python3
"""Read GitHub issues and render a local roadmap section; never mutate GitHub."""
import argparse
import html
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BEGIN = '<!-- BEGIN:github-issues -->'
END = '<!-- END:github-issues -->'


def safe_cell(value):
    return html.escape(str(value), quote=False).replace('|', '&#124;').replace('\n', ' ').replace('\r', ' ').replace('`', '&#96;').replace('[', '&#91;').replace(']', '&#93;')


def render(pages, repo):
    if not isinstance(pages, list) or not all(isinstance(page, list) for page in pages):
        raise ValueError('Expected paginated arrays of GitHub issues')
    issues = [issue for page in pages for issue in page if 'pull_request' not in issue]
    lines = [BEGIN, f'Fonte: `{repo}`. Sincronização manual; fechado não implica entregue.', '',
             '| Issue | Estado | Milestone | Título |', '| --- | --- | --- | --- |']
    for issue in sorted(issues, key=lambda item: item['number']):
        number = issue['number']
        if not isinstance(number, int) or number < 1 or issue['state'] not in {'open', 'closed'}:
            raise ValueError('Invalid issue number/state')
        milestone = (issue.get('milestone') or {}).get('title', 'Sem milestone')
        lines.append(f'| [#{number}](https://github.com/{repo}/issues/{number}) | '
                     f'{issue["state"]} | {safe_cell(milestone)} | {safe_cell(issue["title"])} |')
    if not issues:
        lines.append('| — | — | — | Nenhuma issue encontrada |')
    return '\n'.join([*lines, END])


def replace_section(original, section):
    if original.count(BEGIN) != 1 or original.count(END) != 1:
        raise ValueError('Roadmap must have exactly one pair of issue markers')
    start, end = original.index(BEGIN), original.index(END)
    if start >= end:
        raise ValueError('Roadmap markers are reversed')
    return original[:start] + section + original[end + len(END):]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='rafaelpacinii/my-book-writer')
    parser.add_argument('--write', action='store_true', help='Update local docs/ROADMAP.md only')
    parser.add_argument('--from-json', type=Path, help='Offline fixture: array of API response pages')
    args = parser.parse_args()
    if not re.fullmatch(r'[\w.-]+/[\w.-]+', args.repo):
        parser.error('Expected owner/repository')
    try:
        if args.from_json:
            raw = args.from_json.read_text()
        else:
            response = subprocess.run(['gh', 'api', '--method', 'GET', '--paginate', '--slurp',
                                       f'repos/{args.repo}/issues?state=all&per_page=100'],
                                      capture_output=True, text=True, check=False, timeout=120)
            if response.returncode:
                raise ValueError('GitHub issue read failed; check gh authentication/network. Roadmap unchanged.')
            raw = response.stdout
        section = render(json.loads(raw), args.repo)
        roadmap = ROOT / 'docs/ROADMAP.md'
        updated = replace_section(roadmap.read_text(), section)
        if args.write:
            temporary = roadmap.with_suffix('.md.tmp')
            temporary.write_text(updated)
            temporary.replace(roadmap)
            print('Updated local docs/ROADMAP.md; review the diff before committing.')
        else:
            print(section)
        return 0
    except (OSError, ValueError, KeyError, TypeError, subprocess.TimeoutExpired) as error:
        print(f'Roadmap synchronization failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
