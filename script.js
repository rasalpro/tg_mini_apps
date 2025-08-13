// Telegram Mini App — Instructions viewer
(() => {
  const tg = window.Telegram?.WebApp;
  const content = document.getElementById('content');
  const loader = document.getElementById('loader');
  const notice = document.getElementById('notice');
  const docUrlEl = document.getElementById('docUrl');

  // Read URL params: ?doc=https://... (published Google Doc URL)
  const params = new URLSearchParams(location.search);
  const DOC_URL = params.get('doc') || window.APP_CONFIG?.DOC_PUBLISHED_URL || '';

  function setNotice(text) {
    if (!text) { notice.classList.remove('show'); notice.textContent=''; return; }
    notice.textContent = text; notice.classList.add('show');
  }

  function applyThemeFromTelegram() {
    try {
      if (!tg) return;
      tg.ready();
      tg.expand();
      const tp = tg.themeParams || {};
      document.documentElement.style.setProperty('--bg-color', tp.bg_color || getComputedStyle(document.documentElement).getPropertyValue('--bg-color'));
      document.documentElement.style.setProperty('--card-bg', tp.secondary_bg_color || getComputedStyle(document.documentElement).getPropertyValue('--card-bg'));
      document.documentElement.style.setProperty('--text-color', tp.text_color || getComputedStyle(document.documentElement).getPropertyValue('--text-color'));
      document.documentElement.style.setProperty('--accent', tp.button_color || getComputedStyle(document.documentElement).getPropertyValue('--accent'));
      tg.MainButton.setText('Готово');
      tg.MainButton.onClick(() => tg.close());
      tg.MainButton.show();
    } catch (e) { console.warn(e); }
  }

  async function fetchPublishedGoogleDoc(url) {
    // Expecting "Published to the web" URL (ends with /pub)
    const resp = await fetch(url, { credentials: 'omit', mode: 'cors' });
    if (!resp.ok) throw new Error('Ошибка загрузки документа');
    const html = await resp.text();
    return html;
  }

  function sanitize(html) {
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  }

  function renderHTML(html, srcLabel) {
    const wrapper = document.createElement('article');
    wrapper.className = 'doc';
    wrapper.innerHTML = html;
    content.innerHTML = '';
    content.appendChild(wrapper);
    document.getElementById('docMeta').style.display = 'block';
    docUrlEl.textContent = srcLabel || 'локальный';
  }

  function renderFallback() {
    const html = `
      <div class="card">
        <h2>Как подключить документ из Google Docs</h2>
        <ol>
          <li>Откройте документ в Google Docs.</li>
          <li>В меню <b>Файл → Публикация в Интернете</b> нажмите «Опубликовать».</li>
          <li>Скопируйте публичную ссылку формата <code>https://docs.google.com/document/d/.../pub</code>.</li>
          <li>Передайте её в mini-app через параметр <code>?doc=</code> в URL или задайте в <code>APP_CONFIG.DOC_PUBLISHED_URL</code>.</li>
        </ol>
        <p>Сейчас показан демо-контент. Чтобы увидеть ваш документ — подключите опубликованный URL.</p>
      </div>
    `;
    renderHTML(html, 'демо');
  }

  async function init() {
    applyThemeFromTelegram();
    document.getElementById('btnDone').addEventListener('click', () => {
      if (tg) {
        tg.sendData(JSON.stringify({ action: 'read', ts: Date.now() }));
        tg.close();
      } else {
        setNotice('Откройте в Telegram для полноценной работы Mini App.');
      }
    });
    document.getElementById('btnTheme').addEventListener('click', () => {
      document.body.classList.toggle('light');
    });
    document.getElementById('btnShare').addEventListener('click', async () => {
      const shareUrl = location.href;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setNotice('Ссылка скопирована в буфер обмена');
        setTimeout(()=>setNotice(''), 2000);
      } catch {
        setNotice('Скопируйте ссылку из адресной строки');
        setTimeout(()=>setNotice(''), 2000);
      }
    });

    if (DOC_URL) {
      docUrlEl.textContent = DOC_URL;
      try {
        const html = await fetchPublishedGoogleDoc(DOC_URL);
        renderHTML(sanitize(html), DOC_URL);
      } catch (e) {
        console.error(e);
        setNotice('Не удалось загрузить опубликованный документ. Показываем демо.');
        renderFallback();
      } finally {
        loader.remove();
      }
    } else {
      renderFallback();
      loader.remove();
    }
  }

  window.APP_CONFIG = {
    // Укажи здесь ссылку на опубикованный Google Doc (Файл → Публикация в Интернете)
    DOC_PUBLISHED_URL: ""
  };

  init();
})();
