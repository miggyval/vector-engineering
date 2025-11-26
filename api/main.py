from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import cv2
import numpy as np
from pathlib import Path

from pydantic import BaseModel
import io
import contextlib
import traceback

import matplotlib

matplotlib.use("Agg")
matplotlib.rcParams.update({
    "mathtext.fontset": "stix",
    "font.family": "STIXGeneral",
})

from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import re

PLOT_WIDTH_IN = 6      # inches
PLOT_HEIGHT_IN = 3.5   # inches
PLOT_DPI = 200         # increase for higher resolution


def _new_figure() -> Figure:
    """
    Create a new high-DPI Matplotlib figure for plots.
    """
    return Figure(figsize=(PLOT_WIDTH_IN, PLOT_HEIGHT_IN), dpi=PLOT_DPI)



app = FastAPI()



class CodeRequest(BaseModel):
    code: str
    
    


@app.post("/api/python-repl")
def python_repl(req: CodeRequest):
    """
    Very simple Python REPL endpoint for student code.

    WARNING: This is not a fully secure sandbox. Only expose it in
    trusted environments (e.g. local, lab network).
    """
    # Restrict builtins: only allow a small safe subset
    allowed_builtins = {
        "abs": abs,
        "min": min,
        "max": max,
        "range": range,
        "len": len,
        "sum": sum,
        "print": print,
    }

    # Global and local namespaces
    global_env = {
        "__builtins__": allowed_builtins,
    }
    local_env = {}

    stdout = io.StringIO()
    stderr = io.StringIO()

    try:
        # Compile the code first to catch syntax errors
        compiled = compile(req.code, "<student>", "exec")

        # Capture stdout/stderr while running the code
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(compiled, global_env, local_env)

        return {
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "error": None,
        }

    except Exception:
        # Return the full traceback as error
        error_text = traceback.format_exc()
        return {
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "error": error_text,
        }


# Allow MkDocs dev server (localhost:8000) to talk to this API (localhost:8001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------
# CANNY EDGE DEMO
# ------------------------

# Load a base image once at startup
DATA_DIR = Path(__file__).parent / "data"
IMG_PATH = DATA_DIR / "input.jpg"

if not IMG_PATH.exists():
    raise RuntimeError(f"Input image not found at {IMG_PATH}")

# Read as grayscale for Canny
BASE_IMG = cv2.imread(str(IMG_PATH), cv2.IMREAD_GRAYSCALE)
if BASE_IMG is None:
    raise RuntimeError(f"Failed to load image: {IMG_PATH}")


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
    # Run Canny on the base image
    edges = cv2.Canny(BASE_IMG, t1, t2)

    # Convert to 3-channel so browsers show it nicely
    edges_color = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    # Encode as PNG in memory
    success, buf = cv2.imencode(".png", edges_color)
    if not success:
        return Response(status_code=500)

    return Response(content=buf.tobytes(), media_type="image/png")

# ------------------------
# GRAPH PLOTTING DEMO
# ------------------------

import re

# High-res figure settings (same visual size, more pixels)
PLOT_WIDTH_IN = 6
PLOT_HEIGHT_IN = 3.5
PLOT_DPI = 200

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



def _new_figure() -> Figure:
    return Figure(figsize=(PLOT_WIDTH_IN, PLOT_HEIGHT_IN), dpi=PLOT_DPI)


def _fig_to_png_bytes(fig: Figure) -> bytes:
    """
    Render a Matplotlib Figure to PNG bytes using the Agg canvas.
    """
    buf = io.BytesIO()
    canvas = FigureCanvas(fig)
    canvas.print_png(buf)
    buf.seek(0)
    return buf.getvalue()


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


def _apply_plot_theme(ax, theme: str):
    """Match MkDocs Material schemes: 'default' (light) and 'slate' (dark)."""
    if theme == "slate":  # dark mode
        fig_bg = "#05030a"   # your dark page bg
        ax_bg = "#05030a"
        fg = "#e5e7eb"       # your light text
        grid = "#444444"
    else:  # "default" light
        fig_bg = "#f7f3ff"   # your light page bg
        ax_bg = "#f7f3ff"
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


def _eval_expr(expr: str, t: np.ndarray) -> np.ndarray:
    """
    Safely evaluate a math expression of t using NumPy.

    Allowed:
      - variable: t
      - functions: sin, cos, tan, exp, log, sqrt, abs, arctan, etc.
      - custom: u(t) = unit step (1 for t >= 0, 0 for t < 0)
      - constants: pi, e

    NOTE: Use ** for powers, not ^.
    """

    # Custom unit step: u(t) = 0 for t < 0, 1 for t >= 0
    def u(x):
        return np.where(x >= 0, 1.0, 0.0)

    allowed_funcs = {
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
        "u": u,
    }
    allowed_consts = {
        "pi": np.pi,
        "e": np.e,
    }

    env = {}
    env.update(allowed_funcs)
    env.update(allowed_consts)
    env["t"] = t

    # No builtins, just our env
    return eval(expr, {"__builtins__": {}}, env)


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

    # If range is invalid, just make an empty plot with axes
    if t_min >= t_max:
        fig = _empty_plot(expr, t_min, t_max, theme)
        png = _fig_to_png_bytes(fig)
        return Response(content=png, media_type="image/png")

    t = np.linspace(t_min, t_max, n)

    try:
        # Evaluate f(t)
        y = _eval_expr(expr, t)

        # Numerical Fourier transform
        omega, F = _numeric_fourier(t, y)

        fig = _new_figure()
        ax = fig.add_subplot(111)

        expr_math = _expr_to_math(expr)

        # Plot magnitude |F(ω)|
        ax.plot(omega, np.abs(F))
        ax.set_xlabel(r"$\omega$")
        ax.set_ylabel(r"$|F(\omega)|$")
        ax.set_title(r"$\mathcal{F}\{f(t)\},\quad f(t) = " + expr_math + r"$")

        _apply_plot_theme(ax, theme)

        png = _fig_to_png_bytes(fig)
        return Response(content=png, media_type="image/png")

    except Exception:
        # On failure (bad expr, etc.), just show an empty axes with a note
        fig = _new_figure()
        ax = fig.add_subplot(111)

        expr_math = _expr_to_math(expr)
        ax.set_xlabel(r"$\omega$")
        ax.set_ylabel(r"$|F(\omega)|$")
        ax.set_title(
            r"Could not evaluate $\mathcal{F}\{f(t)\}$ for $f(t) = "
            + expr_math
            + r"$"
        )

        _apply_plot_theme(ax, theme)

        png = _fig_to_png_bytes(fig)
        return Response(content=png, media_type="image/png")


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

    # If range is invalid, just return an empty plot too
    if t_min >= t_max:
        fig = _empty_plot(expr, t_min, t_max, theme)
        png = _fig_to_png_bytes(fig)
        return Response(content=png, media_type="image/png")

    t = np.linspace(t_min, t_max, n)

    try:
        y = _eval_expr(expr, t)

        fig = _new_figure()
        ax = fig.add_subplot(111)

        expr_math = _expr_to_math(expr)
        ax.plot(t, y)
        ax.set_xlabel(r"$t$")
        ax.set_ylabel(r"$f(t)$")
        ax.set_title(r"$f(t) = " + expr_math + r"$")


        _apply_plot_theme(ax, theme)

        png = _fig_to_png_bytes(fig)
        return Response(content=png, media_type="image/png")

    except Exception:
        # Invalid expression → empty plot (no curve)
        fig = _empty_plot(expr, t_min, t_max, theme)
        png = _fig_to_png_bytes(fig)
        return Response(content=png, media_type="image/png")
