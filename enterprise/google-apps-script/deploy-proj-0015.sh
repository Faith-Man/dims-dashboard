#!/usr/bin/env bash
# PROJ-0015 — deploy the URL Fetch quota fix to the live DIMS-v3 Automation Engine
# with clasp. Run from anywhere inside a checkout of branch
# proj-0015-sync-quota-recovery:
#
#   bash enterprise/google-apps-script/deploy-proj-0015.sh
#
# Safety:
#   - Pulls the live project first and STOPS if either target file differs from
#     the version the fix was built against (someone edited it since).
#   - Saves a full local backup of the pulled project before changing anything.
#   - Replaces only TeachingArtifactSyncExtension and TeachingTwoWaySyncAutomation;
#     every other file is pushed back exactly as pulled.
#   - Asks for explicit confirmation before pushing, then re-pulls and verifies.
#   - Does NOT touch triggers. The trigger step is done in the editor afterwards.
set -euo pipefail

SCRIPT_ID="1LK-t7cDMlEeZRO0kEbuEiw5UrdrT1TB0NrSpIY_JPD4rVAU93Tjujzah"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILES=(TeachingArtifactSyncExtension TeachingTwoWaySyncAutomation)
# SHA-256 of the live sources as exported on 2026-10-08/09 (pre-fix baseline).
EXPECTED_LIVE_TeachingArtifactSyncExtension="63f8196d966e82166065dde39abe58767f8e3f8a86aa467aa644fdf23071a046"
EXPECTED_LIVE_TeachingTwoWaySyncAutomation="acbf1e271caa1aa99450e439d32501311e0c67759760de1aa23da3f1672e1a5c"

die() { echo "STOP: $*" >&2; exit 1; }
sha() { if command -v sha256sum >/dev/null; then sha256sum "$1" | cut -c1-64; else shasum -a 256 "$1" | cut -c1-64; fi; }
find_src() { # clasp names server files .js or .gs depending on version/config
  local dir=$1 name=$2 f
  for f in "$dir/$name.gs" "$dir/$name.js"; do [ -f "$f" ] && { echo "$f"; return; }; done
  die "$name not found in pulled project ($dir)"
}

command -v clasp >/dev/null || die "clasp is not installed. Run: npm install -g @google/clasp"
for name in "${FILES[@]}"; do [ -f "$SRC_DIR/$name.gs" ] || die "approved $name.gs missing next to this script"; done

WORK="$(mktemp -d)"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$HOME/proj-0015-backup-$STAMP"

echo "1/5 Pulling live project into $WORK ..."
(cd "$WORK" && clasp clone "$SCRIPT_ID" >/dev/null) \
  || die "clasp clone failed. Run 'clasp login' and enable the Apps Script API at https://script.google.com/home/usersettings"

echo "2/5 Checking live files against the expected baseline ..."
for name in "${FILES[@]}"; do
  f="$(find_src "$WORK" "$name")"
  expected_var="EXPECTED_LIVE_$name"
  actual="$(sha "$f")"
  if [ "$actual" != "${!expected_var}" ]; then
    die "$name in the live project changed since the fix was prepared (sha256 $actual). Nothing was modified. Send this output to Claude."
  fi
  echo "   $name: matches baseline"
done

echo "3/5 Saving full backup to $BACKUP ..."
cp -R "$WORK" "$BACKUP"

echo "4/5 Staging approved files ..."
for name in "${FILES[@]}"; do
  f="$(find_src "$WORK" "$name")"
  cp "$SRC_DIR/$name.gs" "$f"
done
(cd "$BACKUP" && for name in "${FILES[@]}"; do
  old="$(find_src "$BACKUP" "$name")"; new="$(find_src "$WORK" "$name")"
  printf '   %-32s %5s -> %5s lines\n' "$name" "$(wc -l < "$old")" "$(wc -l < "$new")"
done)
other_changes="$(diff -rq -x .clasp.json "$BACKUP" "$WORK" | grep -v -e TeachingArtifactSyncExtension -e TeachingTwoWaySyncAutomation || true)"
[ -z "$other_changes" ] || die "unexpected differences besides the two target files: $other_changes"

echo
read -r -p "Type DEPLOY to push these two files to the live project: " answer
[ "$answer" = "DEPLOY" ] || die "not confirmed; nothing was pushed. Backup kept at $BACKUP"

echo "5/5 Pushing and verifying ..."
(cd "$WORK" && clasp push --force)
VERIFY="$(mktemp -d)"
(cd "$VERIFY" && clasp clone "$SCRIPT_ID" >/dev/null)
for name in "${FILES[@]}"; do
  pushed="$(sha "$(find_src "$VERIFY" "$name")")"
  approved="$(sha "$SRC_DIR/$name.gs")"
  [ "$pushed" = "$approved" ] || die "$name read back differently after push ($pushed != $approved). Roll back from $BACKUP with: cd $BACKUP && clasp push --force"
  echo "   $name: live now matches approved version"
done

cat <<EOF

DEPLOYED. Backup of the previous live project: $BACKUP
Rollback, if ever needed:  cd "$BACKUP" && clasp push --force

Last step, in the Apps Script editor
(https://script.google.com/home/projects/$SCRIPT_ID/edit):
  1. Run listWorkflowTriggers()                        -> record output
  2. Run installAutomaticTeachingTwoWaySyncTrigger()  -> 5 min trigger replaced by one 15 min trigger
  3. Run verifyAutomaticTeachingTwoWaySyncTrigger()   -> expect trigger_count: 1
  4. Run listWorkflowTriggers()                        -> same as step 1 except the new two-way trigger id
Do not touch the RB-001 triggers.
EOF
