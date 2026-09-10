import express, { type Express, type Request, type Response } from 'express';
import { middlewareErrors, middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';
import { handlerCreateChirp, handlerCreateUser, handlerReadiness, handlerRequestsNum, handlerRequestsNumReset } from './handlers.js';

import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app: Express = express();
const port = 8080;

app.use(express.json())

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.get("/admin/metrics", handlerRequestsNum);

app.post("/api/users", handlerCreateUser);

app.post("/admin/reset", handlerRequestsNumReset);

app.post("/api/chirps", handlerCreateChirp);

app.get("/api/healthz", handlerReadiness);

app.use(middlewareErrors);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});





