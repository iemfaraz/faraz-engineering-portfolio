import {sqliteTable,text,integer,index,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{
 id:text('id').primaryKey(),kind:text('kind').notNull(),data:text('data').notNull(),
 slug:text('slug'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('records_kind_idx').on(t.kind),uniqueIndex('records_slug_idx').on(t.kind,t.slug)]);
export const files=sqliteTable('files',{
 id:text('id').primaryKey(),name:text('name').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),createdAt:text('created_at').notNull(),
});
export const limits=sqliteTable('rate_limits',{
 key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull(),
});

export const recommendationSubmissions=sqliteTable('recommendation_submissions',{
 id:text('id').primaryKey(),data:text('data').notNull(),status:text('status').notNull().default('pending'),notes:text('notes').notNull().default(''),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),reviewedAt:text('reviewed_at'),
},t=>[index('recommendation_status_created_idx').on(t.status,t.createdAt)]);
