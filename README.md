# Teaching Course

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
git clone https://github.com/miggyval/teaching-course.git
cd teaching-course
```

```zsh
python3 -m venv .venv
source .venv/bin/activate
```

```
pip install --upgrade pip
pip install fastapi uvicorn[standard] sympy numpy matplotlib pillow
pip install mkdocs mkdocs-material
```
