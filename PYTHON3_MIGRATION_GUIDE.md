# Python 3 Migration Guide for GGRC-Core

This document outlines the migration strategy from Python 2.7 to Python 3.9+ for the GGRC-Core project.

## Migration Status

### ✅ Completed
- [x] Compatibility assessment across codebase
- [x] Updated requirements.txt for Python 3
- [x] Updated requirements-dev.txt for Python 3
- [x] Updated requirements-selenium.txt for Python 3
- [x] Created automated migration script
- [x] Migrated sample file (src/ggrc/converters/base_block.py)

### 🚧 In Progress
- [ ] Run automated migration on all core modules
- [ ] Fix Python 3 compatibility issues
- [ ] Update test suite
- [ ] Verify application functionality

## Compatibility Assessment Results

| Issue Type | Occurrences | Files Affected | Severity |
|------------|-------------|----------------|----------|
| Print statements | 48 | 15 files | Medium |
| Dict iteration methods (.iteritems/.iterkeys/.itervalues) | 167 | 65 files | High |
| xrange() usage | 19 | 14 files | Low |
| unicode() calls | 85 | 25 files | High |
| Old stdlib imports (urlparse, urllib2, ConfigParser) | 8 | 8 files | Medium |
| basestring/long types | 40 | 25 files | Medium |
| Missing __future__ imports | ~900 files | Most files | Critical |

**Total affected files: ~150-200 files requiring changes**

## Key Dependency Updates

### Core Dependencies
| Package | Old Version | New Version | Notes |
|---------|-------------|-------------|-------|
| Python | 2.7 | 3.9+ | **Critical** |
| Flask | 0.10.1 | 3.0.0 | Major API changes |
| SQLAlchemy | 0.9.8 | 2.0.23 | Significant migration required |
| Werkzeug | 0.12.2 | 3.0.1 | Bundled with Flask |
| bleach | 1.2.2 | 6.1.0 | Security critical |
| requests | 2.8.1 | 2.31.0 | Security updates |

### Testing Dependencies
| Package | Old Version | New Version | Notes |
|---------|-------------|-------------|-------|
| pytest | 3.2.1 | 7.4.3 | nose → pytest migration |
| selenium | 2.47.3 | 4.15.2 | WebDriver W3C protocol |
| pylint | 1.7.1 | 3.0.3 | Updated linting rules |

### Removed Dependencies (Built into Python 3)
- `enum34` - Built into Python 3.4+
- `argparse` - Built into Python 3.2+
- `mock` - Use `unittest.mock` from stdlib
- `wsgiref` - Built into Python 3

## Migration Steps

### Step 1: Automated Migration
Run the migration script to fix common Python 2/3 issues:

```bash
python3 migrate_to_python3.py
```

This script automatically fixes:
- `.iteritems()` → `.items()`
- `.iterkeys()` → `.keys()`
- `.itervalues()` → `.values()`
- `xrange()` → `range()`
- `unicode()` → `str()`
- `basestring` → `str`
- `long()` → `int()`
- Old imports (urlparse, urllib2, ConfigParser)

### Step 2: Manual Fixes

Some issues require manual intervention:

#### Print Statements
```python
# Python 2
print "Hello, world!"

# Python 3
print("Hello, world!")
```

#### String/Bytes Handling
```python
# Python 2
data = "hello".encode('utf-8')
# data is str

# Python 3
data = "hello".encode('utf-8')
# data is bytes - handle accordingly
```

#### Division
```python
# Python 2
result = 5 / 2  # Returns 2

# Python 3
result = 5 / 2  # Returns 2.5
result = 5 // 2  # Returns 2 (floor division)
```

#### Exception Handling
```python
# Python 2
except ValueError, e:
    pass

# Python 3
except ValueError as e:
    pass
```

### Step 3: Flask 3.0 Migration

Flask 3.0 has breaking changes:

1. **Import changes:**
```python
# Old
from flask.ext.sqlalchemy import SQLAlchemy

# New
from flask_sqlalchemy import SQLAlchemy
```

2. **Before/After request decorators:**
```python
# Old - returns modified response
@app.after_request
def after(response):
    response.headers['X-Custom'] = 'value'
    return response

# New - same, but stricter about return value
```

3. **JSON handling:**
```python
# Old
return jsonify(data), 200

# New - still works, but response.json is stricter
```

### Step 4: SQLAlchemy 2.0 Migration

Major changes in SQLAlchemy 2.0:

1. **Query API changes:**
```python
# Old style (1.x)
users = session.query(User).filter(User.name == 'john').all()

# New style (2.0)
from sqlalchemy import select
stmt = select(User).where(User.name == 'john')
users = session.execute(stmt).scalars().all()
```

2. **Declarative base:**
```python
# Old
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# New - compatible, but check deprecation warnings
```

### Step 5: Update Docker Configuration

Update Dockerfile to use Python 3:

```dockerfile
FROM python:3.11-slim

# Rest of Dockerfile...
```

### Step 6: Testing

1. **Install dependencies:**
```bash
cd src
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

2. **Run tests:**
```bash
# Run pytest (replacing nose)
pytest test/

# Run specific test files
pytest test/integration/

# Run with coverage
pytest --cov=ggrc --cov-report=html
```

3. **Check for deprecation warnings:**
```bash
python3 -Wd -m pytest test/
```

## Common Issues & Solutions

### Issue: Import errors after migration
**Solution:** Check for renamed stdlib modules:
- `urlparse` → `urllib.parse`
- `urllib2` → `urllib.request`
- `ConfigParser` → `configparser`
- `Queue` → `queue`

### Issue: String encoding errors
**Solution:** Be explicit about bytes vs strings:
```python
# When reading files
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()  # Returns str

with open('file.bin', 'rb') as f:
    content = f.read()  # Returns bytes
```

### Issue: Dictionary iteration errors
**Solution:** In Python 3, `.keys()`, `.values()`, `.items()` return views, not lists:
```python
# If you need a list:
keys_list = list(my_dict.keys())

# But usually views work fine:
for key in my_dict.keys():  # Works in both Python 2 & 3
    pass
```

### Issue: Integer division
**Solution:** Use `//` for floor division, `/` for true division:
```python
# Ensure integer division
result = total // count  # Floor division

# Or use from __future__
from __future__ import division
```

## Testing Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All Selenium tests pass
- [ ] Application starts without errors
- [ ] Database migrations work
- [ ] Import/export functionality works
- [ ] Authentication works
- [ ] API endpoints respond correctly
- [ ] Frontend loads and renders
- [ ] Workflows execute properly
- [ ] Notifications send correctly

## Rollback Plan

If migration fails:

1. **Revert code changes:**
```bash
git reset --hard HEAD~1  # or specific commit
```

2. **Restore old requirements:**
```bash
git checkout HEAD~1 -- src/requirements*.txt
```

3. **Reinstall Python 2.7 environment**

## Timeline Estimate

- **Automated migration:** 1 day
- **Manual fixes:** 3-5 days
- **Flask/SQLAlchemy updates:** 5-7 days
- **Testing and bug fixes:** 7-10 days
- **Total:** 3-4 weeks

## Resources

- [Python 3 Porting Guide](https://docs.python.org/3/howto/pyporting.html)
- [Flask 3.0 Changelog](https://flask.palletsprojects.com/en/3.0.x/changes/)
- [SQLAlchemy 2.0 Migration Guide](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [Conservative Python 3 Porting Guide](https://portingguide.readthedocs.io/)

## Support

For migration issues:
- Check existing GitHub issues
- Review deprecation warnings
- Consult Python 3 porting guide
- Test incrementally

---

**Last Updated:** 2025-12-25
**Migration Started:** 2025-12-25
**Target Completion:** 2026-01-15
