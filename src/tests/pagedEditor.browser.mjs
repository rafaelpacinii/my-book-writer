// Run against a local dev server with Playwright and its browsers installed.
// MBW_PLAYWRIGHT_MODULE accepts the index.mjs path of a temporary Playwright install.
// MBW_EDITOR_TEST_URL selects the server; MBW_TEST_BROWSER selects chromium or firefox.
// This test uses an isolated browser profile and never touches the desktop SQLite database.

import assert from "node:assert/strict";
const { chromium, firefox } = await import(process.env.MBW_PLAYWRIGHT_MODULE ?? "playwright");

const base = process.env.MBW_EDITOR_TEST_URL ?? "http://localhost:3000";
const paragraph = 'Uma história começa com personagens, lugares e acontecimentos. O escritor trabalha cada frase para contar essa história com clareza e ritmo. ';
const book = {
  id: 'pagination-test', profile_id: 'local-default-id', format_id: 'fmt-br-14x21', font_preset_id: 'font-merriweather',
  title: 'Livro de teste', author_name: 'Autor', card_image_asset_id: null, position: 0,
  font_size_pt: 11, line_height_ratio: 1.4, margin_top_um: 20000, margin_bottom_um: 20000,
  margin_left_um: 20000, margin_right_um: 20000, created_at: '2026-10-02', updated_at: '2026-10-02', deleted_at: null,
};
const chapter = {
  id: 'chapter-test', book_id: book.id, title: 'O começo da história', position: 0,
  content_json: JSON.stringify({ type: 'doc', html: `<p>${paragraph.repeat(5)}</p>`.repeat(25) }),
  content_revision: 1, content_schema_version: 1, track_changes_enabled: false,
  created_at: '2026-10-02', updated_at: '2026-10-02', deleted_at: null,
};

(async () => {
  const engine = process.env.MBW_TEST_BROWSER === 'firefox' ? firefox : chromium;
  const browser = await engine.launch({
    headless: true,
    ...(engine === chromium ? { channel: "chromium" } : {}),
    ...(process.env.MBW_BROWSER_PATH ? { executablePath: process.env.MBW_BROWSER_PATH } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(({ book, chapter }) => {
    if (!localStorage.getItem('my_book_writer_books')) localStorage.setItem('my_book_writer_books', JSON.stringify([book]));
    if (!localStorage.getItem('my_book_writer_chapters')) localStorage.setItem('my_book_writer_chapters', JSON.stringify([chapter]));
  }, { book, chapter });
  const page = await context.newPage();
  await page.route('http://localhost:3000/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace('http://localhost:3000', base) });
    await route.fulfill({ response, headers: { ...response.headers(), 'access-control-allow-origin': '*' } });
  });
  page.on('pageerror', error => console.error('PAGE ERROR:', error));
  await page.goto(`${base}/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
  await page.getByRole('button', { name: 'Paginado', exact: true }).click();
  await page.waitForSelector('[data-paged-flow]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const state = () => page.evaluate(() => {
    const content = document.querySelector('.editor-content-paged');
    const flow = document.querySelector('[data-paged-flow]');
    const selection = getSelection();
    return {
      current: Number(document.querySelector('#editor-page').value),
      total: document.querySelector('#editor-page').options.length,
      paragraphCount: content.querySelectorAll('p').length,
      html: content.innerHTML, text: content.textContent,
      style: { font: getComputedStyle(content).fontFamily, minHeight: getComputedStyle(content).minHeight },
      flow: { x: flow.getBoundingClientRect().x, y: flow.getBoundingClientRect().y, height: flow.getBoundingClientRect().height },
      cursor: selection.rangeCount ? [...selection.getRangeAt(0).getClientRects()].map(r => ({ x:r.x, y:r.y })) : [],
    };
  });
  const before = await state();
  assert(before.total > 1);
  assert(parseFloat(before.style.minHeight) < 100, 'paged editor must not have a 480px minimum');
  await page.evaluate(() => {
    const content = document.querySelector('.editor-content-paged');
    content.focus();
    const range = document.createRange();
    range.setStart(content.querySelector('p').firstChild, 15);
    range.collapse(true);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const after = await state();
  assert.equal(after.current, 1, 'Enter near the start of a full page must stay on page one');
  assert.equal(after.paragraphCount, before.paragraphCount + 1);
  assert.equal(after.text.replace(/\u00a0/g, ' '), before.text.replace(/\u00a0/g, ' '));
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(100);
  assert.equal((await state()).paragraphCount, before.paragraphCount, 'undo must restore the Enter');
  await page.locator('#editor-page').selectOption('2');
  await page.waitForTimeout(100);
  assert.equal((await state()).current, 2, 'navigation must not snap back to an old selection');
  assert.equal((await state()).html, before.html);
  await page.screenshot({ path: process.env.MBW_EDITOR_SCREENSHOT ?? "/tmp/mbw-paged-editor.png" });
  console.log('PASS: Enter in a full page, native undo, page navigation, manuscript preservation, physical layout', {pages:before.total,font:before.style.font});
  const loadedFonts = await page.evaluate(() => [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family));
  assert(loadedFonts.includes('Merriweather'), 'the selected local font must actually load');
  const selectEnd = () => page.evaluate(() => {
    const content = document.querySelector('.editor-content-paged');
    content.focus();
    const range = document.createRange();
    range.selectNodeContents(content);
    range.collapse(false);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
  });
  const replaceHtml = async html => {
    await page.evaluate(html => {
      const content = document.querySelector('.editor-content-paged');
      content.focus();
      const range = document.createRange();
      range.selectNodeContents(content);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      document.execCommand('insertHTML', false, html);
    }, html);
    await page.waitForTimeout(150);
  };
  await page.getByTitle('100% tamanho real').click();
  assert.equal((await state()).total, before.total, 'zoom must not affect pagination');
  await selectEnd();
  await page.keyboard.press('Enter');
  await page.keyboard.type('FIM DO CAPITULO');
  await page.waitForTimeout(100);
  const endEdit = await state();
  assert.equal(endEdit.current, endEdit.total, 'typing at the end follows the actual cursor page');
  assert(endEdit.html.includes('FIM DO CAPITULO'));
  await page.getByTitle('Negrito (Ctrl+B)', { exact: true }).click();
  await page.keyboard.type(' TEXTO EM NEGRITO');
  await page.waitForTimeout(1400);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('my_book_writer_chapters'))[0]);
  const savedHtml = JSON.parse(saved.content_json).html;
  assert(savedHtml.includes('TEXTO EM NEGRITO'));
  assert(savedHtml.includes(paragraph.slice(0,40)));
  assert(!savedHtml.includes('data-page-break'), 'automatic page boundaries must not be persisted');
  await page.getByRole('button', { name: 'Contínuo', exact: true }).click();
  assert.equal(await page.locator('.editor-content').innerHTML(), savedHtml, 'view switches retain every page');
  await page.getByRole('button', { name: 'Paginado', exact: true }).click();
  await page.waitForTimeout(150);
  assert.equal((await state()).html, savedHtml);
  console.log('PASS: zoom independence, typing on later pages, toolbar formatting, autosave and view switches');

  await replaceHtml(`<p>${paragraph}</p>`);
  assert.equal((await state()).total, 1, 'deleting content must remove obsolete pages');
  await selectEnd();
  for (let index=0;index<100;index++) await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const blanks = await state();
  assert(blanks.total <= 2, `repeated Enter must not create multiple blank pages (got ${blanks.total})`);
  assert(blanks.text.includes(paragraph.slice(0,40)));
  await replaceHtml(`<p>${paragraph}</p>${'<p><br></p>'.repeat(100)}<p>Depois das linhas vazias.</p>`);
  const pasted = await state();
  assert(pasted.total <= 3, `pasting whitespace must not leave internal blank pages (got ${pasted.total})`);
  assert(pasted.text.includes('Depois das linhas vazias.'));
  await replaceHtml('<p><br></p>'.repeat(100));
  assert.equal((await state()).total, 1, 'an empty chapter must have only one blank sheet');
  await replaceHtml(`<p>${paragraph}</p>${'<br>'.repeat(100)}<p>Depois das quebras.</p>`);
  assert((await state()).total <= 3, 'bare line breaks must not generate internal blank sheets');
  await replaceHtml(`<p><strong>${paragraph.repeat(18)}</strong><em> TEXTO FINAL</em></p>`);
  const longParagraph = await state();
  assert(longParagraph.total > 1, 'one long paragraph must flow across multiple pages');
  assert(longParagraph.html.includes('<strong>') && longParagraph.html.includes('<em>'));
  console.log('PASS: shrinking content, repeated Enter, pasted whitespace, long paragraphs and inline formatting');

  const settingsUrl = `${base}/books/settings?bookId=${book.id}`;
  await page.goto(settingsUrl);
  await page.getByLabel('Unidade de medida').selectOption('in');
  assert.equal(await page.getByLabel('Superior (in)', {exact:true}).inputValue(), '0.7874');
  await page.getByLabel('Superior (in)', {exact:true}).fill('1.25');
  await page.getByLabel('Unidade de medida').selectOption('cm');
  assert.equal(await page.getByLabel('Superior (cm)', {exact:true}).inputValue(), '3.175');
  await page.getByLabel('Unidade de medida').selectOption('in');
  await page.getByLabel('Formato', {exact:true}).selectOption('fmt-us-trade-6x9');
  await page.getByLabel('Fonte', {exact:true}).selectOption('font-inter');
  await page.getByLabel('Tamanho da fonte (pt)', {exact:true}).fill('16');
  await page.getByRole('button', { name:'Salvar alterações', exact:true }).click();
  await page.waitForURL('**/books/view?**');
  const updatedBook = await page.evaluate(() => JSON.parse(localStorage.getItem('my_book_writer_books'))[0]);
  assert.equal(updatedBook.margin_top_um, 31750);
  assert.equal(updatedBook.font_preset_id, 'font-inter');
  await page.goto(`${base}/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
  await page.getByRole('button', { name:'Paginado', exact:true }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const layout = await page.evaluate(() => {
    const paper = document.querySelector('[data-paged-paper]');
    const content = document.querySelector('.editor-content-paged');
    return { width:parseFloat(paper.style.width),height:parseFloat(paper.style.height), font:getComputedStyle(content).fontFamily, size:parseFloat(getComputedStyle(content).fontSize),info:document.querySelector('main > p').textContent };
  });
  assert.equal(layout.width, 576);
  assert.equal(layout.height, 864);
  assert.equal(layout.font, 'Inter');
  assert(Math.abs(layout.size - 16*96/72) < 0.001);
  assert(layout.info.includes('6 × 9 in'));
  await page.goto(settingsUrl);
  const topMargin = page.getByLabel('Superior (in)', {exact:true});
  await topMargin.fill('');
  await topMargin.pressSequentially('1.25');
  assert.equal(await topMargin.inputValue(), '1.25', 'typing decimal measurements must preserve the decimal separator');
  await page.evaluate(() => {
    const books = JSON.parse(localStorage.getItem('my_book_writer_books'));
    books[0].margin_bottom_um = 20321;
    localStorage.setItem('my_book_writer_books', JSON.stringify(books));
  });
  await page.reload();
  assert.equal(await page.getByLabel('Unidade de medida').inputValue(), 'in', 'the chosen unit must persist');
  await page.getByLabel('Título do livro', {exact:true}).fill('Livro com margem precisa');
  await page.getByRole('button', { name:'Salvar alterações', exact:true }).click();
  await page.waitForURL('**/books/view?**');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('my_book_writer_books'))[0].margin_bottom_um), 20321, 'saving unrelated settings must preserve fractional margin precision');
  console.log('PASS: cm/in choice, fractional margins, saving settings, actual format/font/font-size changes');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
