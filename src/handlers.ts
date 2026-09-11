import express, { NextFunction, type Express, type Request, type Response } from 'express';
import { middlewareLogResponses, middlewareMetricsInc } from './middleware.js';
import { config } from './config.js';
import { error } from 'node:console';
import { createUser, deleteAllUsers, getUserByEmail, updateUser } from './db/queries/users.js';
import { createChirp, getAllChirps, getChirp } from './db/queries/chirps.js';
import { NewUser } from './db/schema.js';
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from './auth.js';
import { createToken, getUserFromRefreshToken, revokeToken } from './db/queries/refresh_tokens.js';


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
    };

    let cleanedBody = "";

    try {

        const token = getBearerToken(req)
        const decoded = validateJWT(token, config.jwtSecret)

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

        const newChirp = await createChirp({body : cleanedBody, userId: decoded})

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
    
    const token = makeJWT(user.id, 3600, config.jwtSecret)

    const refreshToken = makeRefreshToken();
    await createToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({ ...userInfo, token, refreshToken})
}

export async function handlerRefresh(req : Request, res : Response){
    let token = getBearerToken(req)

    const user = await getUserFromRefreshToken(token)

    if (!user){
        return res.status(401).json({error: "Invalid user"})
    }

    token = makeJWT(user.id, 3600, config.jwtSecret)
    return res.status(200).json({ token })
}

export async function handlerRevoke(req : Request, res : Response){
    const token = getBearerToken(req)
    await revokeToken(token)
    return res.status(204).send()
}

export async function handlerUpdateInfo(req : Request, res : Response){
    const token = getBearerToken(req)

    const userId = validateJWT(token, config.jwtSecret)

    if (!req.body.email || !req.body.password || typeof(req.body.email) !== "string" || typeof(req.body.password) !== "string"){
        return res.status(400).json("Email or password missing")
    }

    const hashed = await hashPassword(req.body.password)

    const updatedUser = await updateUser(userId, req.body.email, hashed)

    if (!updatedUser) {
        return res.status(401).json({error : "User not found"})
    }

    const { hashedPassword: _, ...userInfo } = updatedUser;

    return res.status(200).json(userInfo)
}