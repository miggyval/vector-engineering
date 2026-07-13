"""FastAPI backend for the interactive course demos.

Run from the repo root with:  uvicorn api.main:app --host 0.0.0.0 --port 8000

Configuration (environment variables):
  ALLOWED_ORIGINS  comma-separated CORS origins
                   (default: http://127.0.0.1:8000,http://localhost:8000)
  REPL_TIMEOUT_S   wall-clock limit for student REPL code (default: 5)
"""

import ast
import io
import multiprocessing
import os
import re
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams.update({
    "mathtext.fontset": "stix",
    "font.family": "STIXGeneral",
})

from matplotlib.backends.backend_svg import FigureCanvasSVG
from matplotlib.figure import Figure

from .sandbox import run_student_code

PLOT_WIDTH_IN = 6
PLOT_HEIGHT_IN = 3.5
PLOT_DPI = 200

REPL_TIMEOUT_S = float(os.environ.get("REPL_TIMEOUT_S", "5"))

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000"
    ).split(",")
    if origin.strip()
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ------------------------
# PYTHON REPL
# ------------------------

# spawn (not fork) so the child doesn't inherit the whole server state,
# and so behaviour matches across macOS and Linux
_mp = multiprocessing.get_context("spawn")


class CodeRequest(BaseModel):
    code: str


@app.post("/api/python-repl")
def python_repl(req: CodeRequest):
    """
    Run student code in a throwaway subprocess with a wall-clock limit.

    Process isolation means an infinite loop or crash can't take the
    server down — the child is simply terminated. See api.sandbox for
    the (deliberately small) builtins the code gets.
    """
    queue = _mp.Queue()
    proc = _mp.Process(target=run_student_code, args=(req.code, queue), daemon=True)
    proc.start()
    proc.join(REPL_TIMEOUT_S)

    if proc.is_alive():
        proc.terminate()
        proc.join()
        return {
            "stdout": "",
            "stderr": "",
            "error": f"Execution timed out after {REPL_TIMEOUT_S:g} seconds.",
        }

    try:
        return queue.get(timeout=1.0)
    except Exception:
        return {
            "stdout": "",
            "stderr": "",
            "error": f"Execution failed (process exited with code {proc.exitcode}).",
        }


# ------------------------
# CANNY EDGE DEMO
# ------------------------

DATA_DIR = Path(__file__).parent / "data"
IMG_PATH = DATA_DIR / "input.jpg"

_base_img: np.ndarray | None = None


def _get_base_img() -> np.ndarray:
    global _base_img
    if _base_img is None:
        img = cv2.imread(str(IMG_PATH), cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise HTTPException(
                status_code=503,
                detail=f"Edge-demo source image not found at {IMG_PATH}",
            )
        _base_img = img
    return _base_img


@app.get("/api/edge-demo")
def edge_demo(
    t1: int = Query(50, ge=0, le=255),
    t2: int = Query(150, ge=0, le=255),
):
    """
    Simple Canny edge detection demo.

    Query params:
      - t1: lower threshold
      - t2: upper threshold
    """
    edges = cv2.Canny(_get_base_img(), t1, t2)

    # Convert to 3-channel so browsers show it nicely
    edges_color = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    success, buf = cv2.imencode(".png", edges_color)
    if not success:
        return Response(status_code=500)

    return Response(content=buf.tobytes(), media_type="image/png")


# ------------------------
# EXPRESSION EVALUATION
# ------------------------


def _u(x):
    """Unit step: u(t) = 0 for t < 0, 1 for t >= 0."""
    return np.where(x >= 0, 1.0, 0.0)


_EXPR_FUNCS = {
    "sin": np.sin,
    "cos": np.cos,
    "tan": np.tan,
    "arcsin": np.arcsin,
    "arccos": np.arccos,
    "arctan": np.arctan,
    "sinh": np.sinh,
    "cosh": np.cosh,
    "tanh": np.tanh,
    "exp": np.exp,
    "log": np.log,
    "log10": np.log10,
    "sqrt": np.sqrt,
    "abs": np.abs,
    "u": _u,
}

_EXPR_CONSTS = {
    "pi": np.pi,
    "e": np.e,
}

_ALLOWED_NODES = (
    ast.Expression,
    ast.Constant,
    ast.Name,
    ast.Load,
    ast.Call,
    ast.BinOp,
    ast.UnaryOp,
    ast.Compare,
    ast.IfExp,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.FloorDiv,
    ast.Mod,
    ast.Pow,
    ast.UAdd,
    ast.USub,
    ast.Lt,
    ast.LtE,
    ast.Gt,
    ast.GtE,
    ast.Eq,
    ast.NotEq,
)


def _eval_expr(expr: str, t: np.ndarray) -> np.ndarray:
    """
    Evaluate a math expression of t against an AST whitelist.

    Allowed: the variable t, arithmetic/comparison operators, conditional
    expressions, numeric constants, pi, e, and the functions in
    _EXPR_FUNCS (including u(t), the unit step).

    Unlike a bare eval(), no attribute access or subscripting is possible,
    so there is no escape route via object attribute chains.

    NOTE: Use ** for powers, not ^.
    """
    tree = ast.parse(expr, mode="eval")

    for node in ast.walk(tree):
        if not isinstance(node, _ALLOWED_NODES):
            raise ValueError(f"Disallowed syntax: {type(node).__name__}")
        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name) or node.func.id not in _EXPR_FUNCS:
                raise ValueError("Only the whitelisted functions may be called")
            if node.keywords:
                raise ValueError("Keyword arguments are not allowed")
        if isinstance(node, ast.Name):
            if node.id != "t" and node.id not in _EXPR_FUNCS and node.id not in _EXPR_CONSTS:
                raise ValueError(f"Unknown name: {node.id}")
        if isinstance(node, ast.Constant) and not isinstance(node.value, (int, float)):
            raise ValueError("Only numeric constants are allowed")

    env = {**_EXPR_FUNCS, **_EXPR_CONSTS, "t": t}
    y = eval(compile(tree, "<expr>", "eval"), {"__builtins__": {}}, env)

    # Broadcast so constant expressions like "1" still plot as a line
    y = np.asarray(y, dtype=float)
    if y.shape != t.shape:
        y = np.broadcast_to(y, t.shape)
    return y


def _expr_to_math(expr: str) -> str:
    """
    Convert a Python-style expression into something that looks nicer in
    Matplotlib mathtext, without changing how it's actually evaluated.

    - t**2, (t-1)**2, sin(t)**2, t**(2*t) -> base^{...}
    - sin, cos, ...                       -> \\sin, \\cos, ...
    - pi                                  -> \\pi
    - *                                   -> space
    - underscores                         -> escaped
    """
    s = expr

    # Escape underscores (but not already-escaped ones)
    s = re.sub(r'(?<!\\)_', r'\_', s)

    # Powers: base ** exponent -> base^{exponent}
    def power_repl(m: re.Match) -> str:
        base = m.group(1).strip()
        exp_part = m.group(2).strip()
        if exp_part.startswith("(") and exp_part.endswith(")"):
            exp_part = exp_part[1:-1].strip()
        return f"{base}^{{{exp_part}}}"

    power_pattern = (
        r'('
        r'(?:[A-Za-z0-9_\\]+\([^()]*\)'   # func call: f(...)
        r'|\([^()]*\)'                    # or parenthesised group: (...)
        r'|[A-Za-z0-9_\\]+'               # or simple token: t, 2, etc.
        r')'
        r')\s*\*\*\s*'
        r'('
        r'\([^()]*\)'                     # exponent in parens: (2*t)
        r'|[A-Za-z0-9\.\+\-]+'            # or simple exponent: 2, -1, n
        r')'
    )
    s = re.sub(power_pattern, power_repl, s)

    func_names = [
        "sin", "cos", "tan", "exp",
        "arcsin", "arccos", "arctan",
        "sinh", "cosh", "tanh",
        "log", "log10", "sqrt",
    ]
    for name in func_names:
        s = re.sub(rf"\b{name}\b", rf"\\{name}", s)

    # pi -> \pi
    s = re.sub(r"\bpi\b", r"\\pi", s)

    # Remove explicit * but keep a single space
    s = re.sub(r'\s*\*\s*', ' ', s)

    # Collapse spaces
    s = re.sub(r'\s+', ' ', s).strip()

    return s


# ------------------------
# PLOTTING
# ------------------------


def _new_figure() -> Figure:
    return Figure(figsize=(PLOT_WIDTH_IN, PLOT_HEIGHT_IN), dpi=PLOT_DPI)


def _fig_response(fig: Figure) -> Response:
    """Render a figure as SVG: resolution-independent and ~10x smaller than PNG."""
    buf = io.BytesIO()
    FigureCanvasSVG(fig).print_svg(buf)
    return Response(content=buf.getvalue(), media_type="image/svg+xml")


def _apply_plot_theme(ax, theme: str):
    """Match MkDocs Material schemes: 'default' (light) and 'slate' (dark)."""
    if theme == "slate":  # dark mode
        fig_bg = "#05060c"   # your dark page bg
        ax_bg = "#05060c"
        fg = "#e5e7eb"       # your light text
        grid = "#444444"
    else:  # "default" light
        fig_bg = "#f3f4fb"   # your light page bg
        ax_bg = "#f3f4fb"
        fg = "#111827"       # your dark text
        grid = "#cccccc"

    fig = ax.figure
    fig.patch.set_facecolor(fig_bg)
    ax.set_facecolor(ax_bg)

    for spine in ax.spines.values():
        spine.set_edgecolor(fg)

    ax.tick_params(colors=fg)
    ax.xaxis.label.set_color(fg)
    ax.yaxis.label.set_color(fg)
    ax.title.set_color(fg)
    ax.grid(True, color=grid)


def _empty_plot(expr: str, t_min: float, t_max: float, theme: str) -> Figure:
    """
    Create an "empty" plot:
    - axes, labels, grid, title
    - no function curve
    """
    fig = _new_figure()
    ax = fig.add_subplot(111)

    if t_min < t_max:
        ax.set_xlim(t_min, t_max)

    expr_math = _expr_to_math(expr)
    ax.set_xlabel(r"$t$")
    ax.set_ylabel(r"$f(t)$")
    ax.set_title(r"$f(t) = " + expr_math + r"$")

    _apply_plot_theme(ax, theme)
    return fig


def _numeric_fourier(t: np.ndarray, y: np.ndarray):
    """
    Compute a numerical approximation of the continuous-time Fourier transform

        F(ω) = ∫ f(t) e^{-j ω t} dt

    using an FFT over the finite interval [t_min, t_max].

    Returns:
        omega : array of angular frequencies (rad/s), centered at 0
        F     : complex spectrum F(ω)
    """
    if t.size < 2:
        raise ValueError("Need at least 2 samples to compute Fourier transform")

    dt = t[1] - t[0]  # assume uniform sampling

    # FFT frequencies in Hz, then convert to rad/s
    freqs = np.fft.fftfreq(t.size, d=dt)     # cycles per second
    omega = 2 * np.pi * freqs                # rad/s

    # FFT with shift so ω=0 is in the middle
    F = np.fft.fft(y) * dt                   # dt factor ≈ continuous integral
    F = np.fft.fftshift(F)
    omega = np.fft.fftshift(omega)

    return omega, F


@app.get("/api/plot-func")
def plot_func(
    expr: str = Query("sin(t)", description="Function of t, e.g. 'sin(t)' or 't**2'"),
    t_min: float = Query(-10.0, description="Left end of domain"),
    t_max: float = Query(10.0, description="Right end of domain"),
    n: int = Query(400, ge=10, le=5000, description="Number of sample points"),
    theme: str = Query("default", description="Color scheme: 'default' or 'slate'"),
):
    """
    Plot a 1D function f(t) specified by 'expr' and return a PNG.
    """
    if t_min >= t_max:
        return _fig_response(_empty_plot(expr, t_min, t_max, theme))

    t = np.linspace(t_min, t_max, n)

    try:
        y = _eval_expr(expr, t)
    except Exception:
        # Invalid expression → empty plot (no curve)
        return _fig_response(_empty_plot(expr, t_min, t_max, theme))

    fig = _new_figure()
    ax = fig.add_subplot(111)

    expr_math = _expr_to_math(expr)
    ax.plot(t, y)
    ax.set_xlabel(r"$t$")
    ax.set_ylabel(r"$f(t)$")
    ax.set_title(r"$f(t) = " + expr_math + r"$")

    _apply_plot_theme(ax, theme)
    return _fig_response(fig)


@app.get("/api/plot-fourier")
def plot_fourier(
    expr: str = Query("sin(t)", description="Function of t, e.g. 'sin(t)' or 't**2'"),
    t_min: float = Query(-10.0, description="Left end of time domain"),
    t_max: float = Query(10.0, description="Right end of time domain"),
    n: int = Query(400, ge=10, le=5000, description="Number of time-domain sample points"),
    theme: str = Query("default", description="Color scheme: 'default' or 'slate'"),
):
    """
    Plot the magnitude of the Fourier transform F(ω) of f(t) = expr(t),
    approximated numerically with an FFT over [t_min, t_max].

    Uses the convention: F(ω) = ∫ f(t) e^{-j ω t} dt.
    """
    if t_min >= t_max:
        return _fig_response(_empty_plot(expr, t_min, t_max, theme))

    t = np.linspace(t_min, t_max, n)
    expr_math = _expr_to_math(expr)

    fig = _new_figure()
    ax = fig.add_subplot(111)
    ax.set_xlabel(r"$\omega$")
    ax.set_ylabel(r"$|F(\omega)|$")

    try:
        y = _eval_expr(expr, t)
        omega, F = _numeric_fourier(t, y)

        ax.plot(omega, np.abs(F))
        ax.set_title(r"$\mathcal{F}\{f(t)\},\quad f(t) = " + expr_math + r"$")
    except Exception:
        # On failure (bad expr, etc.), just show empty axes with a note
        ax.set_title(
            r"Could not evaluate $\mathcal{F}\{f(t)\}$ for $f(t) = "
            + expr_math
            + r"$"
        )

    _apply_plot_theme(ax, theme)
    return _fig_response(fig)
