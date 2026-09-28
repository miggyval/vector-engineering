"""Numerical rendering in disposable worker processes; no HTTP state."""
import ast
import io
from pathlib import Path
import cv2
import numpy as np
import matplotlib
matplotlib.use("Agg")
matplotlib.rcParams.update({"mathtext.fontset": "stix", "font.family": "STIXGeneral"})
from matplotlib.backends.backend_svg import FigureCanvasSVG
from matplotlib.figure import Figure
PLOT_WIDTH_IN, PLOT_HEIGHT_IN, PLOT_DPI = 6, 3.5, 200

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
    tree = validate_expr(expr)

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

    for node in ast.walk(tree):
        if isinstance(node, ast.Constant):
            node.value = float(node.value)

    env = {**_EXPR_FUNCS, **_EXPR_CONSTS, "t": t}
    y = eval(compile(tree, "<expr>", "eval"), {"__builtins__": {}}, env)

    # Broadcast so constant expressions like "1" still plot as a line
    y = np.asarray(y, dtype=float)
    if y.shape != t.shape:
        y = np.broadcast_to(y, t.shape)
    if not np.isfinite(y).any():
        raise ValueError("Expression has no finite values on this domain")
    return y


def _new_figure() -> Figure:
    return Figure(figsize=(PLOT_WIDTH_IN, PLOT_HEIGHT_IN), dpi=PLOT_DPI)


def _fig_response(fig: Figure) -> bytes:
    """Render a figure as SVG: resolution-independent and ~10x smaller than PNG."""
    buf = io.BytesIO()
    FigureCanvasSVG(fig).print_svg(buf)
    return buf.getvalue()


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



def validate_expr(expr):
    if not 1 <= len(expr) <= 512:
        raise ValueError("Expression must contain 1–512 characters")
    try:
        tree = ast.parse(expr, mode="eval")
    except (SyntaxError, RecursionError) as exc:
        raise ValueError("Invalid expression syntax") from exc
    nodes = list(ast.walk(tree))
    if len(nodes) > 128:
        raise ValueError("Expression is too complex")
    def depth(node):
        return 1 + max((depth(c) for c in ast.iter_child_nodes(node)), default=0)
    if depth(tree) > 20:
        raise ValueError("Expression is nested too deeply")
    for node in nodes:
        if not isinstance(node, _ALLOWED_NODES):
            raise ValueError("Unsupported expression syntax")
        if isinstance(node, ast.Name) and node.id not in {"t", *_EXPR_FUNCS, *_EXPR_CONSTS}:
            raise ValueError("Unknown expression name")
        if isinstance(node, ast.Call) and (not isinstance(node.func, ast.Name) or node.func.id not in _EXPR_FUNCS or node.keywords):
            raise ValueError("Only supported mathematical functions may be called")
        if isinstance(node, ast.Constant) and (type(node.value) not in (int, float) or not -1e6 <= node.value <= 1e6):
            raise ValueError("Numeric constants must be finite and within ±1,000,000")
    return tree


def render(kind, params):
    if kind == "edge":
        img = cv2.imread(str(Path(__file__).parent / "data/input.jpg"), cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise RuntimeError("Edge-demo source image is unavailable")
        ok, buf = cv2.imencode(".png", cv2.Canny(img, params["t1"], params["t2"]))
        if not ok:
            raise RuntimeError("Image encoding failed")
        return buf.tobytes()
    t = np.linspace(params["t_min"], params["t_max"], params["n"])
    with np.errstate(all="ignore"):
        y = _eval_expr(params["expr"], t)
    fig = _new_figure()
    ax = fig.add_subplot(111)
    if kind == "fourier":
        if not np.isfinite(y).all():
            raise ValueError("Fourier plots require finite samples throughout the domain")
        omega, values = _numeric_fourier(t, y)
        ax.plot(omega, np.abs(values))
        ax.set_xlabel(r"$\omega$")
        ax.set_ylabel(r"$|F(\omega)|$")
    else:
        ax.plot(t, y)
        ax.set_xlabel(r"$t$")
        ax.set_ylabel(r"$f(t)$")
    # Raw text avoids sending user expressions through a second math parser.
    ax.set_title("f(t) = " + params["expr"], parse_math=False)
    _apply_plot_theme(ax, params["theme"])
    return _fig_response(fig)


def render_worker(connection, kind, params):
    try:
        connection.send((200, render(kind, params)))
    except (ValueError, TypeError, OverflowError, ZeroDivisionError, FloatingPointError):
        connection.send((422, "Expression cannot be evaluated on this domain"))
    except Exception:
        connection.send((503, "Rendering is temporarily unavailable"))
    finally:
        connection.close()
