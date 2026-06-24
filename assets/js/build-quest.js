(function () {
  'use strict';

  const STORAGE_KEY = 'mmaug.buildQuest.progress';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function BuildQuest(root) {
    this.root = root;
    this.steps = $all('.bq-step', root);
    this.current = 0;
    this.prevBtn = $('.bq-prev', root);
    this.nextBtn = $('.bq-next', root);
    this.progressFill = $('.bq-progress-fill', root);
    this.celebration = $('.bq-celebration', root);

      // Leaderboard elements
      this.leaderboardList = $('.bq-leaderboard-list', root);
      this.leaderboardEmpty = $('.bq-leaderboard-empty', root);

      // Timing & identity
      this.startTime = Date.now();
      this.name = null;
      try { this.name = localStorage.getItem('mmaug.buildQuest.name') || null; } catch (e) { this.name = null; }

      // Read leaderboard API config from data attributes (liquid-injected)
      this.apiUrl = (root && root.dataset && root.dataset.leaderboardApi) ? root.dataset.leaderboardApi : null;
      this.apiToken = (root && root.dataset && root.dataset.leaderboardToken) ? root.dataset.leaderboardToken : null;

      // Prompt for name on first load if not present
      if (!this.name) {
        try {
          const n = window.prompt('Enter a display name for the Build Quest leaderboard (optional):', '');
          if (n && n.trim()) {
            this.name = n.trim();
            try { localStorage.setItem('mmaug.buildQuest.name', this.name); } catch (e) { }
          }
        } catch (e) { /* ignore prompt errors */ }
      }

      // Don't record multiple completions in the same session
      this.sessionCompleted = sessionStorage.getItem('mmaug.buildQuest.completed') === '1';

      this.load();
      this.bind();
      this.render();
      // render local leaderboard first
      this.renderLeaderboard();
      // then fetch remote leaderboard if configured (merge/display remote)
      if (this.apiUrl) {
        this.fetchRemoteLeaderboard().then(remote => {
          if (Array.isArray(remote) && remote.length) {
            try {
              // override displayed leaderboard with remote entries
              this.saveLeaderboard(remote.slice(0,5));
              this.renderLeaderboard();
            } catch (e) { console.warn('BuildQuest: failed to apply remote leaderboard', e); }
          }
        }).catch((err) => { console.warn('BuildQuest: fetchRemoteLeaderboard error', err); });
      }
    }

  BuildQuest.prototype.bind = function () {
    // Use event delegation on the root element to avoid missing handlers
    if (this.root && this.root.addEventListener) {
      const delegateHandler = (e) => {
          const target = e.target || e.srcElement;
          const closest = (target && target.closest) ? target.closest('.bq-next, .bq-prev') : null;
          if (!closest) return;
          e.preventDefault();
          if (closest.classList.contains('bq-next')) {
          console.debug('BuildQuest: next clicked');
          this.go(this.current + 1);
          } else if (closest.classList.contains('bq-prev')) {
          console.debug('BuildQuest: prev clicked');
          this.go(this.current - 1);
        }
        };

        this.root.addEventListener('click', delegateHandler);
        // also listen for pointer/touch events for better responsiveness on mobile
        if (window.PointerEvent) this.root.addEventListener('pointerdown', delegateHandler);
        else this.root.addEventListener('touchstart', delegateHandler, { passive: true });
    } else {
      // fallback to direct binding
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.go(this.current + 1));
      } else {
        console.warn('BuildQuest: next button not found');
      }

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.go(this.current - 1));
      } else {
        console.warn('BuildQuest: prev button not found');
      }
    }

    // Keyboard navigation is global; keep it but guard calls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.go(this.current + 1);
      if (e.key === 'ArrowLeft') this.go(this.current - 1);
    });
  };

  BuildQuest.prototype.save = function () {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.current));
    } catch (e) {
      // ignore
    }
  };

  BuildQuest.prototype.load = function () {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== null) this.current = Math.max(0, Math.min(this.steps.length -1, Number(v)));
    } catch (e) {
      this.current = 0;
    }
  };

  BuildQuest.prototype.go = function (index) {
    const next = Math.max(0, Math.min(this.steps.length - 1, index));
    if (next === this.current) return;
    this.current = next;
    this.save();
    this.render();

      // If user reached the last step, record completion once per session
      if (this.current === this.steps.length - 1 && !this.sessionCompleted) {
        try {
          const elapsed = Date.now() - this.startTime;
          this.recordCompletion(elapsed);
          sessionStorage.setItem('mmaug.buildQuest.completed', '1');
          this.sessionCompleted = true;
        } catch (e) {
          console.warn('BuildQuest: failed to record completion', e);
        }
      }
    };

  BuildQuest.prototype.render = function () {
    this.steps.forEach((el, i) => {
      el.style.display = (i === this.current) ? 'block' : 'none';
    });

    const isLastStep = this.current === this.steps.length - 1;
    if (this.prevBtn) this.prevBtn.disabled = (this.current === 0);
    if (this.nextBtn) this.nextBtn.disabled = isLastStep; // Only disable Next on last step

    // Show celebration ribbon on last step, hide otherwise
    if (this.celebration) {
      this.celebration.style.display = isLastStep ? 'block' : 'none';
      this.celebration.setAttribute('aria-hidden', isLastStep ? 'false' : 'true');
    }

    const pct = Math.round(((this.current + 1) / this.steps.length) * 100);
    if (this.progressFill) {
      this.progressFill.style.width = pct + '%';
      this.progressFill.setAttribute('aria-valuenow', String(pct));
    }
  };

  BuildQuest.prototype.recordCompletion = function (elapsedMs) {
    try {
      const name = this.name || 'Anonymous';
      this.addLeaderboardEntry(name, elapsedMs);
      this.renderLeaderboard();
        // POST to remote API if configured
        if (this.apiUrl) {
          this.postRemoteEntry({ name, timeMs: Number(elapsedMs), ts: Date.now() }).catch((err) => {
            console.warn('BuildQuest: failed to post remote entry', err);
          });
        }
      } catch (e) {
        console.warn('BuildQuest: recordCompletion failed', e);
      }
    };

  BuildQuest.prototype.loadLeaderboard = function () {
    try {
      const raw = localStorage.getItem('mmaug.buildQuest.leaderboard');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      return [];
    }
  };

  BuildQuest.prototype.saveLeaderboard = function (list) {
    try {
      localStorage.setItem('mmaug.buildQuest.leaderboard', JSON.stringify(list));
    } catch (e) {
      console.warn('BuildQuest: failed to save leaderboard', e);
    }
  };

  // Remote API helpers (Google Sheets Apps Script endpoint)
  BuildQuest.prototype.fetchRemoteLeaderboard = function () {
    if (!this.apiUrl) return Promise.resolve([]);
    // expect the endpoint to return JSON array of {name,timeMs,ts}
    const url = this.apiUrl;
    return fetch(url, { method: 'GET', cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error('Network response not ok');
      return r.json();
    }).then((json) => {
      if (!Array.isArray(json)) return [];
      return json.map((e) => ({ name: String(e.name || 'Anonymous'), timeMs: Number(e.timeMs || 0), ts: Number(e.ts || Date.now()) }));
    });
  };

  BuildQuest.prototype.postRemoteEntry = function (entry) {
    if (!this.apiUrl) return Promise.reject(new Error('No apiUrl'));
    const body = Object.assign({}, entry);
    // include token if provided
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiToken) headers['X-Leaderboard-Token'] = this.apiToken;
    return fetch(this.apiUrl, { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Network response not ok');
        // try to parse JSON response (optional)
        return r.json ? r.json().catch(() => ({})) : Promise.resolve({});
      });
  };

  BuildQuest.prototype.addLeaderboardEntry = function (name, timeMs) {
    const list = this.loadLeaderboard();
    list.push({ name: String(name || 'Anonymous'), timeMs: Number(timeMs || 0), ts: Date.now() });
    list.sort((a, b) => a.timeMs - b.timeMs);
    const top = list.slice(0, 5); // keep top 5
    this.saveLeaderboard(top);
  };

  BuildQuest.prototype.renderLeaderboard = function () {
    if (!this.leaderboardList || !this.leaderboardEmpty) return;
    const list = this.loadLeaderboard();
    if (!list.length) {
      this.leaderboardList.setAttribute('aria-hidden', 'true');
      this.leaderboardEmpty.style.display = 'block';
      this.leaderboardList.innerHTML = '';
      return;
    }
    this.leaderboardEmpty.style.display = 'none';
    this.leaderboardList.setAttribute('aria-hidden', 'false');
    this.leaderboardList.innerHTML = list.map((entry) => {
      const s = (entry.timeMs / 1000).toFixed(2) + 's';
      return `<li><strong>${escapeHtml(entry.name)}</strong> — ${s}</li>`;
    }).join('');
  };

  function escapeHtml(s) { return String(s).replace(/[&<>\"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]; }); }

  function initBuildQuest() {
    const root = document.getElementById('build-quest');
    if (!root) return;
    // graceful: avoid blocking if localStorage is restricted
    try { new BuildQuest(root); } catch (e) { console.error('Build Quest init failed', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuildQuest);
  } else {
    // DOM already ready
    initBuildQuest();
  }

})();
