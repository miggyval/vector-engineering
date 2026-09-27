# Authoring components

Lesson prose, question wording, answer keys, and explanations belong to the author.
Keep full-page navigation enabled: interactive components initialise on page load.

Use Markdown headings, fenced code, and `$...$` / `$$...$$` math normally.

```markdown
!!! example "Worked example"
    Your worked example goes here.

??? note "Solution"
    Your solution goes here.
```

```html
<div class="lesson-video">
  <iframe src="YOUR_VIDEO_EMBED_URL" title="YOUR_VIDEO_TITLE" loading="lazy" allowfullscreen></iframe>
</div>

<div class="mcq" data-question-id="unique-permanent-question-id" data-answer="b" data-explanation="YOUR_EXPLANATION">
  <p>YOUR_QUESTION</p>
  <ul>
    <li data-option="a">YOUR_OPTION</li>
    <li data-option="b">YOUR_OPTION</li>
  </ul>
  <button type="button" class="mcq-check">Check answer</button>
  <p class="mcq-feedback"></p>
</div>
```

Comma-separated answers enable checkboxes. Existing quizzes reserve option `f`
for the mutually exclusive "none of the above" choice. Preserve that convention.
Quiz HTML is upgraded to native labelled controls by the shared script.

Use the existing Practice pages as the canonical markup examples for the Python
shell, time/frequency plotter, and edge demo. Their scripts and styles are shared;
do not copy embedded JavaScript into new lessons. One instance of each demo is
supported per page. Use relative links for assets so GitHub Pages subpaths work.

Required publication assets live in `docs/media/`; generated intermediates stay
outside that directory. Never substitute invented diagrams for missing assets.
