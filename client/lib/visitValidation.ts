import { ApiError } from '@/lib/errors';


 // fields needed to create a visit.
export type VisitInput = {
  restaurantId: number;
  date: string;
  amountSpent: number | null;
  notes: string | null;
};


 // validate body.

export function validateVisitBody(body: unknown): VisitInput {
  // the request body must be a JSON object.
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }

  const data = body as Record<string, unknown>;

  // the restaurant ID must be a positive whole number.
  if (
    typeof data.restaurantId !== 'number' ||
    !Number.isInteger(data.restaurantId) ||
    data.restaurantId <= 0
  ) {
    throw new ApiError(
      400,
      'restaurantId must be a positive integer'
    );
  }

  // require a date written as YYYY-MM-DD.
  if (
    typeof data.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
  ) {
    throw new ApiError(
      400,
      'date must use the YYYY-MM-DD format'
    );
  }

  // ensure the supplied date is a real calendar date.
  // this rejects values such as 2026-02-31.
  const parsedDate = new Date(`${data.date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== data.date
  ) {
    throw new ApiError(400, 'date must be a valid calendar date');
  }

  // if given, make sure its valid number
  if (
    data.amountSpent !== undefined &&
    data.amountSpent !== null &&
    (
      typeof data.amountSpent !== 'number' ||
      !Number.isFinite(data.amountSpent) ||
      data.amountSpent < 0 ||
      data.amountSpent > 99999999.99
    )
  ) {
    throw new ApiError(
      400,
      'amountSpent must be a valid nonnegative number below 100000000'
    );
  }

  // if given, must be text
  if (
    data.notes !== undefined &&
    data.notes !== null &&
    typeof data.notes !== 'string'
  ) {
    throw new ApiError(400, 'notes must be a string or null');
  }

  // char limit so doesn't take up too much space
  if (
    typeof data.notes === 'string' &&
    data.notes.length > 100
  ) {
    throw new ApiError(
      400,
      'notes cannot be longer than 100 characters'
    );
  }

  const cleanedNotes =
    typeof data.notes === 'string' ? data.notes.trim() : null;

  return {
    restaurantId: data.restaurantId,
    date: data.date,
    amountSpent:
      data.amountSpent === undefined
        ? null
        : data.amountSpent as number | null,
    notes: cleanedNotes || null,
  };
}