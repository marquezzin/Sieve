#!/usr/bin/env uv run python
"""Create AGENTS.md symlinks next to every CLAUDE.md in a repo tree."""

import argparse
import os
from pathlib import Path


IGNORED_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "node_modules",
    "__pycache__",
}


def iter_claude_files(root: Path) -> list[Path]:
    claude_files: list[Path] = []

    for current_root, dirnames, filenames in os.walk(root):
        dirnames[:] = [name for name in dirnames if name not in IGNORED_DIRS]
        if "CLAUDE.md" in filenames:
            claude_files.append(Path(current_root) / "CLAUDE.md")

    return sorted(claude_files)


def relative_target(link_path: Path, target_path: Path) -> str:
    return os.path.relpath(target_path, start=link_path.parent)


def sync_link(
    claude_path: Path,
    *,
    dry_run: bool,
    force: bool,
    replace_existing: bool,
) -> str:
    agents_path = claude_path.with_name("AGENTS.md")
    target = relative_target(agents_path, claude_path)

    if agents_path.is_symlink():
        current_target = os.readlink(agents_path)
        if current_target == target:
            return f"ok      {agents_path}"
        if not force:
            return f"skip    {agents_path} -> {current_target} (use --force)"
        if not dry_run:
            agents_path.unlink()
            agents_path.symlink_to(target)
        return f"replace {agents_path} -> {target}"

    if agents_path.exists():
        if not replace_existing:
            return f"skip    {agents_path} exists (use --replace-existing)"
        if not dry_run:
            agents_path.unlink()
            agents_path.symlink_to(target)
        return f"replace {agents_path} -> {target}"

    if not dry_run:
        agents_path.symlink_to(target)
    return f"create  {agents_path} -> {target}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Create AGENTS.md symlinks next to every CLAUDE.md under a root. "
            "By default, existing real AGENTS.md files are left untouched."
        )
    )
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        help="Repo root to scan. Defaults to the current directory.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned changes without touching the filesystem.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace AGENTS.md symlinks that point somewhere else.",
    )
    parser.add_argument(
        "--replace-existing",
        action="store_true",
        help="Replace existing non-symlink AGENTS.md files. Use with care.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).expanduser().resolve()

    if not root.exists() or not root.is_dir():
        print(f"Root not found or not a directory: {root}")
        return 2

    claude_files = iter_claude_files(root)
    if not claude_files:
        print(f"No CLAUDE.md files found under {root}")
        return 0

    for claude_path in claude_files:
        print(
            sync_link(
                claude_path,
                dry_run=args.dry_run,
                force=args.force,
                replace_existing=args.replace_existing,
            )
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
