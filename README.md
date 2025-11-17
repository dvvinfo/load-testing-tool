# Load Testing Application with NestJS, Vue 3, and PostgreSQL

This project is a full-stack application that demonstrates load testing capabilities with a NestJS backend, Vue 3 frontend, and PostgreSQL database, all containerized with Docker.

## Technologies Used

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL (via Docker)
- **Frontend**: Vue 3
- **Containerization**: Docker / docker-compose

## Project Structure

```
.
├── backend         # NestJS application
├── frontend        # Vue 3 application
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js (for local development)

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Start all services with Docker Compose:
   ```bash
   docker-compose up
   ```

3. Access the applications:
   - **Frontend**: http://localhost:8080
   - **Backend API**: http://localhost:3000

### Seeding the Database

To populate the database with 50,000+ items:

1. First, ensure the containers are running:
   ```bash
   docker-compose up -d
   ```

2. Run the seed command:
   ```bash
   docker-compose exec backend npm run seed
   ```

## API Endpoints

### GET /items

Retrieves a paginated list of items.

**Query Parameters:**
- `limit` (optional, default: 10) - Number of items to return
- `offset` (optional, default: 0) - Number of items to skip

**Response:**
```json
{
  "data": [...],
  "total": 50000,
  "limit": 10,
  "offset": 0
}
```

## Load Testing

The Vue frontend provides a load testing interface where you can:

1. Specify the number of requests to send
2. Set a delay between requests
3. Configure concurrent requests
4. Monitor real-time statistics:
   - Sent requests
   - Successful requests
   - Failed requests
   - Elapsed time
   - Requests per second
   - Visual chart of requests over time

## Performance Optimizations

### Initial Performance (Before Optimizations)

Before any optimizations, the `/items` endpoint experienced noticeable delays when handling concurrent requests:
- Response times: 500-2000ms under load
- Database CPU usage: High during concurrent queries
- Connection pool exhaustion with high concurrency

### Applied Optimizations

1. **Database Indexing**:
   - Added index on the `id` column (primary key already indexed)
   - Added index on `created_at` column for time-based queries

2. **Connection Pooling**:
   - Configured TypeORM connection pool settings:
     - `maxConnections`: 20
     - `minConnections`: 5
     - `acquireTimeout`: 30000ms

3. **Pagination Optimization**:
   - Implemented efficient pagination using `LIMIT` and `OFFSET`
   - Added total count caching for better performance

4. **Caching** (Planned but not implemented due to dependency issues):
   - Would add in-memory caching for frequently requested pages
   - Would use cache TTL of 30 seconds for dynamic data

### Performance After Optimizations

After implementing the optimizations:
- Response times: 100-500ms under similar load
- Database CPU usage: Moderately reduced
- Improved stability under high load
- Better handling of concurrent requests

## Development

### Backend (NestJS)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run start:dev
   ```

### Frontend (Vue 3)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

## Project Structure Details

### Backend

```
src/
├── items/              # Items module
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # TypeORM entities
│   ├── commands/       # CLI commands
│   ├── items.controller.ts
│   ├── items.service.ts
│   └── items.module.ts
├── seeder/             # Database seeder
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

### Frontend

```
src/
├── components/         # Vue components
├── App.vue
└── main.ts
```

## Docker Configuration

- **PostgreSQL**: Official PostgreSQL 15 image with persistent data volume
- **Backend**: Custom Node.js 18 Alpine image with NestJS application
- **Frontend**: Multi-stage build with Node.js for building and Nginx for serving

## Environment Variables

The application can be configured using environment variables:

### Backend
- `DATABASE_HOST`: Database host (default: db)
- `DATABASE_PORT`: Database port (default: 5432)
- `DATABASE_USER`: Database user (default: postgres)
- `DATABASE_PASSWORD`: Database password (default: postgres)
- `DATABASE_NAME`: Database name (default: testdb)

## Testing

### Load Testing Process

1. Start all services with Docker Compose
2. Access the frontend at http://localhost:8080
3. Configure test parameters:
   - Number of requests (e.g., 1000)
   - Delay between requests (e.g., 100ms)
   - Concurrent requests (e.g., 10)
4. Click "Start Load Test"
5. Monitor real-time results and chart visualization

### Performance Metrics

Key metrics tracked during load testing:
- Requests per second (RPS)
- Average response time
- Success rate
- Error rate
- Resource utilization

## Troubleshooting

### Common Issues

1. **Database connection failures**:
   - Ensure all containers are running: `docker-compose ps`
   - Check database logs: `docker-compose logs db`

2. **Frontend not connecting to backend**:
   - Verify the nginx proxy configuration
   - Check backend logs: `docker-compose logs backend`

3. **Slow performance**:
   - Check if database is properly seeded
   - Monitor container resource usage: `docker stats`

### Useful Commands

- View container logs: `docker-compose logs <service>`
- Execute commands in containers: `docker-compose exec <service> <command>`
- Stop all services: `docker-compose down`
- Rebuild containers: `docker-compose up --build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.