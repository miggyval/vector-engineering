// Python practice shell, powered by Pyodide (CPython compiled to WebAssembly).
// Code runs entirely in the student's browser inside a web worker: no backend,
// and a runaway loop is contained by terminating the worker. The worker stays
// warm between runs so only the first run pays the runtime download.
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("python-repl");
  if (!container) return;

  const textarea = document.getElementById("repl-input");
  const runBtn = document.getElementById("repl-run");
  const status = document.getElementById("repl-status");
  const outEl = document.getElementById("repl-output");
  const errEl = document.getElementById("repl-errors");

  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
  const RUN_TIMEOUT_MS = 20_000;
  const LOAD_TIMEOUT_MS = 60_000;
  const stopBtn = document.createElement("button"); stopBtn.type = "button"; stopBtn.textContent = "Stop"; stopBtn.disabled = true;
  const resetBtn = document.createElement("button"); resetBtn.type = "button"; resetBtn.textContent = "Reset Python";
  runBtn.after(stopBtn, resetBtn);

  // Built as a Blob so the worker needs no extra file and works under any
  // site base path
  const WORKER_SOURCE = `
    importScripts("${PYODIDE_URL}");

    const pyodideReady = loadPyodide().then((py) => {
      self.postMessage({ type: "ready" });
      return py;
    }).catch(() => {
      self.postMessage({ type: "load-error" });
      return null;
    });

    self.onmessage = async (event) => {
      const { id, code } = event.data;
      const py = await pyodideReady;
      if (!py) return;

      let stdout = "";
      let stderr = "";
      py.setStdout({ batched: (line) => { stdout = (stdout + line + "\\n").slice(0, 20000); } });
      py.setStderr({ batched: (line) => { stderr = (stderr + line + "\\n").slice(0, 20000); } });

      try {
        await py.loadPackagesFromImports(code);
        await py.runPythonAsync(code);
        self.postMessage({ type: "result", id, stdout, stderr, error: null });
      } catch (err) {
        self.postMessage({
          type: "result", id, stdout, stderr,
          error: String((err && err.message) || err).slice(0, 20000),
        });
      }
    };
  `;

  let worker = null;
  let workerUrl = null;
  let workerReady = false;
  let runId = 0;
  let timeoutId = null;

  function setStatus(text, dim = false) {
    status.textContent = text;
    status.style.opacity = dim ? 0.5 : 1;
  }

  function setRunning(running) {
    runBtn.disabled = running;
    stopBtn.disabled = !running;
  }

  function destroyWorker() {
    if (worker) worker.terminate();
    worker = null;
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    workerUrl = null;
    workerReady = false;
  }

  function finishRun(data) {
    clearTimeout(timeoutId);
    outEl.textContent = data.stdout || "";
    errEl.textContent = ((data.stderr || "") + (data.error || "")).slice(0, 20000);
    setRunning(false);
    setStatus(data.error ? "Execution failed." : "Done. Output is limited to 20,000 characters per pane.");
  }

  function armTimeout(id, duration = RUN_TIMEOUT_MS) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (id !== runId) return;
      destroyWorker(); // runtime reloads on the next run
      errEl.textContent = duration === LOAD_TIMEOUT_MS ? "Python runtime loading timed out. Check your connection and retry." : `Execution timed out after ${duration / 1000} seconds.`;
      setRunning(false);
      setStatus("Timed out.");
    }, duration);
  }

  function ensureWorker() {
    if (worker) return worker;

    const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
    workerUrl = URL.createObjectURL(blob);
    worker = new Worker(workerUrl);

    worker.onmessage = (event) => {
      const data = event.data;
      if (data.type === "load-error") {
        clearTimeout(timeoutId); destroyWorker(); setRunning(false);
        errEl.textContent = "Failed to load Python. Check your connection and retry.";
        setStatus("Error."); return;
      }
      if (data.type === "ready") {
        workerReady = true;
        // The pending run is already queued in the worker; start its clock
        // now so runtime download time doesn't count against it
        if (runBtn.disabled) {
          setStatus("Running...");
          armTimeout(runId);
        }
        return;
      }
      if (data.type === "result" && data.id === runId) {
        finishRun(data);
      }
    };

    worker.onerror = () => {
      clearTimeout(timeoutId);
      destroyWorker();
      errEl.textContent =
        "Failed to load the Python runtime. Check your network connection and try again.";
      setRunning(false);
      setStatus("Error.");
    };

    return worker;
  }

  function runCode() {
    if (runBtn.disabled) return;

    const id = ++runId;
    setRunning(true);
    outEl.textContent = "";
    errEl.textContent = "";

    const w = ensureWorker();
    if (workerReady) {
      setStatus("Running...");
      armTimeout(id);
    } else {
      setStatus("Loading Python runtime (~10 MB, first run only)...");
      armTimeout(id, LOAD_TIMEOUT_MS);
    }
    w.postMessage({ id, code: textarea.value });
  }

  function stop(message) {
    ++runId; clearTimeout(timeoutId); destroyWorker(); setRunning(false); setStatus(message);
  }
  stopBtn.addEventListener("click", () => stop("Stopped. Python will reload on the next run."));
  resetBtn.addEventListener("click", () => { stop("Python reset."); outEl.textContent = ""; errEl.textContent = ""; });
  window.addEventListener("pagehide", () => { clearTimeout(timeoutId); destroyWorker(); });
  runBtn.addEventListener("click", runCode);

  // Ctrl+Enter / Cmd+Enter to run
  textarea.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ev.preventDefault();
      runCode();
    }
  });
});
