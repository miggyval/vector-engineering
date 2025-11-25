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

