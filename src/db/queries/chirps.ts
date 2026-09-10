import { db } from "../index.js";
import { NewChirp, NewUser, users, chirps } from "../schema.js";

export async function createChirp(chirp : NewChirp){
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .returning();
  return result;
}