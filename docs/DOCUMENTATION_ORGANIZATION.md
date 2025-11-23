# Documentation Organization

This document describes how the project documentation is organized and where to find specific information.

## Documentation Structure

All developer documentation has been consolidated into the `docs/` folder following best practices:

```
docs/
├── README.md                          # Main documentation index
├── DOCUMENTATION_ORGANIZATION.md      # This file
│
├── getting-started/                   # Quick start guides
│   ├── README.md                      # Quick start guide
│   └── PROJECT_OVERVIEW.md            # System overview
│
├── development/                       # Development guides
│   └── README.md                      # Development setup and workflow
│
├── api/                               # API documentation
│   ├── README.md                      # API overview
│   ├── NODE_API.md                    # Node.js API reference
│   └── FLASK_API.md                   # Flask API reference
│
├── database/                          # Database documentation
│   ├── SCHEMA.md                      # Database schema
│   └── MIGRATIONS.md                  # Migration guides
│
├── python-processing/                 # Python service docs
│   ├── README.md                      # Python processing overview
│   ├── BACKGROUND_WORKER.md           # Background worker details
│   ├── BACKGROUND_WORKER_SETUP.md     # Worker setup guide
│   ├── ML_TRAINING.md                 # ML model training guide
│   ├── IMAGE_CAPTURE.md                # Image capture implementation
│   └── ONION_CROP.md                  # Onion crop-specific features
│
├── deployment/                         # Deployment guides
│   ├── README.md                      # Deployment overview
│   ├── NETLIFY.md                     # Netlify deployment
│   ├── NETLIFY_QUICK_START.md         # Quick Netlify setup
│   ├── EC2.md                         # EC2 backend setup
│   ├── S3.md                          # S3 configuration
│   └── QUICK_DEPLOY.md                # Quick deployment guide
│
└── architecture/                      # Architecture documentation
    ├── README.md                      # System architecture
    ├── S3_INTEGRATION.md             # S3 integration details
    └── S3_IMPLEMENTATION.md           # S3 implementation summary
```

## File Organization Rules

### Moved Files

All documentation files have been moved from root and subdirectories into `docs/`:

**From Root:**
- `DEPLOYMENT_GUIDE.md` → `docs/deployment/README.md`
- `NETLIFY_DEPLOYMENT.md` → `docs/deployment/NETLIFY.md`
- `NETLIFY_QUICK_START.md` → `docs/deployment/NETLIFY_QUICK_START.md`
- `EC2_BACKEND_SETUP.md` → `docs/deployment/EC2.md`
- `QUICK_DEPLOY.md` → `docs/deployment/QUICK_DEPLOY.md`
- `S3_SETUP.md` → `docs/deployment/S3.md`
- `S3_INTEGRATION_GUIDE.md` → `docs/architecture/S3_INTEGRATION.md`
- `S3_IMPLEMENTATION_SUMMARY.md` → `docs/architecture/S3_IMPLEMENTATION.md`
- `BACKGROUND_WORKER_IMPLEMENTATION.md` → `docs/python-processing/BACKGROUND_WORKER.md`

**From python_processing/:**
- `BACKGROUND_WORKER_SETUP.md` → `docs/python-processing/BACKGROUND_WORKER_SETUP.md`
- `ONION_CROP_UPDATES.md` → `docs/python-processing/ONION_CROP.md`
- `docs/image_capture_guide.md` → `docs/python-processing/IMAGE_CAPTURE.md`

**From server/database/:**
- `SCHEMA_OVERVIEW.md` → `docs/database/SCHEMA.md`

### Kept in Place

These files remain in their original locations:
- `README.md` (root) - Main project README
- `python_processing/README.md` - Python service quick reference
- `server/database/schema.sql` - Database schema SQL file
- `python_processing/database_migration_add_gndvi.sql` - Migration SQL

## Documentation Standards

### File Naming
- Use `README.md` for main index files in each directory
- Use `UPPERCASE_WITH_UNDERSCORES.md` for specific topic files
- Use descriptive names that indicate content

### Structure
- Each directory has a `README.md` that serves as an index
- Related documents are grouped in subdirectories
- Cross-references use relative paths

### Content Standards
- Clear headings and sections
- Code examples with syntax highlighting
- Step-by-step instructions for procedures
- Cross-references to related documents
- Table of contents for long documents

## Finding Documentation

### Quick Start
- New to the project? → `docs/getting-started/README.md`
- Want system overview? → `docs/getting-started/PROJECT_OVERVIEW.md`

### Development
- Setting up dev environment? → `docs/development/README.md`
- Working on Python processing? → `docs/python-processing/README.md`
- Need API details? → `docs/api/README.md`

### Deployment
- Deploying to production? → `docs/deployment/README.md`
- Netlify deployment? → `docs/deployment/NETLIFY.md`
- EC2 setup? → `docs/deployment/EC2.md`

### Reference
- Database schema? → `docs/database/SCHEMA.md`
- API endpoints? → `docs/api/`
- Architecture? → `docs/architecture/README.md`

## Updating Documentation

When adding new documentation:

1. **Place in appropriate directory**
   - Setup guides → `getting-started/` or `development/`
   - API docs → `api/`
   - Deployment → `deployment/`
   - Architecture → `architecture/`

2. **Update index files**
   - Add link to new doc in relevant `README.md`
   - Update main `docs/README.md` if needed

3. **Follow naming conventions**
   - Use descriptive names
   - Follow existing patterns

4. **Add cross-references**
   - Link to related documents
   - Update related docs to link back

## Benefits of This Organization

✅ **Centralized** - All docs in one place  
✅ **Organized** - Logical grouping by topic  
✅ **Discoverable** - Easy to find what you need  
✅ **Maintainable** - Clear structure for updates  
✅ **Professional** - Follows industry best practices  

## Related

- [Main Documentation Index](./README.md)
- [Project README](../README.md)

