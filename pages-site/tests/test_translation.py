import copy
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('translation', Path(__file__).resolve().parents[1] / 'translate_portfolio.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TranslationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / 'assets').mkdir()
        (self.root / 'assets/Faraz_Nawaz_CV.pdf').write_bytes(b'%PDF-test')
        self.snapshot = {'version': 1, 'initialized': True, 'files': [], 'records': [
            {'id': 'p', 'entity': 'Project', 'title_en': 'Electrical project', 'title_ar': 'مشروع كهربائي', 'summary_en': 'Installation inspection'},
            {'id': 'e', 'entity': 'TextOverride', 'path': 'hero.role', 'lang': 'en', 'value': 'Site engineer'}]}
        self.calls = []

    def tearDown(self):
        self.tmp.cleanup()

    def engine(self, text):
        self.calls.append(text)
        return 'ترجمة ' + text

    def run_translation(self, snapshot=None, state=None):
        return module.translate_snapshot(snapshot or self.snapshot, state or {}, self.root, self.engine,
                                         extract=lambda _: [['Electrical Engineer', 'SBC 401 and IEC 60364']],
                                         render=lambda _, out: out.write_bytes(b'%PDF-arabic'))

    def test_initial_translation_and_noop_preserve_manual_arabic(self):
        result, state, count = self.run_translation()
        self.assertEqual(self.snapshot['records'][0].get('summary_ar'), None)
        self.assertEqual(result['records'][0]['title_ar'], 'مشروع كهربائي')
        self.assertIn('ترجمة', result['records'][0]['summary_ar'])
        self.assertEqual(len([r for r in result['records'] if r.get('kind') == 'cv_ar']), 1)
        self.assertEqual(result['translation']['status'], 'complete')
        calls = len(self.calls)
        edited = copy.deepcopy(result)
        edited['records'][0]['summary_ar'] = 'تصحيح يدوي'
        repeated, _, count = self.run_translation(edited, state)
        self.assertEqual(repeated['records'][0]['summary_ar'], 'تصحيح يدوي')
        self.assertEqual(len(self.calls), calls)
        self.assertEqual(count, 0)
        self.assertEqual(repeated['translation'], result['translation'])

    def test_english_changes_update_only_the_matching_arabic(self):
        result, state, _ = self.run_translation()
        result['records'][0]['title_en'] = 'Updated project'
        updated, _, _ = self.run_translation(result, state)
        self.assertIn('updated project', updated['records'][0]['title_ar'])
        self.assertEqual(updated['records'][0]['summary_ar'], result['records'][0]['summary_ar'])

    def test_clearing_english_override_restores_arabic_default(self):
        result, state, _ = self.run_translation()
        result['records'] = [r for r in result['records'] if r['id'] != 'e']
        updated, state, _ = self.run_translation(result, state)
        self.assertFalse(any(r.get('path') == 'hero.role' for r in updated['records']))
        self.assertNotIn('text:hero.role', state['sources'])

    def test_cv_changes_replace_the_arabic_attachment(self):
        result, state, _ = self.run_translation()
        before = next(r for r in result['records'] if r.get('kind') == 'cv_ar')['url']
        (self.root / 'assets/Faraz_Nawaz_CV.pdf').write_bytes(b'%PDF-updated')
        updated, _, _ = self.run_translation(result, state)
        after = [r for r in updated['records'] if r.get('kind') == 'cv_ar']
        self.assertEqual(len(after), 1)
        self.assertNotEqual(after[0]['url'], before)

    def test_standard_codes_contacts_and_numbers_are_preserved(self):
        text = 'Inspection to SBC 401 and IEC 60364. Email faraz@example.com or +966551679504.'
        translated = module.translated(text, self.engine)
        for token in ['SBC 401', 'IEC 60364', 'faraz@example.com', '+966551679504']:
            self.assertIn(token, translated)
            self.assertFalse(any(token in call for call in self.calls))

    def test_reject_external_cv_and_traversal(self):
        for url in ['https://example.com/cv.pdf', module.ORIGIN + 'uploads/../cv.pdf']:
            snapshot = copy.deepcopy(self.snapshot)
            snapshot['records'].append({'entity': 'MediaItem', 'id': 'cv', 'kind': 'cv', 'url': url})
            with self.assertRaises(RuntimeError):
                module.cv_source(snapshot, self.root)


if __name__ == '__main__':
    unittest.main()
