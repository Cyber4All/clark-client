#!/usr/bin/env python3

import requests, json, datetime, os

# -------------------------------------------------------
# ENVIRONMENT VARIABLES (SET BY ORB)
#
# ** throws error if any of the ENV do not exist **
# -------------------------------------------------------

CIRCLE_BUILD_URL=os.environ['CIRCLE_BUILD_URL']
SHORTCUT_TOKEN=os.environ['SHORTCUT_TOKEN']
REPOSITORY=os.environ['CIRCLE_PROJECT_REPONAME']
LANGUAGE=os.environ['LANGUAGE']
WORKFLOW_STATE_ID=500005737
PROJECT_ID=14743
GROUP_ID="61ae65f8-ec5a-4f81-8b85-76516b014ed5"

# -------------------------------------------------------
# SHORTCUT APIv3 CONFIGURATION
# -------------------------------------------------------

DEADLINE=datetime.datetime.today() + datetime.timedelta(days=14)
DESCRIPTION=f"""
## *Repositories*: {REPOSITORY}

## Description

Post deployment or quarterly review of Software Bill of Materials (SBOM) for {REPOSITORY}. This story will track the vulnerability analysis of the SBOM and any dependency upgrades.

## Requirements

1. Download and scan SBOM using cve-bin-tool
2. Upload scan results to Shortcut story
3. Upgrade dependencies with HIGH or CRITICAL vulnerabilities

## Documentation

[CVE_BIN_TOOL Documentation](https://cve-bin-tool.readthedocs.io/en/latest/README.html#scanning-an-sbom-file-for-known-vulnerabilities)

### CVE Databases

[NIST NVD Homepage](https://nvd.nist.gov/)
[OpenSSF OSV Homepage](https://osv.dev/)
"""

# -------------------------------------------------------
# CREATE STORY PAYLOAD
# -------------------------------------------------------

DATA = {
    "name": f"Review {REPOSITORY} SBOM",
    "workflow_state_id": WORKFLOW_STATE_ID,
    "project_id": PROJECT_ID,
    "group_id": GROUP_ID,
    "description": DESCRIPTION,
    "move_to": "first",
    "deadline": DEADLINE.strftime("%Y-%m-%d"),
    "story_type": "chore",
    "tasks": [ 
        {
            "description": f"Analyze {REPOSITORY} SBOM for vulnerabilities"
        },
        {
            "description": "Upgrade dependencies"
        }
    ],
    "external_links": [ CIRCLE_BUILD_URL ],
    "labels": [
        {
            "color": "#a8324e",
            "description": "Repository",
            "name": REPOSITORY
        },
        {   
            "color": "#1c70dd",
            "description": "Language",
            "name": LANGUAGE
        }
    ]
}

# -------------------------------------------------------
# CREATE STORY REQUEST
# -------------------------------------------------------

res = requests.post(
    url="https://api.app.shortcut.com/api/v3/stories",
    headers={
        "Content-Type": "application/json",
        "Shortcut-Token": SHORTCUT_TOKEN
    },
    data=json.dumps(DATA)
)
res.raise_for_status()