#!/usr/bin/env python3
"""Read-only docroot inventory. Never opens file contents or follows symlinks."""
import argparse, json, os, stat, sys
from datetime import datetime, timezone
from pathlib import Path

def inventory(root):
    root = Path(root)
    if root.is_symlink() or not root.is_dir():
        raise ValueError('Use a real document-root directory, not a symlink')
    records, errors = [], []
    def walk(folder):
        try:
            with os.scandir(folder) as entries:
                for entry in sorted(entries, key=lambda e:e.name):
                    rel = Path(entry.path).relative_to(root).as_posix()
                    try:
                        info = entry.stat(follow_symlinks=False)
                        kind = 'symlink' if stat.S_ISLNK(info.st_mode) else 'directory' if stat.S_ISDIR(info.st_mode) else 'file' if stat.S_ISREG(info.st_mode) else 'special'
                        group = 'review'
                        if rel.startswith(('wp-admin/', 'wp-includes/')): group = 'wordpress-core'
                        elif rel.startswith('wp-content/uploads/'): group = 'media'
                        elif rel.startswith('wp-content/'): group = 'wordpress-content-review'
                        records.append(dict(path=rel, kind=kind, bytes=info.st_size, group=group))
                        if kind == 'directory': walk(entry.path)
                    except OSError as exc: errors.append(dict(path=rel,error=str(exc)))
        except OSError as exc: errors.append(dict(path=str(folder.relative_to(root)),error=str(exc)))
    walk(root)
    return dict(checked_at=datetime.now(timezone.utc).isoformat(),root=str(root),records=records,errors=errors,scope='Names and sizes only; no contents, symlink targets, Nginx aliases, other vhosts or usage history')

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root')
    args=parser.parse_args()
    result=inventory(args.root)
    json.dump(result,sys.stdout,ensure_ascii=False,indent=2)
    print()
    sys.exit(1 if result['errors'] else 0)
