#!/usr/bin/env python3
"""Post the status check's alerts to Google Chat (stdlib only; the workflow runs it after check.py).

  notify-down.txt  → TrioTheo Alerts   (secret CHAT_WEBHOOK_ALERTS), opening with the `[NEEDS YOU]` tag
  notify-back.txt  → TrioTheo Activity (secret CHAT_WEBHOOK_ACTIVITY), no tag

Both hooks arrive by environment only and are never printed. A hook that is not set only warns and prints
the lines, so the run still records the check. The same shape as the platform's notify_note: the tag alone
on its line, a blank line, then the bold title; Chat's Markdown mode.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
# file, the env var holding its hook, the tag its message opens with ("" = none)
ROUTES = [
    ("notify-down.txt", "CHAT_WEBHOOK_ALERTS", "`[NEEDS YOU]`"),
    ("notify-back.txt", "CHAT_WEBHOOK_ACTIVITY", ""),
]


def main() -> int:
    failed = False
    for fname, env, tag in ROUTES:
        path = HERE / fname
        if not path.exists():
            continue
        text = path.read_text().strip()
        url = os.environ.get(env, "").strip()
        if not url:
            print(f"::warning::{fname} was written but {env} is not set — nobody was told:\n{text}")
            path.unlink()
            continue
        message = f"{tag}\n\n{text}" if tag else text
        body = json.dumps({"text": message[:4000], "markupSyntax": "MARKUP_SYNTAX_MARKDOWN"}).encode()
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json; charset=UTF-8"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                print(f"chat {env}: {r.status}")
        except Exception as e:  # noqa: BLE001 — never echo the URL (an HTTPError's repr can carry it)
            print(f"::warning::{env} post failed ({type(e).__name__}); lines were:\n{text}")
            failed = True
        path.unlink()
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
