'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Restaurant, Visit } from '@/lib/types';

type SpendingTrackerProps = {
  restaurants: Restaurant[];
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SpendingTracker({
  restaurants,
}: SpendingTrackerProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [restaurantId, setRestaurantId] = useState(
    restaurants.length > 0 ? String(restaurants[0].id) : ''
  );
  const [date, setDate] = useState(getToday());
  const [amountSpent, setAmountSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load existing visits when this component appears.
  useEffect(() => {
    async function loadVisits() {
      try {
        const response = await fetch('/api/visits');

        if (!response.ok) {
          throw new Error('Could not load visits');
        }

        const data: Visit[] = await response.json();
        setVisits(data);
      } catch {
        setError('Could not load spending history.');
      } finally {
        setLoading(false);
      }
    }

    loadVisits();
  }, []);

  // Add together all non-null spending amounts.
  const totalSpent = useMemo(() => {
    return visits.reduce(
      (total, visit) => total + (visit.amountSpent ?? 0),
      0
    );
  }, [visits]);

  // Find the restaurant name associated with a visit.
  function getRestaurantName(id: number): string {
    return (
      restaurants.find((restaurant) => restaurant.id === id)?.name ??
      'Unknown restaurant'
    );
  }

  // Send the completed form to POST /api/visits.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          date,
          amountSpent:
            amountSpent === '' ? null : Number(amountSpent),
          notes: notes.trim() === '' ? null : notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Could not record visit');
      }

      // Show the new visit immediately without reloading the page.
      setVisits((currentVisits) => [result as Visit, ...currentVisits]);

      // Clear the spending and notes fields for the next entry.
      setAmountSpent('');
      setNotes('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not record visit'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 border-t border-gray-200 pt-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-medium">Spending tracker</h2>

        <span className="font-medium">
          Total: ${totalSpent.toFixed(2)}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {restaurants.length === 0 ? (
        <p className="text-sm text-gray-600">
          Add a restaurant before recording a visit.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Restaurant</span>

              <select
                value={restaurantId}
                onChange={(event) =>
                  setRestaurantId(event.target.value)
                }
                required
                className="w-full rounded-md border border-gray-300 p-2"
              >
                {restaurants.map((restaurant) => (
                  <option
                    key={restaurant.id}
                    value={restaurant.id}
                  >
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium">Date</span>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium">
                Amount spent
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amountSpent}
                onChange={(event) =>
                  setAmountSpent(event.target.value)
                }
                placeholder="24.50"
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium">Notes</span>

              <input
                type="text"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                placeholder="Dinner with friends"
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Record visit'}
          </button>
        </form>
      )}

      <h3 className="mb-3 font-medium">Recent visits</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Loading visits...</p>
      ) : visits.length === 0 ? (
        <p className="text-sm text-gray-500">
          No visits recorded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {visits.map((visit) => (
            <li
              key={visit.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium">
                  {getRestaurantName(visit.restaurantId)}
                </span>

                <span className="font-medium">
                  {visit.amountSpent === null
                    ? 'No amount'
                    : `$${visit.amountSpent.toFixed(2)}`}
                </span>
              </div>

              <div className="mt-1 text-sm text-gray-600">
                {visit.date}
                {visit.notes ? ` · ${visit.notes}` : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}