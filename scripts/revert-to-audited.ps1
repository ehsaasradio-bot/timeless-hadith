# ---------------------------------------------------------------
# revert-to-audited.ps1
#
# Reverts the entire working tree back to the "audited-baseline"
# git tag — the last known-good audited state of the Timeless
# Hadith website (tree from commit 37336c3, dated 2026-03-29).
#
# Usage (from PowerShell, in the project root):
#     .\scripts\revert-to-audited.ps1
#
# Or with a custom commit message:
#     .\scripts\revert-to-audited.ps1 -Message "revert: rollback for hotfix"
#
# Flags:
#     -NoCommit   Reset the files only; do not create a commit
#     -Push       Push to origin/main after committing (asks first)
#
# Safety:
#   - Uses a forward-moving commit (no reset, no force-push)
#   - Aborts if there are uncommitted changes in the working tree
#   - Aborts if the audited-baseline tag does not exist
#   - Does NOT push unless explicitly told to
# ---------------------------------------------------------------

param(
    [string]$Message = "revert: roll back to audited-baseline",
    [switch]$NoCommit,
    [switch]$Push
)

$ErrorActionPreference = "Stop"

function Write-Step($text)  { Write-Host "==> $text" -ForegroundColor Cyan }
function Write-OK($text)    { Write-Host "    $text" -ForegroundColor Green }
function Write-Warn($text)  { Write-Host "    $text" -ForegroundColor Yellow }
function Write-Err($text)   { Write-Host "    $text" -ForegroundColor Red }

# 1. Confirm we are inside a git repo
Write-Step "Checking git repository"
$gitRoot = git rev-parse --show-toplevel 2>$null
if (-not $gitRoot) {
    Write-Err "Not inside a git repository. Run this from the project root."
    exit 1
}
Set-Location $gitRoot
Write-OK  "Repo root: $gitRoot"

# 2. Verify the audited-baseline tag exists
Write-Step "Verifying audited-baseline tag"
$tagSha = git rev-parse --verify --quiet "refs/tags/audited-baseline"
if (-not $tagSha) {
    Write-Err "Tag 'audited-baseline' does not exist in this repo."
    Write-Err "Create it first with:"
    Write-Err "    git tag -a audited-baseline <commit> -m 'audited baseline'"
    exit 1
}
Write-OK  "audited-baseline -> $tagSha"

# 3. Refuse to run with uncommitted changes
Write-Step "Checking for uncommitted changes"
$dirty = git status --porcelain
if ($dirty) {
    Write-Err "Working tree has uncommitted changes. Commit or stash them first:"
    Write-Host $dirty
    exit 1
}
Write-OK  "Working tree is clean"

# 4. Show what would change
Write-Step "Computing diff vs audited-baseline"
$changes = git diff --name-status audited-baseline..HEAD
if (-not $changes) {
    Write-OK "Working tree already matches audited-baseline. Nothing to do."
    exit 0
}
$added    = ($changes | Where-Object { $_ -match '^A' }).Count
$modified = ($changes | Where-Object { $_ -match '^M' }).Count
$deleted  = ($changes | Where-Object { $_ -match '^D' }).Count
Write-OK  "Will delete   : $added added files"
Write-OK  "Will restore  : $modified modified files"
Write-OK  "Will re-create: $deleted deleted files"

# 5. Reset working tree + index to audited-baseline's tree
Write-Step "Resetting working tree and index to audited-baseline"
git read-tree -u --reset audited-baseline
if ($LASTEXITCODE -ne 0) {
    Write-Err "git read-tree failed. Aborting."
    exit 1
}
Write-OK  "Working tree now matches audited-baseline"

# 6. Verify tree hash
$currentTree = git write-tree
$targetTree  = git rev-parse "audited-baseline^{tree}"
if ($currentTree -ne $targetTree) {
    Write-Err "Tree verification failed. Current: $currentTree  Target: $targetTree"
    exit 1
}
Write-OK  "Tree hash verified: $currentTree"

# 7. Commit the revert (unless -NoCommit)
if ($NoCommit) {
    Write-Step "Skipping commit (-NoCommit was set)"
    Write-Warn "Index and working tree are now at audited-baseline, but HEAD is unchanged."
    Write-Warn "Review with 'git status' and commit manually when ready."
    exit 0
}

Write-Step "Creating revert commit"
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Err "git commit failed."
    exit 1
}
$newSha = git rev-parse --short HEAD
Write-OK  "Created commit $newSha"

# 8. Push (only if -Push and user confirms)
if ($Push) {
    Write-Step "Preparing to push"
    Write-Warn "About to push commit $newSha to origin/main"
    $confirm = Read-Host "Type 'yes' to push, anything else to skip"
    if ($confirm -eq "yes") {
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            Write-OK "Pushed to origin/main"
        } else {
            Write-Err "Push failed."
            exit 1
        }
    } else {
        Write-Warn "Push skipped. To push later, run: git push origin main"
    }
} else {
    Write-Warn "Not pushing. To push, run: git push origin main"
    Write-Warn "Or re-run this script with -Push"
}

Write-Host ""
Write-Host "Done. Current HEAD:" -ForegroundColor Cyan
git log --oneline -1
