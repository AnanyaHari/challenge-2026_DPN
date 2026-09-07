import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { toRestaurant } from '@/lib/types';
import { ApiError, handleError} from '@/lib/errors';
import {
  validateRestaurantBody,
  validateRestaurantId,
} from '@/lib/restaurantValidation';
type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id
 * Returns a single restaurant, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = validateRestaurantId(params.id);
    const { rows } = await pool.query(
  `SELECT
     id,
     name,
     cuisine,
     address,
     rating,
     created_at AS "createdAt"
   FROM restaurants
   WHERE id = $1`,
  [id]
);

    if (rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }


    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/restaurants/:id
 * Update an existing restaurant.
 *
 * TODO (A2): implement. Update the row matching :id and return the updated
 * record (or 404 if it doesn't exist). Validate the body the same way POST does.
 */
export async function PUT(_req: Request, _ctx: Params) { 
  try {
    //gets id and validates
    const id = validateRestaurantId(_ctx.params.id);
    //reads and validates json
    const body: unknown = await _req.json();
    const { name, cuisine, address, rating } =
      validateRestaurantBody(body);

      //uodates resturant whos id matches the url
    const { rows } = await pool.query(
      `UPDATE restaurants
       SET name = $1,
           cuisine = $2,
           address = $3,
           rating = $4
       WHERE id = $5
       RETURNING
         id,
         name,
         cuisine,
         address,
         rating,
         created_at AS "createdAt"`,
      [name, cuisine, address, rating, id]
    );
    //if no rest exists, then erorr
    if (rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }
    //converts to response shape, catches any errors
    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/restaurants/:id
 * Delete a restaurant.
 *
 * TODO (A2): implement. Delete the row matching :id and return 204 (or 404
 * if it doesn't exist).
 *
 * Worth noticing: the migration already made a call about what happens to that
 * restaurant's visits. Go read it. If you disagree with it, say so in your
 * write-up.
 */
//deletes a rest adn returns 204
export async function DELETE(_req: Request, _ctx: Params) {
  try {
    //gets if and validates
      const id = validateRestaurantId(_ctx.params.id);
    const { rows } = await pool.query(
      //deletes restaurant w matching id
      `DELETE FROM restaurants
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    //error if no matchinf rest
    if (rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }

    //returns 204 if all good
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
