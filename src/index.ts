import express, { type Express, type Request, type Response } from 'express';
import { middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';

const app: Express = express();
const port = 8080;

app.use("/app", middlewareMetricsInc)
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.use("/metrics", handlerRequestsNum);

app.use("/reset", handlerRequestsNumReset)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


app.get("/healthz", handlerReadiness);

function handlerReadiness(req : Request, res : Response){
    res.set('Content-Type', 'text/plain');
    res.status(200)
    res.send('OK')
}

function handlerRequestsNum(req : Request, res : Response){
    res.status(200)
    res.send(`Hits: ${config.fileserverHits}`)
}

function handlerRequestsNumReset(req : Request, res : Response){
    config.fileserverHits = 0;
    res.status(200)
    res.send('Counter reset.')
}

