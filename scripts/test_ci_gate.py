import unittest

from ci_gate import validate


def native_only():
    return {
        'changes': {'result': 'success', 'outputs': {
            'frontend': 'false', 'native': 'true', 'browser': 'false'}},
        'governance': {'result': 'success'},
        'frontend': {'result': 'skipped'},
        'native': {'result': 'success'},
        'browser': {'result': 'skipped'},
    }


class GateTests(unittest.TestCase):
    def test_unselected_skips_are_valid(self):
        validate(native_only())

    def test_failure_cancellation_or_unexpected_skip_blocks(self):
        for name in ['changes', 'governance', 'native']:
            for result in ['failure', 'cancelled', 'skipped']:
                with self.subTest(name=name, result=result):
                    jobs = native_only()
                    jobs[name]['result'] = result
                    with self.assertRaises(ValueError):
                        validate(jobs)

    def test_missing_scope_never_silently_passes(self):
        jobs = native_only()
        del jobs['changes']['outputs']['native']
        with self.assertRaises(ValueError):
            validate(jobs)

    def test_all_selected_successes_pass(self):
        jobs = native_only()
        for name in ['frontend', 'native', 'browser']:
            jobs['changes']['outputs'][name] = 'true'
            jobs[name]['result'] = 'success'
        validate(jobs)


if __name__ == '__main__':
    unittest.main()
