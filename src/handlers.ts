import express, { NextFunction, type Express, type Request, type Response } from 'express';
import { middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';
import { error } from 'node:console';
import { createUser, deleteAllUsers, getUserByEmail } from './db/queries/users.js';
import { createChirp, getAllChirps, getChirp } from './db/queries/chirps.js';
import { NewUser } from './db/schema.js';
import { checkPasswordHash, hashPassword } from './auth.js';


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
      <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
    </body>
  </html>`)
}

export async function handlerRequestsNumReset(req : Request, res : Response){
    if (config.api.platform !== "dev"){
        return res.status(403).json({error : "Forbidden"});
    }

    await deleteAllUsers();
    config.api.fileserverHits = 0;
    res.status(200)
    res.send('Counter reset.')
}

export async function handlerCreateUser(req : Request, res : Response) {
    try {
        const {email, password} = req.body;

        if (!email || typeof(email) !== "string"){
            return res.status(400).json({error : "Missing or invalid email"})
        }

        if (!password || typeof(password) !== "string"){
            return res.status(400).json({error : "Missing or invalid password"})
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await createUser({email, hashedPassword})

        if (!newUser){
            return res.status(400).json({error : "User with this email already exists"})
        }

        const { hashedPassword: _, ...userInfo } = newUser;

        return res.status(201).json(userInfo)
    }catch(error){
        return res.status(500).json({error : "Could not create user"})
    }
}

export async function handlerCreateChirp(req : Request, res : Response, next : NextFunction){
    type parameters = {
        body : string;
        userId : string;
    };

    let cleanedBody = "";

    try {
            const params: parameters = req.body;

        // Checking chirp length
        if (params.body.length > 140) {
            throw new Error("Chirp is too long");
            //return res.status(400).json({error : "Something went wrong"});
        } 

        const profaneWords = ["kerfuffle", "sharbert", "fornax"];

        // Cleaning profane words
        cleanedBody = params.body
            .split(" ")
            .map((word) => {

                if (profaneWords.includes(word.toLowerCase())) {
                    return "****";
                }
                return word
            })
            .join(" ");

        const newChirp = await createChirp({body : cleanedBody, userId: params.userId})

        if (!newChirp){
            return res.status(400).json({error : "User with this id doenst exist! Chirp not created."})
        }

        return res.status(201).json(newChirp)
    } catch (err) {
        next(err);
    }


}

export async function handlerGetAllChirps(req : Request, res : Response, next : NextFunction){
    const chirps = await getAllChirps()

    return res.status(200).json(chirps);
}

export async function handlerGetChirp(req : Request, res : Response){
    const chirpId = String(req.params.chirpId);

    const chirp = await getChirp(chirpId)

    if (!chirp){
        return res.status(404).json({error : "Chirp not found (invalid id)."});
    }

    return res.status(200).json(chirp);
}

export async function handlerLogin(req : Request, res : Response){
    const user = await getUserByEmail(req.body.email)

    if (!user){
        return res.status(401).json({error: "Invalid email/password"})
    }

    if (!await checkPasswordHash(req.body.password, user.hashedPassword)){
        return res.status(401).json({error: "Invalid email/password"})
    }

    const { hashedPassword: _, ...userInfo } = user;
    
    return res.status(200).json(userInfo)
}