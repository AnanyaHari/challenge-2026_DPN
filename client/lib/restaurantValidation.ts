//import error class so they can be converted into correct responses
import { ApiError } from '@/lib/errors';
// fields accepted when adding restaurnt (if no val, default of null)
export type RestaurantInput = {
  name: string;
  cuisine: string | null;
  address: string | null;
  rating: number | null;
};
//validate optional stuff (cusine or address)
function optionalString(value: unknown, field: string): string | null {
  //missing and null vals will stay null
    if (value === undefined || value === null) {
    return null;
  }
//can't be anything that is not a string - or else erorr is thrown
  if (typeof value !== 'string') {
    throw new ApiError(400, `${field} must be a string or null`);
  }

  //return whitespace
  const trimmed = value.trim();

  //error for any strings that are empty or whitespace
  if (trimmed.length === 0) {
    throw new ApiError(400, `${field} cannot be empty`);
  }
//return final cleaned up string
  return trimmed;
}

//validate json body used by post and put; unknown parameter bc need to check first
export function validateRestaurantBody(body: unknown): RestaurantInput {
  //throw error if not a normal json object
    if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }


  const data = body as Record<string, unknown>;

  //validate property values
  //name must be non-empty
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new ApiError(400, 'name is required and must be a nonempty string');
  }

  //rating needs to be bwtn 0 and 5 if it exists
  if (
    data.rating !== undefined &&
    data.rating !== null &&
    (
      typeof data.rating !== 'number' ||
      !Number.isFinite(data.rating) ||
      data.rating < 0 ||
      data.rating > 5
    )
  ) {
    throw new ApiError(400, 'rating must be a number between 0 and 5, or null');
  }

  //return validated restaurant object
  return {
    name: data.name.trim(),
    cuisine: optionalString(data.cuisine, 'cuisine'),
    address: optionalString(data.address, 'address'),
    rating: data.rating === undefined ? null : data.rating as number | null,
  };
}

//convert id to resturant
export function validateRestaurantId(value: string): number {
  //convert string to number
    const id = Number(value);
//must be pos ints or else error
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(404, 'Restaurant not found');
  }
//return validated id
  return id;
}