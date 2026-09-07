import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { ApiError, handleError } from '@/lib/errors';
import { toVisit } from '@/lib/types';
import { validateVisitBody } from '@/lib/visitValidation';


//code copied from other route functions
export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         "restaurantId",
         date,
         "amountSpent",
         notes,
         created_at AS "createdAt"
       FROM visits
       ORDER BY date DESC, created_at DESC`
    );

    return NextResponse.json(rows.map(toVisit));
  } catch (err) {
    return handleError(err);
  }
}


export async function POST(_req: Request) {
  try {
    const body: unknown = await _req.json();
    const {
      restaurantId,
      date,
      amountSpent,
      notes,
    } = validateVisitBody(body);

    const restaurantResult = await pool.query(
      'SELECT id FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (restaurantResult.rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }

    // new for thisw file - visit info
    const { rows } = await pool.query(
      `INSERT INTO visits (
         "restaurantId",
         date,
         "amountSpent",
         notes
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         "restaurantId",
         date,
         "amountSpent",
         notes,
         created_at AS "createdAt"`,
      [restaurantId, date, amountSpent, notes]
    );

    return NextResponse.json(
      toVisit(rows[0]),
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}