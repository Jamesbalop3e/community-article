---
layout: default
title: "Build Quest"
permalink: /build-quest/
---

<p>This interactive Build Quest guides you through small hands-on steps to run the site locally and complete quick tasks. Progress is saved in your browser.</p>

<div id="build-quest" class="build-quest" data-leaderboard-api="{{ site.leaderboard_api_url | default: '' }}" data-leaderboard-token="{{ site.leaderboard_api_token | default: '' }}">
  <div class="bq-celebration" role="status" aria-live="polite" aria-hidden="true">
    <div class="bq-ribbon">🎉 Congratulations! You've successfully completed this task! 🎉</div>
  </div>

  <aside class="bq-leaderboard" aria-labelledby="bq-leaderboard-title" role="region">
    <h3 id="bq-leaderboard-title">Leaderboard</h3>
    <ol class="bq-leaderboard-list" aria-live="polite"></ol>
    <div class="bq-leaderboard-empty">No entries yet.</div>
  </aside>

  <ol class="bq-steps">
    <li class="bq-step" data-step="1">
      <h3>Step 1 — Clone the repo</h3>
      <p>Run: <code>git clone https://github.com/Jamesbalop3e/community-article.git</code></p>
    </li>
    <li class="bq-step" data-step="2">
      <h3>Step 2 — Install dependencies</h3>
      <p>Install Ruby/Bundler if using Jekyll; or follow README local build instructions.</p>
    </li>
    <li class="bq-step" data-step="3">
      <h3>Step 3 — Build & Serve</h3>
      <p>Run: <code>bundle exec jekyll serve</code> or the equivalent command from README.</p>
    </li>
    <li class="bq-step" data-step="4">
      <h3>Step 4 — Explore</h3>
      <p>Open <code>http://localhost:4000/build-quest/</code> and verify this page loads.</p>
    </li>
  </ol>

  <div class="bq-controls">
    <button class="bq-btn bq-prev" aria-label="Previous step">← Previous</button>
    <div class="bq-progress" aria-hidden="true"><span class="bq-progress-fill"></span></div>
    <button class="bq-btn bq-next" aria-label="Next step">Next →</button>
  </div>
</div>

<script defer src="{{ '/assets/js/build-quest.js' | relative_url }}"></script>
