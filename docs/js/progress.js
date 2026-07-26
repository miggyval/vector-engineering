// Per-visitor progress tracking.
//
// A page counts as complete when the reader has (a) scrolled to the end of
// the content and (b) answered every quiz on it correctly. Pages with no
// quizzes only need the scroll. A short dwell timer stops a rapid click
// through the nav from marking everything done.
//
// Everything lives in this browser's localStorage — no accounts, no server,
// nothing leaves the machine. Progress is therefore per-device.
//
// Renders: a bar in the header, ticks in the nav, a status card at the foot
// of each page, and a full breakdown into any #ve-progress-panel element.
(function () {
  const STORE_KEY = "ve:progress";
  const STREAK_KEY = "ve:streak";
  const DWELL_MS = 4000;
  const SCROLL_SLACK = 120;

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Storage blocked or full — tracking degrades, the site still works
    }
  }

  function pageKey(href) {
    return new URL(href || window.location.href, window.location.href).pathname;
  }

  // Every page in the nav, in nav order. Anchor links are the page's own
  // table of contents, which Material nests here on small screens.
  function pageLinks(root) {
    return Array.from(root.querySelectorAll("a.md-nav__link"))
      .filter((a) => !a.classList.contains("md-logo"))
      .filter((a) => {
        const href = a.getAttribute("href") || "";
        return href && !href.includes("#");
      });
  }

  function sections() {
    const list = document.querySelector(".md-nav--primary > .md-nav__list");
    if (!list) return [];

    return Array.from(list.children)
      .map((li) => {
        const own = li.querySelector(":scope > .md-nav__link");
        const links = pageLinks(li);
        return {
          title: own ? own.textContent.trim() : "",
          keys: links.map((a) => pageKey(a.getAttribute("href"))),
        };
      })
      .filter((s) => s.keys.length);
  }

  const store = read(STORE_KEY, {});
  const allKeys = sections().reduce((acc, s) => acc.concat(s.keys), []);
  const doneCount = (keys) => keys.filter((k) => store[k] && store[k].done).length;

  // ---------------------------------------------------------------- streak

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function bumpStreak() {
    const streak = read(STREAK_KEY, { last: null, days: 0, best: 0 });
    const day = today();
    if (streak.last === day) return streak;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak.days = streak.last === yesterday ? streak.days + 1 : 1;
    streak.best = Math.max(streak.best || 0, streak.days);
    streak.last = day;
    write(STREAK_KEY, streak);
    return streak;
  }

  // ------------------------------------------------------------ rendering

  function headerBar(pct) {
    const header = document.querySelector(".md-header");
    if (!header) return;

    let bar = header.querySelector(".ve-progress");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "ve-progress";
      bar.innerHTML = '<div class="ve-progress__fill"></div>';
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
      bar.setAttribute("aria-label", "Course progress");
      header.appendChild(bar);
    }
    bar.setAttribute("aria-valuenow", String(pct));
    bar.title = `Course progress: ${doneCount(allKeys)} of ${allKeys.length} pages`;
    bar.querySelector(".ve-progress__fill").style.width = pct + "%";
  }

  function navTicks() {
    pageLinks(document).forEach((a) => {
      const entry = store[pageKey(a.getAttribute("href"))];
      a.classList.toggle("ve-done", !!(entry && entry.done));
    });
  }

  function statusCard(state) {
    const inner = document.querySelector(".md-content__inner");
    if (!inner) return;

    let card = inner.querySelector(".ve-status");
    if (!card) {
      card = document.createElement("div");
      card.className = "ve-status";
      inner.appendChild(card);
    }

    if (state.done) {
      card.className = "ve-status ve-status--done";
      card.textContent = "Page complete";
      return;
    }

    const todo = [];
    if (!state.scrolled) todo.push("read to the end of the page");
    if (!state.quiz) todo.push("answer every question correctly");
    card.className = "ve-status";
    card.textContent = "To complete this page: " + todo.join(", ") + ".";
  }

  function ring(pct) {
    const r = 20;
    const c = 2 * Math.PI * r;
    return (
      '<svg class="ve-ring" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle class="ve-ring__track" cx="24" cy="24" r="' + r + '"/>' +
      '<circle class="ve-ring__fill" cx="24" cy="24" r="' + r +
      '" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - pct / 100) + '"/>' +
      "</svg>"
    );
  }

  // Modules are the second nav level: sections hold modules, modules hold
  // pages (sometimes via a chapter level, which pageLinks flattens)
  function moduleItems() {
    return Array.from(
      document.querySelectorAll(
        '.md-nav--primary nav[data-md-level="1"] > .md-nav__list > .md-nav__item'
      )
    );
  }

  function modulePanel() {
    const host = document.getElementById("ve-module-progress");
    if (!host) return;

    const key = pageKey();
    const li = moduleItems().find((item) =>
      pageLinks(item).some((a) => pageKey(a.getAttribute("href")) === key)
    );
    if (!li) {
      host.hidden = true;
      return;
    }

    const own = li.querySelector(":scope > .md-nav__link");
    const title = own ? own.textContent.trim() : "This module";
    const links = pageLinks(li);
    const done = links.filter((a) => {
      const entry = store[pageKey(a.getAttribute("href"))];
      return entry && entry.done;
    }).length;
    const pct = Math.round((done / links.length) * 100);

    const items = links
      .map((a) => {
        const href = pageKey(a.getAttribute("href"));
        const entry = store[href];
        const cls =
          (entry && entry.done ? "ve-module__item--done" : "") +
          (href === key ? " ve-module__item--current" : "");
        return (
          '<li class="' + cls.trim() + '"><a href="' + a.href + '">' +
          a.textContent.trim() + "</a></li>"
        );
      })
      .join("");

    // A long module would otherwise push the page's own content off-screen
    const open = links.length <= 6 ? " open" : "";

    host.className = "ve-module";
    host.innerHTML =
      '<div class="ve-module__head">' + ring(pct) +
      '<div class="ve-module__meta"><strong>' + title + "</strong>" +
      "<span>" + done + " of " + links.length + " pages complete</span></div></div>" +
      "<details class=\"ve-module__details\"" + open + ">" +
      "<summary>Pages in this module</summary>" +
      '<ol class="ve-module__list">' + items + "</ol></details>";
  }

  function panel() {
    const host = document.getElementById("ve-progress-panel");
    if (!host) return;

    const streak = read(STREAK_KEY, { days: 0, best: 0 });
    const total = allKeys.length;
    const done = doneCount(allKeys);
    const pct = total ? Math.round((done / total) * 100) : 0;

    const rows = sections()
      .map((s) => {
        const sDone = doneCount(s.keys);
        const sPct = Math.round((sDone / s.keys.length) * 100);
        return (
          '<div class="ve-panel__row">' +
          ring(sPct) +
          '<div class="ve-panel__meta"><strong>' + s.title + "</strong>" +
          "<span>" + sDone + " of " + s.keys.length + " pages</span></div>" +
          "</div>"
        );
      })
      .join("");

    host.className = "ve-panel";
    host.innerHTML =
      '<div class="ve-panel__head"><strong>Your progress</strong>' +
      "<span>" + done + " of " + total + " pages &middot; " + pct + "%</span></div>" +
      '<div class="ve-panel__bar"><div style="width:' + pct + '%"></div></div>' +
      '<div class="ve-panel__rows">' + rows + "</div>" +
      '<div class="ve-panel__foot"><span>Current streak: ' + (streak.days || 0) +
      " day" + (streak.days === 1 ? "" : "s") +
      " &middot; best: " + (streak.best || 0) + "</span>" +
      '<button type="button" class="ve-panel__reset">Reset progress</button></div>';

    host.querySelector(".ve-panel__reset").addEventListener("click", () => {
      if (!window.confirm("Clear all saved progress on this device?")) return;
      Object.keys(localStorage)
        .filter((k) => k.startsWith("ve:") || k.startsWith("mcq:"))
        .forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    });
  }

  // --------------------------------------------------------------- engine

  const key = pageKey();
  const state = Object.assign({ done: false, scrolled: false, quiz: false }, store[key]);
  const openedAt = Date.now();

  function quizzesPassed() {
    const quizzes = Array.from(document.querySelectorAll(".mcq"));
    if (!quizzes.length) return true;
    return quizzes.every((q) => q.dataset.correct === "true");
  }

  function atBottom() {
    const doc = document.documentElement;
    const full = Math.max(doc.scrollHeight, document.body.scrollHeight);
    // A page shorter than the viewport counts as read once the dwell passes
    if (full <= window.innerHeight + SCROLL_SLACK) return true;
    return window.scrollY + window.innerHeight >= full - SCROLL_SLACK;
  }

  function refresh() {
    const wasDone = state.done;

    if (Date.now() - openedAt >= DWELL_MS && atBottom()) state.scrolled = true;
    state.quiz = quizzesPassed();
    state.done = state.scrolled && state.quiz;

    if (state.done && !wasDone) state.at = Date.now();
    store[key] = state;
    write(STORE_KEY, store);

    const pct = allKeys.length
      ? Math.round((doneCount(allKeys) / allKeys.length) * 100)
      : 0;

    headerBar(pct);
    statusCard(state);
    if (state.done !== wasDone) {
      navTicks();
      panel();
      modulePanel();
    }
  }

  // quizzes.js restores saved answers on DOMContentLoaded and registers its
  // listener before this file, so starting here means data-correct is set
  function start() {
    bumpStreak();
    navTicks();
    panel();
    modulePanel();
    refresh();

    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    document.addEventListener("ve:quiz-graded", refresh);
    setTimeout(refresh, DWELL_MS + 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
