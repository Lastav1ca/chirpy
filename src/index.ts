import express, { type Express, type Request, type Response } from 'express';
import { middlewareErrors, middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';
import { handlerLogin, handlerGetChirp, handlerGetAllChirps, handlerCreateChirp, handlerCreateUser, handlerReadiness, handlerRequestsNum, handlerRequestsNumReset } from './handlers.js';

import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app: Express = express();
const port = 8080;

app.use(express.json())
app.use(middlewareLogResponses);

//admin
app.post("/admin/reset", handlerRequestsNumReset);
app.get("/admin/metrics", handlerRequestsNum);

//users & auth
app.post("/api/users", handlerCreateUser);
app.post("/api/login", handlerLogin)

//chirps
app.get("/api/chirps", handlerGetAllChirps)
app.get("/api/chirps/:chirpId", handlerGetChirp)
app.post("/api/chirps", handlerCreateChirp);

//misc
app.get("/api/healthz", handlerReadiness);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareErrors);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});





