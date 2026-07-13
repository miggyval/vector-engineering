# Valencia Engineering

## Installation Guide

```zsh
brew update
brew install \
    nginx \
    python@3.12 \
    node \
    git \
    ffmpeg \
    dvisvgm \
    texlive \
    imagemagick
```

```zsh
mkdir -p ~/web
cd ~/web
git clone https://github.com/miggyval/valencia-engineering.git
cd valencia-engineering
```

```zsh
python3 -m venv .venv
source .venv/bin/activate
```

```zsh
pip install --upgrade pip
pip install fastapi uvicorn[standard] sympy numpy matplotlib pillow
pip install mkdocs mkdocs-material
pip install mkdocs-toggle-sidebar-plugin
pip install fastapi uvicorn
pip install opencv-python
```

```zsh
mkdocs build
```
```zsh
uvicorn api.main:app --host 0.0.0.0 --port 8000
```
