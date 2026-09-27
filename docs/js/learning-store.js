/* Versioned, device-local learning state. Legacy keys remain untouched. */
(() => {
  const config = window.VE_SITE;
  if (!config) return;
  const KEY = 've:learning:v2';
  const catalogue = config.catalogue;
  const lessons = catalogue.filter(p => p.kind === 'lesson' && p.course);
  const questionIds = new Set(catalogue.flatMap(p => p.questions.map(q => q.id)));
  const lessonIds = new Set(lessons.map(p => p.id));
  let storageAvailable = true;
  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function empty() { return { version: 2, lessons: {}, quizzes: {}, lastVisited: null, activity: [] }; }
  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function validDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(s + 'T12:00:00');
    return !isNaN(d) && dateKey(d) === s;
  }
  function object(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function validate(v) {
    if (!object(v) || v.version !== 2 || !object(v.lessons) || !object(v.quizzes) || !Array.isArray(v.activity)) throw Error('Unsupported progress file.');
    if (v.lastVisited !== null && !lessonIds.has(v.lastVisited)) throw Error('Unknown last lesson.');
    if (v.activity.length > 50000 || !v.activity.every(validDate)) throw Error('Invalid activity dates.');
    const clean = empty();
    for (const [id, entry] of Object.entries(v.lessons)) {
      if (!lessonIds.has(id) || !object(entry) || typeof entry.done !== 'boolean') throw Error('Invalid lesson progress.');
      clean.lessons[id] = {done: entry.done};
    }
    for (const [id, q] of Object.entries(v.quizzes)) {
      if (!questionIds.has(id) || !object(q) || typeof q.checked !== 'boolean' || typeof q.sel !== 'string' || !/^[a-z0-9]*(,[a-z0-9]+)*$/.test(q.sel) || q.sel.length > 200) throw Error('Invalid quiz progress.');
      clean.quizzes[id] = {sel:q.sel, checked:q.checked};
    }
    clean.lastVisited = v.lastVisited;
    clean.activity = [...new Set(v.activity)].sort();
    return clean;
  }
  let state;
  try { state = validate(read(KEY)); } catch { state = empty(); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
  }
  // Migration runs only if no v2 record exists. Index/path aliases are frozen in metadata.
  if (!read(KEY)) {
    const old = read('ve:progress') || {};
    for (const p of catalogue) {
      const paths = [...new Set(['/' + p.legacyPath, config.basePath + p.legacyPath])];
      if (lessonIds.has(p.id) && paths.some(path => old[path]?.done === true)) state.lessons[p.id] = {done:true};
      for (const q of p.questions) {
        const saved = paths.map(path => read(`mcq:${path}:${q.legacyIndex}`)).find(v => object(v) && typeof v.sel === 'string' && /^[a-z0-9]*(,[a-z0-9]+)*$/.test(v.sel) && v.sel.length <= 200);
        if (saved) state.quizzes[q.id] = {sel:saved.sel, checked:saved.checked === true};
      }
    }
    save();
  }
  function notify() { document.dispatchEvent(new CustomEvent('ve:progress-changed')); }
  function activity() {
    const today = dateKey();
    if (!state.activity.includes(today)) state.activity.push(today);
    state.activity.sort();
    save();
  }
  function streak() {
    const dates = state.activity;
    let best = 0, run = 0, prev;
    for (const day of dates) {
      const d = new Date(day + 'T12:00:00'); d.setDate(d.getDate()-1);
      run = prev === dateKey(d) ? run+1 : 1;
      best = Math.max(best,run); prev = day;
    }
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    return {days: prev === dateKey() || prev === dateKey(yesterday) ? run : 0, best};
  }
  window.VELearning = {
    catalogue, lessons, current: catalogue.find(p => p.id === config.pageId),
    url: p => new URL(p.url, new URL(config.root, location.href)).href,
    done: id => state.lessons[id]?.done === true,
    quiz: id => state.quizzes[id],
    saveQuiz(id, value) { state.quizzes[id] = value; save(); },
    mark(id, done) { if (!lessonIds.has(id)) return; const changed = state.lessons[id]?.done !== done; state.lessons[id] = {done}; if (done && changed) activity(); save(); notify(); },
    visit(id) { if (lessonIds.has(id)) { state.lastVisited = id; save(); } },
    next() { return lessons.find(p => p.id === state.lastVisited && !this.done(p.id)) || lessons.find(p => !this.done(p.id)); },
    activity, streak,
    export: () => JSON.stringify(state, null, 2),
    validate,
    replace(value) { state = validate(value); save(); notify(); },
    reset() { state = empty(); save(); notify(); },
    get storageAvailable() { return storageAvailable; }
  };
})();
