"""Isolated runner for student REPL code.

This module is imported by a spawned child process, so it must stay free of
heavy imports (FastAPI, cv2, matplotlib) — keep it self-contained.

WARNING: a restricted-builtins exec is not a hardened sandbox. Process
isolation + the timeout in api.main contain runaway/hostile code, but this
should still only be exposed in trusted environments (local, lab network).
"""

import contextlib
import io
import traceback

MAX_OUTPUT_CHARS = 20_000

ALLOWED_BUILTINS = {
    "abs": abs,
    "bool": bool,
    "dict": dict,
    "enumerate": enumerate,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "print": print,
    "range": range,
    "reversed": reversed,
    "round": round,
    "set": set,
    "sorted": sorted,
    "str": str,
    "sum": sum,
    "tuple": tuple,
    "zip": zip,
}


def _truncate(text: str) -> str:
    if len(text) > MAX_OUTPUT_CHARS:
        return text[:MAX_OUTPUT_CHARS] + "\n... [output truncated]"
    return text


def run_student_code(code: str, queue) -> None:
    """Execute student code and put a {stdout, stderr, error} dict on the queue."""
    stdout = io.StringIO()
    stderr = io.StringIO()
    error = None

    try:
        compiled = compile(code, "<student>", "exec")
        # Single namespace for globals and locals, like a real module — with
        # separate dicts, a student-defined function can't call itself or
        # other student-defined functions.
        env = {"__builtins__": ALLOWED_BUILTINS}
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(compiled, env)
    except BaseException:
        error = traceback.format_exc()

    queue.put({
        "stdout": _truncate(stdout.getvalue()),
        "stderr": _truncate(stderr.getvalue()),
        "error": error,
    })
