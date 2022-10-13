#!/usr/bin/env bash
set -o nounset

WORKFLOW_STATE_ID=500005737
PROJECT_ID=14743
GROUP_ID="61ae65f8-ec5a-4f81-8b85-76516b014ed5"
REPOSITORY=$CIRCLE_PROJECT_REPONAME
DESCRIPTION="## *Repositories*: $REPOSITORY<br><br>Description<br><br>Post deployment or quarterly review of Software Bill of Materials (SBOM) for $REPOSITORY. This story will track the vulnerability analysis of the SBOM and any dependency upgrades.<br><br>Requirements<br><br>1. Download artifacts SBOM and Analysis output from CircleCI (link below)<br>2. Attach files to Shortcut story<br>3. Upgrade dependencies with HIGH or CRITICAL vulnerabilities in a new PR using Shortcut branch based off of main<br><br>Documentation<br><br>[CVE_BIN_TOOL Documentation](https://cve-bin-tool.readthedocs.io/en/latest/README.html#scanning-an-sbom-file-for-known-vulnerabilities)<br><br>CVE Databases<br><br>[NIST NVD Homepage](https://nvd.nist.gov/)<br>[OpenSSF OSV Homepage](https://osv.dev/)"

curl -X POST \
  -L "https://api.app.shortcut.com/api/v3/stories" \
  -H "Content-Type: application/json" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -d '{"deadline": "2022-12-31T12:30:00Z", "description": "'"$DESCRIPTION"'", "labels": [{"color": "#f8324e", "description": "Repository", "name": "'"$REPOSITORY"'"},{ "color": "#1c70dd", "description": "Language", "name": "'"$LANGUAGE"'"}], "external_links": ["'"$CIRCLE_BUILD_URL"'"], "group_id": "'"$GROUP_ID"'", "move_to": "first", "name": "'"Review $REPOSITORY SBOM"'", "project_id": "'"$PROJECT_ID"'", "story_type": "chore", "workflow_state_id": "'"$WORKFLOW_STATE_ID"'" }'