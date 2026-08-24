import express, { NextFunction, type Express, type Request, type Response } from 'express';
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

export async function handlerValidateChirp (req : Request, res : Response, next : NextFunction){
    type parameters = {
        body : string;
    };

    try {
            const params: parameters = req.body;

            // Checking chirp length
            if (params.body.length > 140) {
                throw new Error("Chirp is too long");
                //return res.status(400).json({error : "Something went wrong"});
            } 

            const profaneWords = ["kerfuffle", "sharbert", "fornax"];

            // Cleaning profane words
            const cleanedBody = params.body
                .split("")
                .map((word) => {

                    if (profaneWords.includes(word.toLowerCase())) {
                        return "****";
                    }
                    return word
                })
                .join(" ");

            return res.status(200).json({cleanedBody});

        } catch (err) {
            next(err);
        }

}
