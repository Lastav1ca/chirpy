import express, { type Express, type Request, type Response } from 'express';
import { middlewareLogResponses } from './middleware.js';

const app: Express = express();
const port = 8080;

app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/healthz", handlerReadiness);

function handlerReadiness(req : Request, res : Response){
    res.set('Content-Type', 'text/plain');
    res.status(200)
    res.send('OK')
}

