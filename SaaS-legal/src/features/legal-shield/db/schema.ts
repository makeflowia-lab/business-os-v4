import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  jsonb,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { AdapterAccount } from "next-auth/adapters";

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(), // for URL or identification
  domain: varchar("domain", { length: 255 }).unique(),
  branding: jsonb("branding"), // Store colors, logo, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: integer("tenant_id").references(() => tenants.id),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text("password"), // Nullable for social login
  image: text("image"),
  isVerified: boolean("is_verified").default(false).notNull(),
  verifyToken: text("verify_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: text("user_id"), // linked to auth user
  industry: varchar("industry", { length: 255 }).notNull(),
  dataTypes: jsonb("data_types").notNull(), // array of strings
  businessModel: varchar("business_model", { length: 255 }).notNull(),
  paymentProcessor: varchar("payment_processor", { length: 255 }).notNull(),
  userBaseSize: varchar("user_base_size", { length: 50 }).notNull(),
  dataStorage: varchar("data_storage", { length: 255 }).notNull(),
  thirdPartyIntegrations: jsonb("third_party_integrations").notNull(),
  country: varchar("country", { length: 100 }).default('Mexico').notNull(),
  
  riskLevel: varchar("risk_level", { length: 50 }), // ALTO, MEDIO, BAJO
  obligations: jsonb("obligations"), // list of applicable laws
  flowchartData: text("flowchart_data"), // mermaid.js string
  legalSnippets: jsonb("legal_snippets"), // key-value for different templates

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: text("user_id"),
  contractType: varchar("contract_type", { length: 255 }).notNull(), // e.g. "SaaS License"
  clientName: varchar("client_name", { length: 255 }).notNull(),
  taxId: varchar("tax_id", { length: 50 }).notNull(), // RFC en México
  fiscalAddress: text("fiscal_address").notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(), // Nombre legal completo
  content: text("content").notNull(), // The generated contract text
  meta: jsonb("meta"), // Any additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id),
  userId: text("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // link, pdf, documentation
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;

export type RiskLevel = "ALTO" | "MEDIO" | "BAJO";
