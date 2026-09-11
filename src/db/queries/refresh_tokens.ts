import { db } from "../index.js";
import { asc, desc, and, eq, gt, isNull} from 'drizzle-orm';
import { NewToken, refreshTokens, users } from "../schema.js";

export async function createToken(token: NewToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(token)
    .returning();
  return result;
}

export async function getUserFromRefreshToken(token : string) {
    const [result] = await db
    .select({user : users})
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(
        and(
            eq(refreshTokens.token, token),
            gt(refreshTokens.expiresAt, new Date()),
            isNull(refreshTokens.revokedAt),
        ),
    );
    return result?.user;    
} 

export async function revokeToken(token : string){
    const [result] = await db
        .update(refreshTokens)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(refreshTokens.token, token))
        .returning();
    return result;
}