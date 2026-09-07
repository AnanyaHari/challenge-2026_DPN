import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';
import { validateRestaurantBody } from '@/lib/restaurantValidation';

/**
 * GET /api/restaurants
 * Returns all restaurants.
 */
export async function GET() { // gets restaurants from newest to oldest
  try {
    const { rows } = await pool.query( //get fields needed by api from resturants table
  `SELECT
     id,
     name,
     cuisine,
     address,
     rating,
     created_at AS "createdAt"
   FROM restaurants
   ORDER BY created_at DESC`
);
// convert each sql row to resturant api shape
    return NextResponse.json(rows.map(toRestaurant));
  } catch (err) {
    //handle any errors
    return handleError(err);
  }
}

/**
 * POST /api/restaurants
 * Create a new restaurant.
 *
 * TODO (A2): implement. Read the restaurant fields from the request body,
 * insert a row, and return the created restaurant with a 201 status.
 *
 * TODO (A3): validate before you insert. Nothing validates anything today, so
 * `rating` happily accepts 6. Decide what valid means for each field and reject
 * bad bodies with a 400 rather than letting them reach the database.
 */
export async function POST(_req: Request) { //validates request and creates new resturant 
  try {
    const body = await _req.json(); // convert in to JS val

    //validate fields and set vars = to the input values
    const { name, cuisine, address, rating } = validateRestaurantBody(body);

    //insert into restaurants table
    const { rows } = await pool.query(
      `INSERT INTO restaurants (name, cuisine, address, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         name,
         cuisine,
         address,
         rating,
         created_at AS "createdAt"`,
      [
        //correspond to 1,2,3,and 4
        name,
        cuisine ?? null,
        address ?? null,
        rating ?? null,
      ]
    );
    //database row to response shape; 201 = good
    return NextResponse.json(toRestaurant(rows[0]), { status: 201 });
  } catch (err) {
    //handle errors
    return handleError(err);
  }
}
