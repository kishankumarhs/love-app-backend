# CI/CD Setup Guide

This repository includes comprehensive CI/CD pipelines using GitHub Actions.

## Workflows

### 1. **CI (Continuous Integration)** - `.github/workflows/ci.yml`

Runs on every push and pull request to validate code quality.

**Steps:**

- Linting with ESLint
- Unit tests with coverage
- E2E tests
- Build validation
- Docker image build (on main/develop branches)

**Triggers:** Push to any branch, PRs to main/develop

---

### 2. **CD (Continuous Deployment)** - `.github/workflows/cd.yml`

Deploys to production environment.

**Steps:**

- Build application
- Deploy via SSH or Docker
- Run database migrations
- Restart PM2 process or Docker containers

**Triggers:** Push to `main` branch, manual trigger, version tags

---

### 3. **Staging Deployment** - `.github/workflows/staging.yml`

Deploys to staging environment for testing.

**Steps:**

- Run tests
- Build application
- Deploy to staging server

**Triggers:** Push to `develop` branch, manual trigger

---

### 4. **CodeQL Security Scan** - `.github/workflows/codeql.yml`

Automated security vulnerability scanning.

**Triggers:** Push/PR to main/develop, weekly schedule

---

### 5. **Dependabot** - `.github/dependabot.yml`

Automated dependency updates for npm, GitHub Actions, and Docker.

---

## Required GitHub Secrets

To enable full CI/CD functionality, configure these secrets in your GitHub repository:

### Docker Hub

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

### Production Deployment

- `DEPLOY_HOST` - Production server hostname/IP
- `DEPLOY_USER` - SSH username for production server
- `DEPLOY_KEY` - SSH private key for authentication
- `DEPLOY_PATH` - Deployment directory path on production server

### Staging Deployment

- `STAGING_HOST` - Staging server hostname/IP
- `STAGING_USER` - SSH username for staging server
- `STAGING_KEY` - SSH private key for authentication
- `STAGING_PATH` - Deployment directory path on staging server

---

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

---

## Environment Setup

### Production Environment

1. Configure in GitHub: **Settings** → **Environments** → **New environment** → `production`
2. Add protection rules (e.g., required reviewers)
3. Add environment-specific secrets if needed

### Staging Environment

1. Create environment named `staging`
2. Configure with less restrictive rules for faster deployments

---

## Manual Deployment

You can trigger deployments manually:

1. Go to **Actions** tab
2. Select the workflow (CD or Staging)
3. Click **Run workflow**
4. Select branch and click **Run workflow**

---

## Workflow Status Badges

Add these badges to your README to display build status:

```markdown
![CI](https://github.com/kishankumarhs/love-app-backend/workflows/CI/badge.svg)
![CD](https://github.com/kishankumarhs/love-app-backend/workflows/CD%20-%20Deploy%20to%20Production/badge.svg)
![CodeQL](https://github.com/kishankumarhs/love-app-backend/workflows/CodeQL%20Security%20Scan/badge.svg)
```

---

## Server Prerequisites

### Production/Staging Server Requirements

- Node.js 20.x installed
- PM2 process manager: `npm install -g pm2`
- PostgreSQL database running
- SSH access configured
- Docker & Docker Compose (for Docker deployment)

### Initial Server Setup

```bash
# Install PM2
npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Create deployment directory
mkdir -p /var/www/love-app-backend
```

---

## Deployment Methods

### Method 1: SSH Deployment

Copies built files to server and restarts PM2 process.

### Method 2: Docker Deployment

Pulls latest Docker image and restarts containers using docker-compose.

Choose your preferred method by:

- Using the appropriate job in the CD workflow
- Commenting out the unused deployment method

---

## Monitoring Deployments

### View Logs

```bash
# PM2 logs
pm2 logs love-app-backend

# Docker logs
docker-compose logs -f backend
```

### Check Status

```bash
# PM2 status
pm2 status

# Docker status
docker-compose ps
```

---

## Rollback

### PM2 Deployment

```bash
# Connect to server
ssh user@server

# Switch to deployment directory
cd /var/www/love-app-backend

# Restore previous version from backup
tar -xzf backup-previous.tar.gz
pm2 restart love-app-backend
```

### Docker Deployment

```bash
# Use previous image tag
docker pull username/love-app-backend:previous-sha
docker-compose up -d --force-recreate
```

---

## Troubleshooting

### CI Failures

- Check test logs in GitHub Actions
- Ensure all environment variables are set
- Verify database connection in tests

### Deployment Failures

- Verify SSH keys are correct and have proper permissions
- Check server disk space: `df -h`
- Verify deployment path exists and has write permissions
- Check PM2 or Docker logs for runtime errors

### Docker Build Failures

- Verify Dockerfile syntax
- Check Docker Hub credentials
- Ensure all dependencies are listed in package.json

---

## Best Practices

1. **Branch Strategy**
   - `main` → Production
   - `develop` → Staging
   - `feature/*` → CI only (no deployment)

2. **Testing**
   - Always write tests for new features
   - Maintain >80% code coverage
   - Run tests locally before pushing

3. **Security**
   - Rotate secrets regularly
   - Use environment-specific secrets
   - Enable branch protection rules
   - Review Dependabot PRs promptly

4. **Monitoring**
   - Set up application monitoring (e.g., Datadog, New Relic)
   - Configure error tracking (e.g., Sentry)
   - Monitor server resources

---

## Additional Configuration

### Enable Branch Protection

1. Go to **Settings** → **Branches**
2. Add rule for `main` and `develop`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass (CI workflow)
   - Require branches to be up to date

### Notifications

Configure Slack/Discord notifications by adding webhook steps to workflows.

---

## Support

For issues with CI/CD pipelines:

1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Contact the DevOps team
