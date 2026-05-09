# FlowForge

**DAG-based AI Workflow Orchestration Engine**

Build, manage, and execute AI-driven workflows using a visual node-and-edge chain builder. Each chain is a directed acyclic graph (DAG) where nodes represent processing steps --- LLM calls, input handlers, transformers, or output formatters --- and edges define how data flows between them.

---

## Architecture

```
Client (React + React Query)
        |
        v
Express REST API (JWT + Cookie Auth)
        |
    +---+---+---+
    |       |       |
    v       v       v
Auth    Chains   Execution
Service  CRUD    Engine
    |       |       |
    v       v       v
PostgreSQL      Redis
(Prisma ORM)    (Execution Cache)
                    |
                    v
              Gemini AI (LLM Nodes)
              w/ Exponential Backoff
```

## How the Execution Engine Works

1. **Fetch chain** from PostgreSQL (nodes + edges)
2. **Build adjacency list** from edges
3. **Topological sort (BFS)** to determine execution order --- with cycle detection
4. **Execute each node** in order:
   - Gather outputs from all predecessor nodes (context propagation)
   - Replace `{{variables}}` with runtime inputs
   - For LLM nodes: call Gemini AI with full context + exponential backoff retry
5. **Store results** in Redis with namespaced keys: `execution:{id}:node:{nodeId}`
6. **Return** execution logs with per-node timing, outputs, and error states

## Key Features

| Feature | Details |
|---|---|
| DAG Execution | Topological sort with cycle detection; structured predecessor context propagation |
| Gemini AI Integration | LLM-powered nodes with exponential backoff retry (3 attempts, `2^i * 1000ms`) |
| 4 Node Types | `INPUT` - accept variables, `LLM` - AI processing, `TRANSFORM` - data formatting, `OUTPUT` - final result |
| Variable Interpolation | `{{variableName}}` replaced at runtime from user inputs or upstream node outputs |
| Redis Execution Store | Per-node + final results cached with namespaced keys for retrieval |
| Per-User Isolation | JWT + cookie auth; users can only access and execute their own chains |
| Execution Logging | Per-node timing, success/error states, context tracking |

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **API Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Cache** | Redis (ioredis) |
| **AI** | Google Gemini AI (gemini-2.0-flash) |
| **Auth** | JWT + HTTP-only cookies (bcryptjs) |
| **Frontend** | React, Tailwind CSS, React Query, Axios |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (sets JWT cookie) |
| GET | `/api/auth/me` | Get current user |

### Chains (CRUD)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chains` | Create chain |
| GET | `/api/chains` | List user's chains |
| GET | `/api/chains/:id` | Get chain by ID |
| PUT | `/api/chains/:id` | Update chain |
| DELETE | `/api/chains/:id` | Delete chain |

### Execution
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/run-chain/:chainId` | Execute chain with input values |
| POST | `/api/execute/:chainId` | Execute and cache results in Redis |
| GET | `/api/execute/:executionId` | Retrieve cached execution results |

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Backend
```bash
cd server
npm install
cp .env.example .env  # Add your credentials
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env  # Set VITE_API_URL
npm run dev
```

### Environment Variables
```
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/flowforge
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_key
```

## License

MIT
