# Database Setup with pgAdmin

## 🐳 Docker Services

- **PostgreSQL**: Database server on port 5432
- **pgAdmin**: Web-based database management on port 8080

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# Start only database services
docker-compose up postgres pgadmin -d
```

## 🔗 Access pgAdmin

- **URL**: <http://localhost:8080>
- **Email**: <admin@loveapp.com>
- **Password**: admin123

## 📊 Connect to Database in pgAdmin

1. Open pgAdmin at <http://localhost:8080>
2. Login with credentials above
3. Right-click "Servers" → "Register" → "Server"
4. **General Tab**: Name = "LOVE App DB"
5. **Connection Tab**:
   - **Host name/address**: `postgres`
   - **Port**: `5432`
   - **Maintenance database**: `postgres` (use default first)
   - **Username**: `postgres`
   - **Password**: `password`
6. **Save** - You'll see both `postgres` and `love_app_dev` databases

## 🛠️ Database Commands

```bash
# Stop services
docker-compose down

# Reset database (removes all data)
docker-compose down -v
docker-compose up postgres pgadmin -d
```
