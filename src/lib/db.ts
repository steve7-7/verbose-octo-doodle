import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
};

const supabase =
  globalForSupabase.supabase ??
  (supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : undefined);

if (supabase && process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;

const client = () => {
  if (!supabase) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return supabase;
};

const tableNames: Record<string, string> = {
  user: "users",
  prediction: "predictions",
  subscription: "subscriptions",
  betSlip: "bet_slips",
  activityLog: "activity_logs",
  follow: "follows",
  passwordReset: "password_resets",
};

const columnNames: Record<string, string> = {
  passwordHash: "password_hash",
  avatarColor: "avatar_color",
  planExpiresAt: "plan_expires_at",
  referralCode: "referral_code",
  referredBy: "referred_by",
  createdAt: "created_at",
  leagueIcon: "league_icon",
  kickoffAt: "kickoff_at",
  isPremium: "is_premium",
  scoreHome: "score_home",
  scoreAway: "score_away",
  predictionIds: "prediction_ids",
  updatedAt: "updated_at",
  userId: "user_id",
  followerId: "follower_id",
  followeeId: "followee_id",
  detail: "detail",
  expiresAt: "expires_at",
  usedAt: "used_at",
  paidAt: "paid_at",
};

const toColumn = (key: string) => columnNames[key] ?? key;
const dateFields = new Set(["createdAt", "updatedAt", "kickoffAt", "planExpiresAt", "paidAt", "expiresAt", "usedAt"]);
const toRow = (row: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const camelKey = Object.entries(columnNames).find(([, column]) => column === key)?.[0] ?? key;
      return [camelKey, dateFields.has(camelKey) && value ? new Date(value as string) : value];
    }),
  );
const toColumns = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [toColumn(key), value]));

function applyWhere(query: any, where: Record<string, any> = {}) {
  for (const [key, value] of Object.entries(where)) {
    const column = toColumn(key);
    if (key === "OR") {
      query = query.or(
        value
          .map((condition: Record<string, Record<string, string>>) => {
            const [field, operator] = Object.entries(condition)[0];
            const [operation, operand] = Object.entries(operator)[0];
            return `${toColumn(field)}.${operation === "contains" ? "ilike" : operation}.${operation === "contains" ? `%${operand}%` : operand}`;
          })
          .join(","),
      );
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("in" in value) query = query.in(column, value.in);
      else if ("contains" in value) query = query.ilike(column, `%${value.contains}%`);
      else if ("not" in value) query = query.neq(column, value.not);
      else if ("lt" in value) query = query.lt(column, value.lt);
      else query = query.eq(column, value);
    } else {
      query = value === null ? query.is(column, null) : query.eq(column, value);
    }
  }
  return query;
}

function model(table: string): any {
  const tableName = tableNames[table];
  return {
    async findUnique({ where }: { where: Record<string, unknown>; select?: Record<string, boolean> }) {
      let query = applyWhere(client().from(tableName).select("*"), where);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data ? toRow(data) : null;
    },
    async findMany({ where, orderBy, take }: { where?: Record<string, any>; orderBy?: any; take?: number; select?: Record<string, boolean> } = {}) {
      let query = applyWhere(client().from(tableName).select("*"), where);
      if (Array.isArray(orderBy)) orderBy.forEach((order) => { const [field, direction] = Object.entries(order)[0] as [string, string]; query = query.order(toColumn(field), { ascending: direction === "asc" }); });
      else if (orderBy) { const [field, direction] = Object.entries(orderBy)[0] as [string, string]; query = query.order(toColumn(field), { ascending: direction === "asc" }); }
      if (take) query = query.limit(take);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toRow);
    },
    async count({ where }: { where?: Record<string, any> } = {}) {
      const { count, error } = await applyWhere(client().from(tableName).select("*", { count: "exact", head: true }), where);
      if (error) throw error;
      return count ?? 0;
    },
    async create({ data }: { data: Record<string, unknown> }) {
      const { data: row, error } = await client().from(tableName).insert(toColumns(data)).select().single();
      if (error) throw error;
      return toRow(row);
    },
    async createMany({ data }: { data: Record<string, unknown>[] }) {
      const { error } = await client().from(tableName).insert(data.map(toColumns));
      if (error) throw error;
      return { count: data.length };
    },
    async update({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) {
      const { data: row, error } = await applyWhere(client().from(tableName).update(toColumns(data)).select(), where).single();
      if (error) throw error;
      return toRow(row);
    },
    async updateMany({ where, data }: { where?: Record<string, any>; data: Record<string, unknown> }) {
      const { data: rows, error } = await applyWhere(client().from(tableName).update(toColumns(data)).select(), where);
      if (error) throw error;
      return { count: rows?.length ?? 0 };
    },
    async upsert({ where, create, update, data }: { where?: Record<string, unknown>; create?: Record<string, unknown>; update?: Record<string, unknown>; data?: Record<string, unknown> }) {
      const values = data ?? create ?? {};
      const whereKeys = Object.keys(where ?? {});
      const composite = whereKeys.find((key) => key.includes("_"));
      const conflict = composite === "followerId_followeeId"
        ? "follower_id,followee_id"
        : toColumn(whereKeys[0] ?? Object.keys(values)[0]);
      const payload = { ...values, ...(update ?? {}) };
      const { data: row, error } = await client().from(tableName).upsert(toColumns(payload), { onConflict: conflict }).select().single();
      if (error) throw error;
      return toRow(row);
    },
    async delete({ where }: { where: Record<string, unknown> }) {
      const { error } = await applyWhere(client().from(tableName).delete(), where);
      if (error) throw error;
    },
    async deleteMany({ where }: { where?: Record<string, any> } = {}) {
      const { error } = await applyWhere(client().from(tableName).delete(), where);
      if (error) throw error;
    },
    async groupBy({ by, where, _count }: { by: string[]; where?: Record<string, any>; _count?: Record<string, boolean> }) {
      const rows = await (model(table) as any).findMany({ where });
      const countField = Object.keys(_count ?? {})[0] ?? "_all";
      return Object.values(rows.reduce((groups: Record<string, any>, row: any) => {
        const key = by.map((field) => row[field]).join("|");
        groups[key] ??= { ...Object.fromEntries(by.map((field) => [field, row[field]])), _count: { [countField]: 0 } };
        groups[key]._count[countField]++;
        return groups;
      }, {}));
    },
  };
}

export const db = {
  user: model("user"),
  prediction: model("prediction"),
  subscription: model("subscription"),
  betSlip: model("betSlip"),
  activityLog: model("activityLog"),
  follow: model("follow"),
  passwordReset: model("passwordReset"),
  $disconnect: async () => undefined,
};
