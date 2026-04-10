#!/usr/bin/env bash
# ---------------------------------------------------------------
# revert-to-audited.sh
#
# Reverts the entire working tree back to the "audited-baseline"
# git tag — the last known-good audited state of the Timeless
# Hadith website (tree from commit 37336c3, dated 2026-03-29).
#
# Usage (from the project root):
#     ./scripts/revert-to-audited.sh
#     ./scripts/revert-to-audited.sh --no-commit
#     ./scripts/revert-to-audited.sh --push
#     ./scripts/revert-to-audited.sh -m "revert: hotfix rollback"
#
# Safety:
#   - Creates a forward-moving commit (no reset, no force-push)
#   - Aborts if there are uncommitted changes
#   - Does NOT push unless explicitly told to
# ---------------------------------------------------------------

set -euo pipefail

MESSAGE="revert: roll back to audited-baseline"
NO_COMMIT=0
DO_PUSH=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message) MESSAGE="$2"; shift 2 ;;
    --no-commit)  NO_COMMIT=1;  shift ;;
    --push)       DO_PUSH=1;    shift ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }

cyan "==> Checking git repository"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { red "Not inside a git repo."; exit 1; }
cd "$GIT_ROOT"
green "    Repo root: $GIT_ROOT"

cyan "==> Verifying audited-baseline tag"
if ! git rev-parse --verify --quiet "refs/tags/audited-baseline" >/dev/null; then
  red "    Tag 'audited-baseline' does not exist."
  exit 1
fi
green "    audited-baseline -> $(git rev-parse --short audited-baseline)"

cyan "==> Checking for uncommitted changes"
if [[ -n "$(git status --porcelain)" ]]; then
  red "    Working tree is dirty. Commit or stash first:"
  git status --short
  exit 1
fi
green "    Working tree is clean"

cyan "==> Computing diff vs audited-baseline"
if [[ -z "$(git diff --name-status audited-baseline..HEAD)" ]]; then
  green "    Already at audited-baseline. Nothing to do."
  exit 0
fi
git diff --name-status audited-baseline..HEAD | awk '
  /^A/ { a++ } /^M/ { m++ } /^D/ { d++ }
  END  { printf "    Will delete   : %d added files\n", a+0;
         printf "    Will restore  : %d modified files\n", m+0;
         printf "    Will re-create: %d deleted files\n", d+0 }'

cyan "==> Resetting working tree and index to audited-baseline"
git read-tree -u --reset audited-baseline
green "    Working tree now matches audited-baseline"

CURRENT_TREE="$(git write-tree)"
TARGET_TREE="$(git rev-parse 'audited-baseline^{tree}')"
if [[ "$CURRENT_TREE" != "$TARGET_TREE" ]]; then
  red "    Tree hash mismatch: $CURRENT_TREE vs $TARGET_TREE"
  exit 1
fi
green "    Tree hash verified: $CURRENT_TREE"

if [[ "$NO_COMMIT" == "1" ]]; then
  cyan "==> Skipping commit (--no-commit)"
  yellow "    Index and working tree at audited-baseline, HEAD unchanged."
  exit 0
fi

cyan "==> Creating revert commit"
git commit -m "$MESSAGE"
NEW_SHA="$(git rev-parse --short HEAD)"
green "    Created commit $NEW_SHA"

if [[ "$DO_PUSH" == "1" ]]; then
  cyan "==> Preparing to push"
  yellow "    About to push $NEW_SHA to origin/main"
  read -p "    Type 'yes' to push: " CONFIRM
  if [[ "$CONFIRM" == "yes" ]]; then
    git push origin main
    green "    Pushed to origin/main"
  else
    yellow "    Push skipped."
  fi
else
  yellow "    Not pushing. To push: git push origin main"
fi

echo
cyan "Done. Current HEAD:"
git log --oneline -1
