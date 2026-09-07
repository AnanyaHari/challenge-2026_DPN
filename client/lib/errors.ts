import { NextResponse } from 'next/server';

/**
 * Central error -> HTTP response mapper for the API route handlers. Call it
 * from a route's `catch` block so error handling lives in one place:
 *
 *   try {
 *     ...
 *   } catch (err) {
 *     return handleError(err);
 *   }
 *
 * This is a STUB. Right now it always returns a generic 500. A real
 * implementation would inspect the error (validation vs. not-found vs.
 * conflict vs. unexpected) and choose an appropriate status code and shape.
 *
 * This is task A3. The write endpoints from A2 can't return sensible 400s and
 * 404s while every failure funnels into a 500.
 *
 * TODO (A3): map known error types to proper status codes (400, 404, 409, ...)
 * TODO (A3): avoid leaking internal error details in responses
 */
export class ApiError extends Error {
  status: number; //the error code that will be returned 

  constructor(status: number, message: string) {
    super(message); //put message in JS error class
    this.status = status; //store the status for later use
  }
}

type DatabaseError = { //describes the part of error that is used; code identifies category of error
  code?: string;
};

export function handleError(err: unknown): NextResponse {
  //handle errors thrown by application (missing resturant, etc)
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status }
    );
  }

  //if it is a syntax erorr, return status 400 error
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: 'Request body must contain valid JSON' },
      { status: 400 }
    );
  }

  //check if type object and not null
  if (typeof err === 'object' && err !== null) {
    const databaseError = err as DatabaseError;
  
  //for part B, error that referenced rest doesn't exist 
  if (databaseError.code === '23503') {
      return NextResponse.json(
      { error: 'Restaurant not found' },
      { status: 404 }
    );
  }

    //if this error code, return 409
    if (databaseError.code === '23505') {
      return NextResponse.json(
        { error: 'Restaurant already exists' },
        { status: 409 }
      );
    }
    //the following errors are type 400 error (required val was null, check contraint violated, invalid format)
    if (
      databaseError.code === '23502' ||
      databaseError.code === '23514' ||
      databaseError.code === '22P02'
    ) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
  }

  //log unexpected error to server
  console.error('Unhandled API error:', err);

  //return generic response for outside
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}
