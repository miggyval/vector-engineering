document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("python-repl");
  if (!container) return;

  const textarea = document.getElementById("repl-input");
  const runBtn = document.getElementById("repl-run");
  const status = document.getElementById("repl-status");
  const outEl = document.getElementById("repl-output");
  const errEl = document.getElementById("repl-errors");

  const API_BASE = "http://127.0.0.1:8001";

  async function runCode() {
    const code = textarea.value;

    status.textContent = "Running...";
    status.style.opacity = 1;
    outEl.textContent = "";
    errEl.textContent = "";

    try {
      const res = await fetch(`${API_BASE}/api/python-repl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        status.textContent = `Error: HTTP ${res.status}`;
        return;
      }

      const data = await res.json();
      outEl.textContent = data.stdout || "";
      errEl.textContent = (data.stderr || "") + (data.error || "");
      status.textContent = "Done.";
      setTimeout(() => {
        status.style.opacity = 0.5;
      }, 1000);
    } catch (e) {
      status.textContent = "Failed to reach REPL API.";
      errEl.textContent = String(e);
    }
  }

  runBtn.addEventListener("click", runCode);

  // Ctrl+Enter / Cmd+Enter to run
  textarea.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ev.preventDefault();
      runCode();
    }
  });
});
