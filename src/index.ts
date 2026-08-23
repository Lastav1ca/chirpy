import express, { type Express, type Request, type Response } from 'express';
import { middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';
import { handlerReadiness, handlerRequestsNum, handlerRequestsNumReset, handlerValidateChirp } from './handlers.js';

const app: Express = express();
const port = 8080;

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.post("/admin/metrics", handlerRequestsNum);

app.use("/admin/reset", handlerRequestsNumReset);

app.post('/api/validate_chirp', handlerValidateChirp);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


app.get("/api/healthz", handlerReadiness);


