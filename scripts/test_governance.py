from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from ai_checks import commands_for, verify
from check_governance import link_errors
from check_versions import validate, versions


class GovernanceTests(unittest.TestCase):
    def test_real_manifest_alignment(self):
        self.assertRegex(validate(versions()), r'^\d+\.\d+\.\d+$')

    def test_mismatched_release_is_rejected(self):
        with self.assertRaises(ValueError):
            validate({'npm': '0.1.0', 'cargo': '0.2.0'})
        with self.assertRaises(ValueError):
            validate({'npm': '0.1.0'}, 'v0.2.0')
        self.assertEqual(validate({'npm': '0.1.0'}, 'v0.1.0'), '0.1.0')

    def test_bad_versions_are_rejected(self):
        for value in ['01.0.0', '1.0', 'one', '1.0.0;echo unsafe']:
            with self.assertRaises(ValueError):
                validate({'version': value})

    def test_links_cannot_escape_checkout(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            file = root / 'test.md'
            (root / 'exists.md').touch()
            self.assertEqual(link_errors(file, '[ok](exists.md)', root), [])
            self.assertEqual(len(link_errors(file, '[bad](../outside.md)', root)), 1)

    def test_dry_run_never_executes(self):
        with patch('ai_checks.subprocess.run') as run:
            self.assertEqual(verify('native', dry_run=True), 0)
            run.assert_not_called()

    def test_runner_stops_on_failure_without_shell(self):
        with patch('ai_checks.shutil.which', return_value='/usr/bin/cargo'), \
                patch('ai_checks.subprocess.run', return_value=subprocess.CompletedProcess([], 9)) as run:
            self.assertEqual(verify('native'), 9)
            self.assertEqual(run.call_count, 1)
            self.assertNotIn('shell', run.call_args.kwargs)

    def test_presets_use_correct_working_directory(self):
        self.assertTrue(all(cwd.name == 'src-tauri' for cwd, _ in commands_for('native')))
        self.assertTrue(all(command[0] != 'npm' for _, command in commands_for('governance')))


if __name__ == '__main__':
    unittest.main()
