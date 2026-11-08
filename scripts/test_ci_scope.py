import subprocess
import unittest

from ci_scope import classify, changed_paths


class ScopeTests(unittest.TestCase):
    def assert_scopes(self, paths, frontend=False, native=False, browser=False):
        self.assertEqual(classify(paths), dict(governance=True, frontend=frontend,
                                              native=native, browser=browser))

    def test_docs_and_scoped_policy_do_not_compile(self):
        self.assert_scopes(['docs/BUSINESS_RULES.md', 'src/AGENTS.md', 'src-tauri/AGENTS.md'])

    def test_native_implementation_is_native_only(self):
        self.assert_scopes(['src-tauri/src/services/book_service.rs',
                            'src-tauri/migrations/20261108000000_example.sql'], native=True)

    def test_frontend_implementation_does_not_compile_rust(self):
        self.assert_scopes(['src/components/library/Main.tsx'], frontend=True, browser=True)

    def test_cross_boundary_files_check_both(self):
        for path in ['src/lib/api/books.ts', 'src/types/book.ts',
                     'src-tauri/src/commands/book_commands.rs',
                     'src-tauri/src/domain/book.rs', 'public/fonts/example.ttf',
                     'src/lib/editor/bookTypography.css',
                     'src-tauri/resources/codex-presets.json', 'src-tauri/tauri.conf.json',
                     'package-lock.json', 'src/tests/native/webdriver.mjs']:
            with self.subTest(path=path):
                self.assert_scopes([path], frontend=True, native=True, browser=True)

    def test_unknown_and_automation_paths_fail_closed(self):
        for paths in [None, ['new-runtime/config.yml'], ['scripts/ci_scope.py'],
                      ['.github/workflows/verify.yml']]:
            self.assert_scopes(paths, frontend=True, native=True, browser=True)

    def test_combined_change_preserves_both_scopes(self):
        self.assert_scopes(['src/hooks/useBooks.ts', 'src-tauri/src/services/book_service.rs'],
                           frontend=True, native=True, browser=True)

    def test_event_fallbacks(self):
        for env in [{'GITHUB_EVENT_NAME': 'workflow_dispatch'},
                    {'GITHUB_EVENT_NAME': 'merge_group'},
                    {'GITHUB_EVENT_NAME': 'push', 'BASE_SHA': '000000'},
                    {'GITHUB_EVENT_NAME': 'pull_request', 'BASE_BRANCH': 'main'}]:
            self.assertIsNone(changed_paths(env))

    def test_git_failure_runs_all(self):
        self.assertIsNone(changed_paths({'GITHUB_EVENT_NAME': 'push', 'BASE_SHA': 'abc'},
                          run=lambda *args, **kw: subprocess.CompletedProcess(args, 1)))

    def test_pr_uses_merge_base_and_nul_paths_with_renames_disabled(self):
        calls = []

        def run(command, **kwargs):
            calls.append(command)
            return subprocess.CompletedProcess(command, 0, b'src/old.ts\0src-tauri/new.rs\0')

        paths = changed_paths({'GITHUB_EVENT_NAME': 'pull_request', 'BASE_SHA': 'aaa',
                               'HEAD_SHA': 'bbb'}, run=run)
        self.assertEqual(paths, ['src/old.ts', 'src-tauri/new.rs'])
        self.assertIn('aaa...bbb', calls[0])
        self.assertIn('--no-renames', calls[0])

    def test_empty_diff_stays_governance_only(self):
        self.assert_scopes([])


if __name__ == '__main__':
    unittest.main()
