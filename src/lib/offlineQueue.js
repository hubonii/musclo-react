// Offline workout save queue — persists unsaved workout payloads in localStorage
// and auto-flushes them to the server when connectivity returns.
import { apiPost } from '../api/axios';

const QUEUE_KEY = 'musclo-pending-workouts';

/**
 * Read all pending workout payloads from localStorage.
 * @returns {Array} Pending workout payloads
 */
export function getPendingWorkouts() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Queue a workout payload for later sync.
 * @param {Object} payload - The workout save payload
 */
export function queueWorkoutSave(payload) {
  const pending = getPendingWorkouts();
  pending.push({ payload, queuedAt: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
}

/**
 * Get the count of pending workouts.
 * @returns {number}
 */
export function getPendingCount() {
  return getPendingWorkouts().length;
}

/**
 * Attempt to POST all queued workouts. Removes each entry on success.
 * Returns the number of successfully synced workouts.
 * @returns {Promise<number>}
 */
export async function flushQueue() {
  const pending = getPendingWorkouts();
  if (pending.length === 0) return 0;

  let firstError = null;
  for (const item of pending) {
    try {
      await apiPost('/workouts', item.payload);
      synced++;
    } catch (err) {
      console.error('[OfflineSync] Failed to sync workout:', err.response?.data || err.message);
      if (!firstError) firstError = err.response?.data?.message || err.message;
      // Keep failed items in queue for next attempt.
      remaining.push(item);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { synced, error: firstError };
}

/**
 * Initialize auto-flush: listen for online events and flush pending workouts.
 * Call once at app startup.
 */
export function initOfflineSync() {
  const handleOnline = async () => {
    const { synced } = await flushQueue();
    if (synced > 0) {
      console.log(`[OfflineSync] Synced ${synced} pending workout(s).`);
    }
  };

  window.addEventListener('online', handleOnline);

  // Also try flushing immediately if we're already online and have pending items.
  if (navigator.onLine && getPendingCount() > 0) {
    handleOnline();
  }

  return () => window.removeEventListener('online', handleOnline);
}
