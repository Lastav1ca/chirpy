import express, { type Express, type Request, type Response } from 'express';
import { middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';


export function handlerReadiness(req : Request, res : Response){
    res.set('Content-Type', 'text/plain');
    res.status(200)
    res.send('OK')
}

export function handlerRequestsNum(req : Request, res : Response){
    res.set('Content-Type', 'text/html; charset=utf-8')
    res.status(200)
    res.send(`
  <html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
  </html>`)
}

export function handlerRequestsNumReset(req : Request, res : Response){
    config.fileserverHits = 0;
    res.status(200)
    res.send('Counter reset.')
}

export async function handlerValidateChirp (req : Request, res : Response){
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", () => {
        try{
            const parsedBody = JSON.parse(body)

            if (parsedBody.body.length > 140){

                const respBody = {
                    error : "Something went wrong"
                }

                const respBodyStringified = JSON.stringify(respBody);
                res.status(400).send(respBodyStringified);

            }else{

                const respBody = {
                    "valid" : true
                }

                const respBodyStringified = JSON.stringify(respBody);
                res.status(400).send(respBodyStringified);
            }
        }catch(error){
            res.status(400).send("Invalid JSON")
        }
    });

}
