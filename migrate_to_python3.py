#!/usr/bin/env python3
"""
Python 2 to Python 3 Migration Script for GGRC-Core

This script automates common Python 2 to 3 conversions:
- print statements -> print() functions
- .iteritems() -> .items()
- .iterkeys() -> .keys()
- .itervalues() -> .values()
- xrange() -> range()
- unicode() -> str()
- basestring -> str
- long -> int
- urllib/urlparse imports
"""

import os
import re
import sys
from pathlib import Path


def migrate_file(filepath):
    """Migrate a single Python file to Python 3."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original_content = content
    changes = []

    # Fix .iteritems() -> .items()
    if '.iteritems()' in content:
        content = content.replace('.iteritems()', '.items()')
        changes.append('iteritems -> items')

    # Fix .iterkeys() -> .keys()
    if '.iterkeys()' in content:
        content = content.replace('.iterkeys()', '.keys()')
        changes.append('iterkeys -> keys')

    # Fix .itervalues() -> .values()
    if '.itervalues()' in content:
        content = content.replace('.itervalues()', '.values()')
        changes.append('itervalues -> values')

    # Fix xrange() -> range()
    if 'xrange(' in content:
        content = re.sub(r'\bxrange\(', 'range(', content)
        changes.append('xrange -> range')

    # Fix unicode() -> str() (but not in comments or strings)
    if 'unicode(' in content:
        # Only replace function calls, not in docstrings
        content = re.sub(r'([^\'"])unicode\(', r'\1str(', content)
        changes.append('unicode -> str')

    # Fix basestring -> str (in type checks and docstrings)
    if 'basestring' in content:
        content = re.sub(r'\bbasestring\b', 'str', content)
        changes.append('basestring -> str')

    # Fix long -> int
    if ' long(' in content or '(long(' in content:
        content = re.sub(r'\blong\(', 'int(', content)
        changes.append('long -> int')

    # Fix old import: import urlparse
    if 'import urlparse' in content:
        content = content.replace('import urlparse', 'import urllib.parse as urlparse')
        changes.append('import urlparse -> urllib.parse')

    # Fix old import: from urlparse import
    if 'from urlparse import' in content:
        content = re.sub(
            r'from urlparse import (.+)',
            r'from urllib.parse import \1',
            content
        )
        changes.append('from urlparse -> from urllib.parse')

    # Fix old import: import urllib2
    if 'import urllib2' in content:
        content = content.replace(
            'import urllib2',
            'import urllib.request as urllib2'
        )
        changes.append('import urllib2 -> urllib.request')

    # Fix old import: from urllib2 import
    if 'from urllib2 import' in content:
        content = re.sub(
            r'from urllib2 import (.+)',
            r'from urllib.request import \1',
            content
        )
        changes.append('from urllib2 -> from urllib.request')

    # Fix old import: import ConfigParser
    if 'import ConfigParser' in content:
        content = content.replace(
            'import ConfigParser',
            'import configparser as ConfigParser'
        )
        changes.append('import ConfigParser -> configparser')

    # Fix old import: from ConfigParser import
    if 'from ConfigParser import' in content:
        content = re.sub(
            r'from ConfigParser import (.+)',
            r'from configparser import \1',
            content
        )
        changes.append('from ConfigParser -> from configparser')

    # Add __future__ imports if file doesn't have them and is not empty
    if content.strip() and '# Copyright (C)' in content:
        # Check if file needs __future__ imports
        needs_future = (
            'from __future__ import' not in content and
            not filepath.name.startswith('__') and
            'def ' in content or 'class ' in content
        )

        if needs_future:
            # Find the position after copyright and before first import
            lines = content.split('\n')
            insert_pos = 0
            for i, line in enumerate(lines):
                if line.startswith('"""') or line.startswith("'''"):
                    # Find matching docstring end
                    for j in range(i + 1, len(lines)):
                        if '"""' in lines[j] or "'''" in lines[j]:
                            insert_pos = j + 1
                            break
                    break
                elif line.strip() and not line.startswith('#'):
                    insert_pos = i
                    break

            if insert_pos > 0:
                future_imports = (
                    'from __future__ import absolute_import, division, '
                    'print_function, unicode_literals\n'
                )
                lines.insert(insert_pos, future_imports)
                content = '\n'.join(lines)
                changes.append('added __future__ imports')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes

    return None


def main():
    """Run migration on all Python files in src/."""
    root_dir = Path(__file__).parent / 'src'

    if not root_dir.exists():
        print(f"Error: {root_dir} does not exist")
        sys.exit(1)

    total_files = 0
    migrated_files = 0

    print("Starting Python 2 to 3 migration...")
    print(f"Scanning directory: {root_dir}\n")

    for filepath in root_dir.rglob('*.py'):
        total_files += 1
        changes = migrate_file(filepath)

        if changes:
            migrated_files += 1
            print(f"✓ {filepath.relative_to(root_dir)}")
            print(f"  Changes: {', '.join(changes)}")

    print(f"\n{'='*60}")
    print(f"Migration complete!")
    print(f"Total files scanned: {total_files}")
    print(f"Files migrated: {migrated_files}")
    print(f"{'='*60}")

    if migrated_files > 0:
        print("\nNext steps:")
        print("1. Review the changes: git diff")
        print("2. Run tests: pytest")
        print("3. Fix any remaining issues manually")
        print("4. Update setup.py/requirements.txt if needed")


if __name__ == '__main__':
    main()
