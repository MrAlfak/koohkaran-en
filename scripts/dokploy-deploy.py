#!/usr/bin/env python3
"""Upload kohkaran-web (EN) ZIP to Dokploy drop deployment and build."""

from __future__ import annotations

import io
import json
import os
import subprocess
import sys
import time
import urllib.request
import zipfile
from pathlib import Path

API = "http://217.114.40.67:3000/api"
KEY = os.environ.get("DOKPLOY_API_KEY", "")
if not KEY:
    raise SystemExit("Set DOKPLOY_API_KEY environment variable")
APP = os.environ.get("DOKPLOY_APP_ID", "zsOJzrF4BAFIn9y0rXuLE")
APP_NAME = os.environ.get("DOKPLOY_APP_NAME", "koohkaran-en-website")
ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    ".git",
    "node_modules",
    ".cursor",
    ".claude",
    ".vscode",
    "scripts",
    ".parcel-cache",
    "release",
    "src",
}
SKIP_FILES = {".env", ".env.local", "pnpm-lock.yaml", "package.json", "package-lock.json"}
SKIP_PREFIXES = ("public/images/svg_img_",)


def collect_files() -> list[str]:
    required = ["Dockerfile", "nginx.conf", ".dockerignore"]
    names: list[str] = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name in SKIP_FILES or name.endswith(".zip"):
                continue
            full = Path(dirpath) / name
            rel = full.relative_to(ROOT).as_posix()
            if any(rel.startswith(p) for p in SKIP_PREFIXES):
                continue
            if rel in required or rel.startswith("dist/"):
                names.append(rel)
    for r in required:
        if r not in names and (ROOT / r).exists():
            names.append(r)
    return sorted(set(names))


def build_zip(files: list[str]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for rel in files:
            zf.write(ROOT / rel, rel)
    return buf.getvalue()


def api_json(method: str, path: str, data: dict | None = None) -> object:
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(
        f"{API}/{path}",
        data=body,
        method=method,
        headers={"x-api-key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else {}


try:
    import requests
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests


def upload_zip(zip_bytes: bytes) -> bool:
    url = f"{API}/trpc/application.dropDeployment"
    for attempt in range(1, 4):
        try:
            print(f"upload attempt {attempt} size={len(zip_bytes)}", flush=True)
            response = requests.post(
                url,
                headers={"x-api-key": KEY},
                files={"zip": ("koohkaran-en-web.zip", zip_bytes, "application/zip")},
                data={"applicationId": APP},
                timeout=600,
            )
            print("upload status", response.status_code, response.text[:500], flush=True)
            return response.status_code == 200 and "true" in response.text.lower()
        except Exception as exc:  # noqa: BLE001
            print("upload error", exc, flush=True)
            time.sleep(5)
    return False


def latest_dep() -> dict:
    items = api_json("GET", f"deployment.allByType?id={APP}&type=application")
    return items[0]  # type: ignore[index]


def dep_log(dep_id: str) -> str:
    result = api_json("GET", f"deployment.readLogs?deploymentId={dep_id}")
    if isinstance(result, str) and result.startswith('"'):
        return json.loads(result)
    return result if isinstance(result, str) else str(result)


def ensure_build() -> None:
    if os.environ.get("SKIP_BUILD") == "1" and (ROOT / "dist" / "index.html").exists():
        print("skip build (dist present)", flush=True)
        return
    print("building vite dist ...", flush=True)
    cmd = "npm run build" if os.name == "nt" else ["npm", "run", "build"]
    subprocess.check_call(cmd, cwd=ROOT, shell=isinstance(cmd, str))


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    build_id = str(int(time.time()))

    ensure_build()

    for pattern in ("svg_img_*",):
        for f in (ROOT / "dist" / "images").glob(pattern):
            print("drop unused", f.name, flush=True)
            f.unlink(missing_ok=True)

    print("collecting files ...", flush=True)
    files = collect_files()
    print(f"zipping {len(files)} files ...", flush=True)
    zip_bytes = build_zip(files)
    print(f"build_id={build_id} zip_files={len(files)} zip_size={len(zip_bytes)}", flush=True)

    if len(zip_bytes) > 80_000_000:
        print("ZIP still too large; abort", flush=True)
        return 1

    for path, payload in [
        ("application.stop", {"applicationId": APP}),
        ("application.cleanQueues", {"applicationId": APP}),
        ("application.killBuild", {"applicationId": APP}),
    ]:
        try:
            api_json("POST", path, payload)
            print("ok", path, flush=True)
        except Exception as exc:  # noqa: BLE001
            print("skip", path, exc, flush=True)

    if not upload_zip(zip_bytes):
        print("ZIP upload failed", flush=True)
        return 1

    api_json(
        "POST",
        "application.update",
        {
            "applicationId": APP,
            "sourceType": "drop",
            "buildType": "dockerfile",
            "dockerfile": "Dockerfile",
            "dockerContextPath": ".",
            "dockerImage": f"{APP_NAME}:latest",
            "cleanCache": True,
            "applicationStatus": "idle",
        },
    )

    print("redeploy after zip upload ...", flush=True)
    api_json(
        "POST",
        "application.redeploy",
        {
            "applicationId": APP,
            "title": f"ZIP drop deploy EN {build_id}",
            "description": "scripts/dokploy-deploy.py (english)",
        },
    )

    dep: dict = {}
    for i in range(120):
        time.sleep(8)
        dep = latest_dep()
        status = dep.get("status", "?")
        print("poll", i + 1, status, flush=True)
        if status in {"done", "error"}:
            break

    log = dep_log(dep.get("deploymentId", ""))
    print(log[-8000:].encode("ascii", errors="replace").decode("ascii"), flush=True)

    time.sleep(5)
    try:
        api_json("POST", "application.start", {"applicationId": APP})
    except Exception as exc:  # noqa: BLE001
        print("start skip", exc, flush=True)

    if dep.get("status") == "done":
        print("DEPLOY_OK", flush=True)
        print(f"https://{APP_NAME}-461727-217-114-40-67.sslip.io/", flush=True)
        print("https://koohkaranstone.com/", flush=True)
        return 0
    print("DEPLOY_FAILED", flush=True)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
