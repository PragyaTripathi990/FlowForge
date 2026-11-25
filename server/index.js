import "./src/config/redis.js";
import express from 'express';
import cors from 'cors';

import userRouter from "./routes/user.route.js";
import chainRouter from "./routes/chain.routes.js";
import executionRouter from "./routes/execution.routes.js";
import chainRunnerRoutes from "./src/routes/chainRunnerRoutes.js"
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const app = express()

// CLIENT_ORIGIN is a comma-separated list of frontend URLs allowed to call the API.
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/users',userRouter )
app.use('/api/chains', chainRouter)
app.use('/api/execute', executionRouter)
app.use('/api', chainRunnerRoutes);
app.use('/api/auth', authRouter)

const PORT = process.env.PORT || 5000

app.get('/healthz', (req, res) => res.json({ ok: true }))

// In production the built frontend (client/dist) is served by this same
// server, so the app and its API share one origin.
const clientDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client', 'dist')
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.get('/', (req,res) =>{
    res.send("Hello world")
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
