"""Run English -> Arabic neural translation locally in GitHub Actions.

No API keys, public translation endpoint, or browser credentials are used.
English is the source of truth. Existing human Arabic is kept until its English
source changes. State hashes make repeat builds cheap and keep manual Arabic edits.
"""
import copy
import hashlib
import html
import json
import os
from pathlib import Path
import re
import sys
import uuid
from datetime import datetime, timezone
from urllib.parse import unquote, urlparse

ORIGIN = 'https://iemfaraz.github.io/faraz-engineering-portfolio/'
ENGINE = 'Argos Translate en-ar (local neural model)'
VERSION = 1
CV_TRANSLATION_REVISION = 2
GLOSSARY = {
    'Faraz Nawaz': 'فراز نواز', 'Electrical Engineer': 'مهندس كهربائي',
    'Electrical Engineering': 'الهندسة الكهربائية', 'Technical Office': 'المكتب الفني',
    'Site Execution': 'تنفيذ الأعمال بالموقع', 'Site Supervision': 'الإشراف على الموقع',
    'Site Coordination': 'تنسيق أعمال الموقع', 'Power Systems': 'أنظمة القوى الكهربائية',
    'Power Distribution': 'توزيع القوى الكهربائية', 'Load Calculations': 'حسابات الأحمال',
    'Panel Sizing': 'تحديد سعات اللوحات', 'Panel Schedules': 'جداول اللوحات',
    'Panel Schedule': 'جدول اللوحات', 'Single Line Diagrams': 'المخططات أحادية الخط',
    'Single Line Diagram': 'المخطط أحادي الخط', 'Shop Drawings': 'المخططات التنفيذية',
    'Material Submittals': 'اعتمادات المواد', 'Structured Cabling': 'الكابلات الهيكلية',
    'Data Networks': 'شبكات البيانات', 'Fire Alarm Systems': 'أنظمة إنذار الحريق',
    'Fire Alarm': 'إنذار الحريق', 'Access Control': 'التحكم بالدخول',
    'Lighting Design': 'تصميم الإنارة', 'Lighting Simulations': 'محاكاة الإنارة',
    'Lux Calculations': 'حسابات شدة الاستضاءة', 'Clash Detection': 'كشف التعارضات',
    'BIM Coordination': 'تنسيق نمذجة معلومات البناء', 'Site Management': 'إدارة الموقع',
    'Bills of Quantities': 'جداول الكميات', 'Bill of Quantities': 'جدول الكميات',
    'Testing and Commissioning': 'الاختبارات والتشغيل', 'Testing & Commissioning': 'الاختبارات والتشغيل',
    'Work Inspection Requests': 'طلبات فحص الأعمال', 'Requests for Information': 'طلبات الاستيضاح',
    'As-built Drawings': 'مخططات حسب التنفيذ', 'As-built': 'حسب التنفيذ',
    'Transferable Iqama': 'إقامة قابلة للنقل', 'Valid Driving License': 'رخصة قيادة سارية',
    'Available Immediately': 'متاح للعمل فوراً', 'Professional Summary': 'الملخص المهني',
    'Core Skills': 'المهارات الأساسية', 'Professional Experience': 'الخبرة المهنية',
    'Education': 'المؤهلات العلمية', 'Certifications and Memberships': 'الشهادات والعضويات',
    'Bachelor of Science': 'بكالوريوس العلوم', 'Registered Engineer': 'مهندس مسجل',
    'Pakistan Engineering Council': 'المجلس الهندسي الباكستاني',
    'Saudi Arabia': 'المملكة العربية السعودية', 'Riyadh': 'الرياض', 'Khobar': 'الخبر',
    'Basmat Al-Riyada Engineering Consultancy': 'بصمة الريادة للاستشارات الهندسية',
    'Fawzi Saleh Al-Najrani Co.': 'شركة فوزي صالح النجراني',
    'Saleh Zuhair Al-Shamrani Holding Co.': 'شركة صالح زهير الشمراني القابضة',
    'Real Estate General Authority': 'الهيئة العامة للعقار', 'Commercial Court': 'المحكمة التجارية',
    'January': 'يناير', 'February': 'فبراير', 'March': 'مارس', 'April': 'أبريل',
    'June': 'يونيو', 'July': 'يوليو', 'August': 'أغسطس', 'September': 'سبتمبر',
    'October': 'أكتوبر', 'November': 'نوفمبر', 'December': 'ديسمبر',
    'Jan': 'يناير', 'Feb': 'فبراير', 'Mar': 'مارس', 'Apr': 'أبريل', 'May': 'مايو',
    'Jun': 'يونيو', 'Jul': 'يوليو', 'Aug': 'أغسطس', 'Sep': 'سبتمبر', 'Oct': 'أكتوبر',
    'Nov': 'نوفمبر', 'Dec': 'ديسمبر', 'KSA': 'المملكة العربية السعودية',
}


def digest(value):
    if not isinstance(value, bytes):
        value = json.dumps(value, ensure_ascii=False, sort_keys=True).encode()
    return hashlib.sha256(value).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat()


def record_id(key):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, ORIGIN + key))


def load_json(path, default):
    return json.loads(path.read_text()) if path.exists() else copy.deepcopy(default)


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


class NeuralTranslator:
    """Lazy model installation; only model/package downloads leave the runner."""
    def __init__(self):
        self.translation = None
        self.cache = {}

    def __call__(self, text):
        if text in self.cache:
            return self.cache[text]
        if self.translation is None:
            os.environ.setdefault('ARGOS_CHUNK_TYPE', 'MINISBD')
            os.environ.setdefault('ARGOS_INTRA_THREADS', '2')
            os.environ.setdefault('ARGOS_COMPUTE_TYPE', 'int8')
            import argostranslate.package as package
            import argostranslate.translate as translate
            packages = package.get_installed_packages()
            if not any(p.from_code == 'en' and p.to_code == 'ar' for p in packages):
                package.update_package_index()
                model = next((p for p in package.get_available_packages()
                              if p.from_code == 'en' and p.to_code == 'ar'), None)
                if model is None:
                    raise RuntimeError('The English-Arabic model is unavailable. Retry the workflow later.')
                package.install_from_path(model.download())
            languages = translate.get_installed_languages()
            self.translation = next(x for x in languages if x.code == 'en').get_translation(
                next(x for x in languages if x.code == 'ar'))
        self.cache[text] = self.translation.translate(text)
        return self.cache[text]


def translated(text, engine):
    text = text.strip()
    if not text or not re.search('[a-zA-Z]', text):
        return text
    # Do not send identifiers through the model; preserve email, URLs, numbers,
    # engineering acronyms and standards byte-for-byte in translated prose.
    acronyms = 'QA/QC SBC IEC NEC NFPA SEC SASO ASTM ISO IEEE EN BS UL LV MV HV ELV MEP BIM SLD BOQ RFI WIR MIR ITP NCR CCTV UPS DG HVAC BMS ICT PLC SCADA PEC HSE GCC AutoCAD Revit DIALux Navisworks'.split()
    glossary = {key.lower(): value for key, value in GLOSSARY.items()}
    phrases = '|'.join(re.escape(key) for key in sorted(GLOSSARY, key=len, reverse=True))
    pattern = r'https?://\S+|[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}|\+?\d[\d ./–-]*\d|\b[A-Za-z][A-Za-z/_.-]*\d[A-Za-z0-9/_.-]*\b|(?<!\w)(?:' + phrases + r')(?!\w)|\b(?:' + '|'.join(map(re.escape, acronyms)) + r')(?:\s+\d[\d./-]*)?\b'
    tokens = re.split('(' + pattern + ')', text, flags=re.IGNORECASE)
    result = []
    for index, part in enumerate(tokens):
        if index % 2 or not part.strip():
            result.append(glossary.get(part.lower(), part))
            continue
        leading = ' ' if part.startswith(' ') else ''
        trailing = ' ' if part.endswith(' ') else ''
        pieces = re.split(r'(\s*[|•:]\s*)', part.strip())
        output = []
        for piece_index, piece in enumerate(pieces):
            if piece_index % 2 or not re.search('[a-zA-Z]', piece):
                output.append(piece)
                continue
            value = engine(piece.strip().replace('&', ' and ').lower())
            if not value or not isinstance(value, str):
                raise RuntimeError('The translation model returned empty text.')
            output.append(html.unescape(value.strip()))
        result.append(leading + ''.join(output) + trailing)
    return ''.join(result)


def cv_source(snapshot, root):
    source = next((r for r in snapshot['records']
                   if r['entity'] == 'MediaItem' and r.get('kind') == 'cv'), None)
    url = source['url'] if source else ORIGIN + 'assets/Faraz_Nawaz_CV.pdf'
    if url.startswith(ORIGIN):
        relative = unquote(url[len(ORIGIN):])
    elif url.startswith('/assets/'):
        relative = url[1:]
    else:
        raise RuntimeError('Upload the English CV PDF in the CV tab; external CV URLs cannot be translated safely.')
    if not re.fullmatch(r'(uploads|assets)/[a-zA-Z0-9_.-]+\.pdf', relative):
        raise RuntimeError('The English CV must be a PDF uploaded to this repository.')
    path = root / relative
    if not path.exists() and relative.startswith('assets/'):
        path = root / 'independent/public' / relative
    if not path.is_file() or path.stat().st_size > 25 * 1024 * 1024:
        raise RuntimeError('The English CV file is missing or exceeds 25 MB.')
    return source, path, url


def extract_cv(path):
    import pymupdf
    pages = []
    with pymupdf.open(path) as doc:
        if doc.needs_pass:
            raise RuntimeError('Upload an English CV PDF without password protection.')
        if len(doc) > 12:
            raise RuntimeError('Automatic CV translation supports up to 12 pages.')
        for page in doc:
            textpage = None
            if len(page.get_text().strip()) < 40:
                textpage = page.get_textpage_ocr(language='eng', dpi=150, full=True)
            blocks = page.get_text('blocks', textpage=textpage, sort=True)
            lines = []
            for block in blocks:
                if block[6] != 0 or not block[4].strip():
                    continue
                value = ' '.join(block[4].split())
                if lines and value[0].islower() and not re.search(r'[.!?:]$', lines[-1]):
                    lines[-1] += ' ' + value
                else:
                    lines.append(value)
            if not lines:
                raise RuntimeError('The CV could not be read. Upload a clear English PDF.')
            pages.append(lines)
    if sum(len(line) for page in pages for line in page) > 40000:
        raise RuntimeError('The CV contains too much text for automatic translation.')
    return pages


def render_cv(pages, target):
    from weasyprint import HTML
    def paragraph(line):
        pieces = re.split(r'([A-Za-z0-9@+][A-Za-z0-9@+ ._:/&()–-]*[A-Za-z0-9)])', line)
        return ''.join('<bdi dir="ltr">' + html.escape(p) + '</bdi>' if i % 2 else html.escape(p)
                       for i, p in enumerate(pieces))
    headings = {'الملخص المهني', 'المهارات الأساسية', 'الخبرة المهنية', 'المؤهلات العلمية', 'الشهادات والعضويات'}
    lines = [line for page in pages for line in page]
    title = lines[0] if lines else 'السيرة الذاتية'
    paragraphs = ''.join(('<h2>' + paragraph(line) + '</h2>') if line in headings else
                         ('<p>' + paragraph(line) + '</p>') for line in lines[1:])
    markup = '''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
    <title>السيرة الذاتية - فراز نواز</title><style>
    @page {size:A4; margin:17mm 17mm 18mm; @bottom-center {content:counter(page);font:9pt sans-serif;color:#64748b}}
    body {font-family:'Noto Sans Arabic','DejaVu Sans',sans-serif;font-size:10.5pt;line-height:1.7;color:#172033}
    h1 {font-size:21pt;line-height:1.4;color:#17365a;margin:0 0 4mm}
    h2 {font-size:11pt;letter-spacing:0;margin:4mm 0;border-bottom:1px solid #cbd5e1;padding-bottom:2mm;color:#17365a}
    p {margin:0 0 3mm;overflow-wrap:anywhere;orphans:2;widows:2;unicode-bidi:plaintext}
    h2 {break-after:avoid}
    </style><body><h1>''' + paragraph(title) + '</h1>' + paragraphs + '</body></html>'
    HTML(string=markup).write_pdf(target)


def translate_snapshot(snapshot, state, root, engine, extract=extract_cv, render=render_cv, defaults=None):
    result = copy.deepcopy(snapshot)
    state = copy.deepcopy(state)
    old = state.setdefault('sources', {})
    records = result['records']
    stamp = now()
    count = 0
    localized = result.setdefault('localization', {}).setdefault('ar', {})
    for group in ['projects', 'media', 'recommendations']:
        localized.setdefault(group, {})

    def process(key, source, existing, setter):
        nonlocal count
        hashed = digest(source)
        if old.get(key) == hashed:
            return
        # First run respects pre-existing, edited Arabic instead of replacing it.
        if key in old or not existing:
            setter(translated(source, engine))
            count += 1
        old[key] = hashed

    # Every shared display field also needs an Arabic value. Keep these separate
    # from canonical English records so editing English never edits the source.
    groups = {'Project': ('projects', ['tags', 'engagement', 'office', 'period', 'disciplines', 'standards']),
              'MediaItem': ('media', ['title', 'note']),
              'Recommendation': ('recommendations', ['name', 'job_title', 'company', 'relation', 'message'])}
    for row in list(records):
        if row['entity'] not in groups:
            continue
        if row['entity'] == 'MediaItem' and row.get('kind') == 'cv_ar':
            continue
        group, fields = groups[row['entity']]
        target = localized[group].setdefault(row['id'], {})
        for field in fields:
            source = row.get(field, '')
            key = 'display:' + row['entity'] + ':' + row['id'] + ':' + field
            if old.get(key) == digest(source) and field in target:
                continue
            if field in ['tags', 'disciplines', 'standards']:
                value = ', '.join(translated(part, engine) for part in source.split(',') if part.strip())
            elif field == 'title' and re.search(r'\.(pdf|mp4|webm|jpg|jpeg|png|webp)$', source, re.I):
                value = {'intro_video': 'الفيديو التعريفي', 'project_video': 'فيديو المشروع',
                         'cv': 'السيرة الذاتية بالإنجليزية', 'cv_ar': 'السيرة الذاتية بالعربية',
                         'profile_photo': 'الصورة الشخصية', 'project_cover': 'صورة المشروع'}.get(row.get('kind'), 'ملف مرفق')
            else:
                value = translated(source, engine)
            target[field] = value
            old[key] = digest(source)
            count += 1
    for entity, (group, _) in groups.items():
        ids = {r['id'] for r in records if r['entity'] == entity}
        localized[group] = {key: value for key, value in localized[group].items() if key in ids}

    # Source-code English dictionary edits are covered as well as dashboard edits.
    if defaults:
        def flatten(value, prefix=''):
            if isinstance(value, str):
                return {prefix: value}
            out = {}
            items = enumerate(value) if isinstance(value, list) else value.items() if isinstance(value, dict) else []
            for key, child in items:
                out.update(flatten(child, (prefix + '.' if prefix else '') + str(key)))
            return out
        english = flatten(defaults['en'])
        arabic = flatten(defaults['ar'])
        generated = {r['path']: r['value'] for r in localized.get('dictionary', [])}
        for path, source in english.items():
            process('default:' + path, source, generated.get(path, arabic.get(path)),
                    lambda value, p=path: generated.update({p: value}))
        localized['dictionary'] = [{'path': p, 'value': value} for p, value in generated.items() if p in english]

    for row in list(records):
        if row['entity'] == 'Project':
            for field in ['title', 'summary', 'scope']:
                process('project:' + row['id'] + ':' + field, row.get(field + '_en', ''),
                        row.get(field + '_ar'), lambda value, r=row, f=field: r.update({f + '_ar': value}))
        elif row['entity'] == 'TextOverride' and row['lang'] == 'en':
            arabic = next((r for r in records if r['entity'] == 'TextOverride'
                           and r['lang'] == 'ar' and r['path'] == row['path']), None)

            def set_override(value, source=row, target=arabic):
                if target is not None:
                    target['value'] = value
                else:
                    records.append({'id': record_id('text-ar/' + source['path']), 'entity': 'TextOverride',
                                    'created_date': stamp, 'lang': 'ar', 'path': source['path'], 'value': value})
            # English overrides explicitly request matching Arabic even on first run.
            key = 'text:' + row['path']
            if key not in old:
                old[key] = ''
            process(key, row['value'], arabic.get('value') if arabic else None, set_override)

    # Clearing an English override restores the original Arabic dictionary string.
    active_paths = {r['path'] for r in records if r['entity'] == 'TextOverride' and r['lang'] == 'en'}
    for key in list(old):
        if key.startswith('text:') and key[5:] not in active_paths:
            path = key[5:]
            records[:] = [r for r in records if not (r['entity'] == 'TextOverride' and r.get('lang') == 'ar' and r.get('path') == path)]
            del old[key]

    source, path, url = cv_source(result, root)
    source_hash = digest([digest(path.read_bytes()), CV_TRANSLATION_REVISION])
    prior_cv = state.get('cv', {})
    current_arabic = next((r for r in records if r['id'] == prior_cv.get('media_id')), None)
    has_arabic_file = current_arabic and any(f['path'] == current_arabic['url'].removeprefix(ORIGIN) and (root / f['path']).is_file() for f in result['files'])
    if prior_cv.get('hash') != source_hash or not has_arabic_file:
        pages = [[translated(line, engine) for line in page] for page in extract(path)]
        if not pages or not any(re.search(r'[\u0600-\u06ff]', line) for p in pages for line in p):
            raise RuntimeError('The CV translation did not produce readable Arabic. Retry the workflow.')
        file_id = record_id('cv-ar/' + source_hash) + '.pdf'
        output = root / 'uploads' / file_id
        output.parent.mkdir(exist_ok=True)
        render(pages, output)
        cv_id = record_id('cv-version-ar')
        media_id = record_id('cv-media-ar')
        records[:] = [r for r in records if r['id'] != cv_id and not (r['entity'] == 'MediaItem' and r.get('kind') == 'cv_ar')]
        cv = {'name': 'السيرة الذاتية', 'sections': [{'heading': 'الصفحة ' + str(i), 'lines': lines} for i, lines in enumerate(pages, 1)]}
        content = json.dumps(cv, ensure_ascii=False)
        if len(content) > 60000:
            output.unlink(missing_ok=True)
            raise RuntimeError('The translated CV is too long. Upload a shorter CV.')
        records.extend([
            {'id': cv_id, 'entity': 'CvVersion', 'created_date': stamp,
             'source_title': source.get('title', path.name) if source else path.name,
             'content': content, 'translated_at': stamp},
            {'id': media_id, 'entity': 'MediaItem', 'created_date': stamp, 'kind': 'cv_ar',
             'title': 'السيرة الذاتية بالعربية', 'url': ORIGIN + 'uploads/' + file_id, 'order': 0}
        ])
        result['files'] = [f for f in result['files'] if f['id'] != file_id]
        result['files'].append({'id': file_id, 'path': 'uploads/' + file_id,
                                'name': 'Faraz_Nawaz_CV_Arabic.pdf', 'mime': 'application/pdf',
                                'size': output.stat().st_size, 'created_at': stamp})
        state['cv'] = {'hash': source_hash, 'source_url': url, 'media_id': media_id, 'version_id': cv_id}
        count += 1
    # Preserve timestamps on no-op builds to avoid pointless commits.
    prior = snapshot.get('translation', {})
    result['translation'] = {**prior, 'status': 'complete', 'engine': ENGINE,
                             'cv_source_url': url, 'cv_media_id': state['cv']['media_id'],
                             'cv_version_id': state['cv']['version_id']}
    result['translation'].pop('error', None)
    if count or prior.get('status') != 'complete':
        result['translation']['updated_at'] = stamp
    state['version'] = VERSION
    return result, state, count


def main():
    root = Path(__file__).resolve().parent.parent
    snapshot_path = root / 'portfolio-data.json'
    state_path = root / 'translation-state.json'
    original = load_json(snapshot_path, {})
    try:
        defaults_path = os.getenv('PORTFOLIO_TRANSLATION_SOURCE')
        defaults = load_json(Path(defaults_path), None) if defaults_path else None
        result, state, count = translate_snapshot(original, load_json(state_path, {}), root, NeuralTranslator(), defaults=defaults)
        write_json(snapshot_path, result)
        write_json(state_path, state)
        message = 'Arabic translation completed. Updated groups: ' + str(count)
    except Exception as error:
        # English edits are still published; retain last good Arabic and state for retry.
        result = copy.deepcopy(original)
        result['translation'] = {**result.get('translation', {}), 'status': 'error', 'error':
                                 'Arabic translation failed. Check GitHub Actions and retry from AI translation.',
                                 'updated_at': now(), 'engine': ENGINE}
        write_json(snapshot_path, result)
        print('::warning::Arabic translation failed: ' + type(error).__name__)
        print(str(error)[:250].replace('\n', ' '))
        message = 'Arabic translation failed. English was preserved; retry from the dashboard.\n'
    summary = os.getenv('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a') as stream:
            stream.write(message + '\n')
    print(message)


if __name__ == '__main__':
    main()
