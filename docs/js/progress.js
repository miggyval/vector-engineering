/* Progress views use the build catalogue and explicit completion only. */
document.addEventListener('DOMContentLoaded', () => {
  const learning = window.VELearning;
  if (!learning) return;
  const current = learning.current;
  const isLesson = learning.lessons.some(p => p.id === current?.id);
  if (isLesson) learning.visit(current.id);
  const create = (tag, text, cls) => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (cls) el.className = cls;
    return el;
  };
  const button = (text, action) => {
    const b = create('button',text); b.type = 'button'; b.addEventListener('click',action); return b;
  };
  const quizzesPassed = () => [...document.querySelectorAll('.mcq')].every(q => q.dataset.correct === 'true');
  const card = isLesson ? create('div', '', 've-status') : null;
  const label = create('span');
  const complete = button('', () => learning.mark(current.id, !learning.done(current.id)));
  if (card) { card.append(label,complete); document.querySelector('.md-content__inner').append(card); }
  const header = create('div', '', 've-progress');
  const fill = create('div', '', 've-progress__fill'); header.append(fill);
  header.setAttribute('role','progressbar'); header.setAttribute('aria-label','Course progress');
  header.setAttribute('aria-valuemin','0'); header.setAttribute('aria-valuemax','100');
  document.querySelector('.md-header')?.append(header);
  const panel = document.getElementById('ve-progress-panel');
  const summary = create('div'); const rows = create('div'); const streak = create('p');
  const storageStatus = create('p'); storageStatus.setAttribute('role','status');
  if (panel) {
    panel.className = 've-panel';
    const actions = create('div','','ve-progress-actions');
    const file = create('input'); file.type = 'file'; file.accept = '.json,application/json'; file.hidden = true;
    file.addEventListener('change', async () => {
      try {
        if (!file.files[0]) return;
        if (file.files[0].size > 2000000) throw Error('Progress file is too large.');
        const value = learning.validate(JSON.parse(await file.files[0].text()));
        if (confirm('Replace progress on this device with the imported file?')) { learning.replace(value); location.reload(); }
      } catch (e) { storageStatus.textContent = 'Could not import progress: ' + e.message; }
      finally { file.value = ''; }
    });
    actions.append(button('Export progress', () => {
      const url = URL.createObjectURL(new Blob([learning.export()],{type:'application/json'}));
      const a = create('a'); a.href = url; a.download = 'vector-engineering-progress.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url),1000);
    }), button('Import progress', () => file.click()), button('Reset progress', () => {
      if (confirm('Clear all saved progress on this device?')) { learning.reset(); location.reload(); }
    }), file);
    panel.replaceChildren(create('h2','Your progress'),summary,rows,streak,actions,storageStatus);
  }
  function render() {
    const done = learning.lessons.filter(p => learning.done(p.id)).length;
    const total = learning.lessons.length; const pct = total ? Math.round(done/total*100) : 0;
    fill.style.width = pct + '%'; header.setAttribute('aria-valuenow',String(pct));
    header.title = `${done} of ${total} lessons complete`;
    if (card) {
      const finished = learning.done(current.id);
      label.textContent = finished ? 'Lesson complete' : quizzesPassed() ? 'Ready to mark this lesson complete?' : 'Answer every question correctly to complete this lesson.';
      complete.textContent = finished ? 'Mark incomplete' : 'Mark complete';
      complete.disabled = !finished && !quizzesPassed();
    }
    document.querySelectorAll('a.md-nav__link').forEach(a => {
      const p = learning.lessons.find(p => learning.url(p) === a.href);
      a.classList.toggle('ve-done', !!p && learning.done(p.id));
    });
    document.querySelectorAll('[data-course-progress]').forEach(el => {
      const pages = learning.lessons.filter(p => p.course === el.dataset.courseProgress);
      el.textContent = pages.length ? `${pages.filter(p => learning.done(p.id)).length} of ${pages.length} lessons complete` : 'Module overviews available';
    });
    const resume = document.getElementById('ve-continue');
    if (resume) {
      const next = learning.next(); resume.replaceChildren(create('h2','Continue learning'));
      if (next) { const a = create('a',next.title,'ve-button'); a.href = learning.url(next); resume.append(a); }
      else resume.append(create('p','All available lessons are complete.'));
    }
    if (panel) {
      summary.textContent = `${done} of ${total} lessons complete · ${pct}%`;
      rows.replaceChildren();
      for (const course of ['Signals and Systems','Control','Robotics']) {
        const pages = learning.lessons.filter(p => p.course === course);
        rows.append(create('p',pages.length ? `${course}: ${pages.filter(p => learning.done(p.id)).length} of ${pages.length} lessons complete` : `${course}: module overviews available`));
      }
      const st = learning.streak(); streak.textContent = `Current streak: ${st.days} days · Best: ${st.best} days`;
      storageStatus.textContent = learning.storageAvailable ? 'Progress is saved on this device only.' : 'Browser storage is unavailable. Progress will last only for this page; you can export it.';
    }
    const module = document.getElementById('ve-module-progress');
    if (module && current) {
      const pages = learning.lessons.filter(p => p.course === current.course && p.module === current.module);
      module.replaceChildren();
      if (pages.length) {
        module.className = 've-module';
        module.append(create('p',`${pages.filter(p => learning.done(p.id)).length} of ${pages.length} lessons complete`));
        const details = create('details'); details.append(create('summary','Lessons in this module'));
        const list = create('ol');
        pages.forEach(p => { const li = create('li'); const a = create('a',p.title + (learning.done(p.id) ? ' ✓' : '')); a.href = learning.url(p); li.append(a); list.append(li); });
        details.append(list); module.append(details);
      }
    }
  }
  document.addEventListener('ve:quiz-graded', () => {
    if (isLesson && learning.done(current.id) && !quizzesPassed()) learning.mark(current.id,false);
    render();
  });
  document.addEventListener('ve:progress-changed',render);
  // Restoration has already graded saved answers; invalidate only actual quiz pages.
  if (isLesson && learning.done(current.id) && !quizzesPassed()) learning.mark(current.id,false);
  render();
});
