import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { Jwt, JwtPayload } from "jsonwebtoken";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string) : Promise<string>{
    return await argon2.hash(password)
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean>{
    return await argon2.verify(hash, password)
}

export function makeJWT(userID: string, expiresIn: number, secret: string) : string{

    const payload : payload = {
        iss : "chirpy",
        sub : userID,
        iat : Math.floor(Date.now() / 1000),
        exp : Math.floor(Date.now() / 1000) + expiresIn,
    }

    const token = jwt.sign(payload, secret)

    return token
}

export function validateJWT(tokenString: string, secret: string) : string {
    try{
        const decoded = jwt.verify(tokenString, secret)
        if (typeof(decoded) == "string" || !decoded.sub){
            throw new Error("Invalid Token")
        }
        return decoded.sub;
    }catch(err){
        throw new Error("Invalid token")
    }

}