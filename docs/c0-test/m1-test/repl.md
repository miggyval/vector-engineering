---
ve_id: page-20be1b98e2fc5fac
ve_kind: practice
ve_legacy_path: c0-test/m1-test/repl/
---

# Python Practice Shell

Use this mini Python shell to experiment with small code snippets.

- Full Python 3 is available, including `import` — try `import numpy as np`.
- Your code runs entirely in your own browser (via [Pyodide](https://pyodide.org)); nothing is sent to a server.
- The first run downloads the Python runtime (~10 MB), so it takes a moment. After that, runs are instant.

```python
# Try this:
for i in range(5):
    print(i**2)
```

---

<div id="python-repl" class="python-repl">
  <div class="repl-input-area">
    <label for="repl-input">Python code</label>
    <textarea id="repl-input" spellcheck="false">for i in range(5):
    print(i**2)</textarea>
  </div>

  <div class="repl-controls">
    <button id="repl-run">Run</button>
    <span id="repl-status" role="status"></span>
  </div>

  <div class="repl-output-area">
    <div>
      <h3>Output</h3>
      <pre id="repl-output"></pre>
    </div>

    <div>
      <h3>Errors</h3>
      <pre id="repl-errors"></pre>
    </div>
  </div>
</div>
