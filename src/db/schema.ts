import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id : uuid("id").primaryKey().defaultRandom(),
    created_at : timestamp("created_at").notNull().defaultNow(),
    updated_at : timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email : varchar("email", {length : 256}).unique().notNull(),
});

export type NewUser = typeof users.$inferInsert;

