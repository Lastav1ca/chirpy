import { NextFunction, Request, Response  } from "express";
import { config } from "./config.js";

export const middlewareLogResponses = (req : Request, res : Response, next : NextFunction) : void => {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode != 200){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`)
        }
    });
    
    next()
};

export const middlewareMetricsInc = (req : Request, res : Response, next : NextFunction) : void => {
    res.on("finish", () => {
        config.api.fileserverHits++;
    });
    
    next()
};

export const middlewareErrors = (err : Error, req : Request, res : Response, next : NextFunction) : void => {

    console.error(err);
    res.status(500).json({
        error : "Something went wrong on our end"
    })

}