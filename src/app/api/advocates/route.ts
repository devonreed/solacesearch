import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, and, sql, gte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('q') || '';
  const minYears = parseInt(searchParams.get('minYears') || "0");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const offset = (page - 1) * pageSize;

  const whereClauses = [];
  if (searchTerm) {
    whereClauses.push(
      or(
        ilike(advocates.firstName, `%${searchTerm}%`),
        ilike(advocates.lastName, `%${searchTerm}%`),
        ilike(advocates.city, `%${searchTerm}%`),
        ilike(advocates.degree, `%${searchTerm}%`),
        ilike(sql`${advocates.phoneNumber}::text`, `%${searchTerm}%`),
        ilike(sql`${advocates.specialties}::text`, `%${searchTerm}%`)
      )
    );
  }
  if (minYears > 0) {
    whereClauses.push(gte(advocates.yearsOfExperience, minYears));
  }

  const data = await db
    .select()
    .from(advocates)
    .where(and(...whereClauses))
    .limit(pageSize)
    .offset(offset);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(advocates)
    .where(and(...whereClauses))
    .then((res) => res[0]?.count ?? 0);

  return Response.json({
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
