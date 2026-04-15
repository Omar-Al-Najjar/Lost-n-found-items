# Frontend Run + Git Scenarios Playbook

This guide covers:
1. How to run the frontend(s) in this repository.
2. Practical Git workflows and recovery scenarios you will commonly need.

## 1) Frontend Run Instructions

This repository currently contains **two frontend setups**:
1. Root Expo app (`c:\Users\HP\Desktop\vsc files`)
2. Vite app inside `Lost & Found App UI`

### Option A: Run the Expo app (root)

From repo root:

```powershell
cd "c:\Users\HP\Desktop\vsc files"
npm install
npx expo start
```

Useful Expo launch commands:

```powershell
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Option B: Run the Vite app (`Lost & Found App UI`)

```powershell
cd "c:\Users\HP\Desktop\vsc files\Lost & Found App UI"
npm install
npm run dev
```

Build Vite app:

```powershell
npm run build
```

## 2) Git Scenarios Playbook

## A. One-time setup on a machine

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

## B. Clone and start work

```powershell
git clone https://github.com/Omar-Al-Najjar/Lost-n-found-items.git
cd Lost-n-found-items
git checkout main
git pull origin main
```

## C. Start a feature branch

```powershell
git checkout main
git pull origin main
git checkout -b feature/short-description
```

## D. Add, commit, push

```powershell
git add .
git commit -m "feat: short clear message"
git push -u origin feature/short-description
```

## E. Keep branch updated with `main`

Rebase style:

```powershell
git checkout feature/short-description
git fetch origin
git rebase origin/main
```

Merge style:

```powershell
git checkout feature/short-description
git fetch origin
git merge origin/main
```

## F. Open and merge pull request workflow

1. Push branch to GitHub.
2. Open PR into `main`.
3. Resolve review comments.
4. Merge PR on GitHub.
5. Sync local main:

```powershell
git checkout main
git pull origin main
```

## G. Resolve merge conflicts

```powershell
git status
```

Open conflicted files, remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), then:

```powershell
git add .
# if in merge
git commit -m "resolve merge conflicts"
# if in rebase
git rebase --continue
```

Abort if needed:

```powershell
git merge --abort
git rebase --abort
```

## H. Undo local changes (safe to dangerous order)

Discard unstaged changes in one file:

```powershell
git restore path/to/file
```

Unstage files but keep content:

```powershell
git restore --staged .
```

Restore all tracked files to last commit:

```powershell
git restore .
```

Remove untracked files/folders:

```powershell
git clean -fd
```

## I. Fix last commit message or content (before push)

```powershell
git commit --amend -m "better message"
```

If already pushed, amending requires force push:

```powershell
git push --force-with-lease
```

## J. Revert a pushed commit (safe history)

```powershell
git log --oneline
git revert <commit_sha>
git push origin main
```

## K. Reset branch to an older commit (rewrites history)

```powershell
git log --oneline
git reset --hard <commit_sha>
git push --force-with-lease
```

Use only when you intentionally want rewritten branch history.

## L. Stash temporary work

```powershell
git stash push -m "wip message"
git stash list
git stash pop
```

Apply without dropping stash:

```powershell
git stash apply stash@{0}
```

## M. Cherry-pick specific commit

```powershell
git checkout target-branch
git cherry-pick <commit_sha>
```

## N. Rename branch locally and remotely

```powershell
git branch -m old-name new-name
git push -u origin new-name
git push origin --delete old-name
```

## O. Delete branches

Delete local branch:

```powershell
git branch -d branch-name
```

Force delete local branch:

```powershell
git branch -D branch-name
```

Delete remote branch:

```powershell
git push origin --delete branch-name
```

## P. Tags and releases

```powershell
git tag -a v1.0.0 -m "release v1.0.0"
git push origin v1.0.0
```

Push all tags:

```powershell
git push origin --tags
```

## Q. Inspect history and changes

```powershell
git status
git log --oneline --decorate --graph --all -n 20
git diff
git diff --staged
git show <commit_sha>
```

## R. Recover lost work with reflog

```powershell
git reflog
git checkout <reflog_sha>
# or
git reset --hard <reflog_sha>
```

## S. Sync broken local branch to remote state

```powershell
git fetch origin
git checkout main
git reset --hard origin/main
```

## T. Common troubleshooting

`non-fast-forward` push rejected:

```powershell
git pull --rebase origin main
git push origin main
```

`detached HEAD`:

```powershell
git switch -c fix/detached-head
```

Wrong remote URL:

```powershell
git remote set-url origin https://github.com/Omar-Al-Najjar/Lost-n-found-items.git
```

Check remotes:

```powershell
git remote -v
```

## U. Recommended daily routine

```powershell
git checkout main
git pull origin main
git checkout -b feature/task-name
# code changes
git add .
git commit -m "feat: task summary"
git push -u origin feature/task-name
```

After PR merge:

```powershell
git checkout main
git pull origin main
git branch -d feature/task-name
```
