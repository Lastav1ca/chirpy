import express, { type Express, type Request, type Response } from 'express';
import { middlewareErrors, middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';
import { handlerCreateUser, handlerReadiness, handlerRequestsNum, handlerRequestsNumReset, handlerValidateChirp } from './handlers.js';

const app: Express = express();
const port = 8080;

app.use(express.json())

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.post("/admin/metrics", handlerRequestsNum);

app.post("/api/users", handlerCreateUser);

app.use("/admin/reset", handlerRequestsNumReset);

app.post('/api/validate_chirp', handlerValidateChirp);

app.get("/api/healthz", handlerReadiness);

app.use(middlewareErrors);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});





