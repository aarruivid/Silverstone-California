# Rollback Runbook - Silverstone-California

Use this runbook to revert the Silverstone-California repo to its state before the MOLTBOT portal integration.

---

## Scenario 1: Rollback via Git (Preferred)

This is the fastest and cleanest method. It resets the `main` branch to the `pre-portal` tag.

```bash
cd ~/Documents/Silverstone-California
git checkout main
git reset --hard pre-portal
git push origin main --force
```

### Verification
```bash
git log --oneline -1
# Should show: 18555d7 Update Propuesta Solar - AXIA by Qcells.html - months default
git diff pre-portal
# Should produce no output
```

---

## Scenario 2: Rollback via Backup Copy

Use this if the git history is corrupted or the tag is missing.

```bash
rm -rf ~/Documents/Silverstone-California
cp -R ~/Documents/backups/silverstone-backup-20260304-1338/repo-full ~/Documents/Silverstone-California
cd ~/Documents/Silverstone-California
git push origin main --force
```

### Verification
```bash
cd ~/Documents/Silverstone-California
shasum -a 256 index.html
# Compare against checksums-sha256.txt in the backup directory
git log --oneline -1
# Should show: 18555d7
```

---

## Scenario 3: Restore index.html Only

Use this for a minimal fix if only the landing page is broken.

```bash
cd ~/Documents/Silverstone-California
cp ~/Documents/backups/silverstone-backup-20260304-1338/index-html-snapshot.html index.html
git add index.html
git commit -m "Restore index.html to pre-portal state"
git push origin main
```

### Verification
```bash
diff index.html ~/Documents/backups/silverstone-backup-20260304-1338/index-html-snapshot.html
# Should produce no output
```

---

## Important Notes

- **Mac mini backends are independent.** Rolling back Silverstone-California does NOT affect MOLTBOT, Docker containers, or any backend services running on the Mac mini. Those systems operate separately.
- **GitHub Pages.** After force-pushing, GitHub Pages may take 1-2 minutes to reflect the rollback.
- **Backup checksums.** You can verify backup integrity at any time:
  ```bash
  cd ~/Documents/backups/silverstone-backup-20260304-1338
  shasum -a 256 -c checksums-sha256.txt
  ```
