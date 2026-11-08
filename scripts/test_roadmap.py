import unittest

from sync_roadmap import BEGIN, END, render, replace_section


class RoadmapTests(unittest.TestCase):
    def test_pagination_filters_prs_and_preserves_milestones(self):
        pages = [[{'number': 2, 'title': 'Second', 'state': 'closed',
                   'milestone': {'title': 'v0.2.0'}},
                  {'number': 3, 'pull_request': {}}],
                 [{'number': 1, 'title': 'First', 'state': 'open', 'milestone': None}]]
        result = render(pages, 'owner/repo')
        self.assertLess(result.index('[#1]'), result.index('[#2]'))
        self.assertNotIn('[#3]', result)
        self.assertIn('v0.2.0', result)
        self.assertIn('Sem milestone', result)

    def test_remote_markdown_cannot_inject_links_or_markers(self):
        result = render([[{'number': 1, 'state': 'open',
                           'title': '[link](evil) | <script>\n' + END}]], 'owner/repo')
        self.assertEqual(result.count(END), 1)
        self.assertNotIn('[link]', result)
        self.assertNotIn('<script>', result)

    def test_update_is_idempotent_and_preserves_manual_content(self):
        original = f'Plans\n{BEGIN}\nOld\n{END}\nNotes\n'
        section = render([], 'owner/repo')
        updated = replace_section(original, section)
        self.assertTrue(updated.startswith('Plans\n'))
        self.assertTrue(updated.endswith('\nNotes\n'))
        self.assertEqual(replace_section(updated, section), updated)

    def test_malformed_inputs_fail_before_writing(self):
        for source in ['', END + BEGIN, BEGIN + BEGIN + END]:
            with self.assertRaises(ValueError):
                replace_section(source, 'new')
        with self.assertRaises(ValueError):
            render({'message': 'API error'}, 'owner/repo')


if __name__ == '__main__':
    unittest.main()
