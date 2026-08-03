const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const DIST_DIR = path.join(__dirname, '..', 'dist');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function getCss() {
  return `
:root {
  --bg-primary: #0b0f19;
  --bg-card: rgba(23, 31, 51, 0.7);
  --bg-card-hover: rgba(30, 41, 67, 0.85);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-glow: rgba(99, 102, 241, 0.4);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --accent-primary: #6366f1;
  --accent-secondary: #a855f7;
  --accent-cyan: #06b6d4;
  --gradient-main: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%);
  --gradient-bg: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 70%);
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-glow: 0 0 25px rgba(99, 102, 241, 0.25);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-primary);
  background-image: var(--gradient-bg);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  line-height: 1.6;
}

header {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(11, 15, 25, 0.8);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 2rem;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--text-main);
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: var(--gradient-main);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  box-shadow: var(--shadow-glow);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
}

.nav-links a:hover, .nav-links a.active {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  flex: 1;
  width: 100%;
}

.hero {
  text-align: center;
  padding: 4rem 1rem;
  margin-bottom: 3rem;
  position: relative;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 50px;
  color: #a5b4fc;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin-bottom: 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 650px;
  margin: 0 auto 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-main);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-glow);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3), var(--shadow-glow);
}

.card:hover::before {
  opacity: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-main);
}

.card-description {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
}

.timestamp {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

footer {
  border-top: 1px solid var(--border-color);
  padding: 2.5rem 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: rgba(11, 15, 25, 0.9);
  margin-top: auto;
}

footer a {
  color: var(--accent-cyan);
  text-decoration: none;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.25rem;
  }
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }
}
`;
}

function renderHtml({ title, pageTitle, pagesNav, currentSlug, contentItems }) {
  const css = getCss();

  const navHtml = pagesNav.map(nav => `
    <li>
      <a href="${nav.slug}.html" class="${nav.slug === currentSlug ? 'active' : ''}">${nav.page}</a>
    </li>
  `).join('');

  const cardsHtml = contentItems.map(item => `
    <div class="card">
      <h2 class="card-title">${item.title}</h2>
      <p class="card-description">${item.description}</p>
      <div class="card-meta">
        <span class="timestamp">⚡ Published Page: ${item.page}</span>
        <span>${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Just now'}</span>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Published Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body>
  <header>
    <div class="header-container">
      <a href="index.html" class="brand">
        <div class="brand-icon">P</div>
        <span>Publish Flow</span>
      </a>
      <nav>
        <ul class="nav-links">
          ${navHtml}
        </ul>
      </nav>
    </div>
  </header>

  <main class="container">
    <section class="hero">
      <div class="badge">
        <span class="badge-dot"></span> Live CMS Pipeline Active
      </div>
      <h1>${pageTitle}</h1>
      <p>Automated static site generator compiled from CMS content & deployed via GitHub Actions to Hostinger.</p>
    </section>

    <section class="content-grid">
      ${cardsHtml}
    </section>
  </main>

  <footer>
    <p>Powered by <strong>Publish Flow Engine</strong> • Built with Node.js, Express, GitHub Actions & Hostinger</p>
  </footer>
</body>
</html>`;
}

function build() {
  console.log('🚀 Starting Static Site Generator build process...');
  cleanDist();

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(`⚠️ Content directory not found at ${CONTENT_DIR}. Creating empty directory.`);
    ensureDir(CONTENT_DIR);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.json'));
  console.log(`📄 Found ${files.length} content file(s) in ${CONTENT_DIR}`);

  const contentItems = [];
  files.forEach(file => {
    try {
      const filePath = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const slug = path.basename(file, '.json');
      contentItems.push({
        slug,
        file,
        page: data.page || slug,
        title: data.title || 'Untitled',
        description: data.description || '',
        updatedAt: data.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.error(`❌ Failed to parse JSON file ${file}:`, err.message);
    }
  });

  // Prepare navigation list
  const pagesNav = contentItems.map(item => ({
    page: item.page,
    slug: item.slug === 'home' ? 'index' : item.slug
  }));

  // Render each page
  if (contentItems.length === 0) {
    // Render fallback home page
    const fallbackItem = {
      page: 'Home',
      title: 'Welcome to Publish Flow',
      description: 'No content files found yet. Publish your first page via the CMS Client App!',
      updatedAt: new Date().toISOString()
    };
    const html = renderHtml({
      title: 'Home',
      pageTitle: fallbackItem.title,
      pagesNav: [{ page: 'Home', slug: 'index' }],
      currentSlug: 'index',
      contentItems: [fallbackItem]
    });
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf-8');
    console.log('  ✅ Generated dist/index.html (fallback)');
  } else {
    // Generate page for each item
    contentItems.forEach(item => {
      const pageSlug = item.slug === 'home' ? 'index' : item.slug;
      const fileName = `${pageSlug}.html`;
      const html = renderHtml({
        title: item.title,
        pageTitle: item.title,
        pagesNav,
        currentSlug: pageSlug,
        contentItems: [item]
      });
      fs.writeFileSync(path.join(DIST_DIR, fileName), html, 'utf-8');
      console.log(`  ✅ Generated dist/${fileName}`);

      // Ensure index.html exists if home wasn't explicitly named home
      if (pageSlug !== 'index' && !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf-8');
        console.log('  ✅ Alias: Generated dist/index.html');
      }
    });
  }

  console.log(`\n🎉 Site built successfully in ${DIST_DIR}`);
}

build();
