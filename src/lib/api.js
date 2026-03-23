const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * Get the Firebase ID token from the current user (passed in from AuthContext).
 * All API calls attach it as a Bearer token.
 */
async function authHeaders(token) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

async function safeFetch(url, options) {
    try {
        return await fetch(url, options);
    } catch (e) {
        // Most common in-browser fetch failure is: TypeError: Failed to fetch
        const hint =
            `Network request failed for ${url}. ` +
            `Check that your backend is running and reachable at NEXT_PUBLIC_BACKEND_URL=${BACKEND} (from .env.local), ` +
            `and that it allows requests from this app (CORS).`;
        const err = new Error(e?.message ? `${e.message}. ${hint}` : hint);
        err.cause = e;
        throw err;
    }
}

// ─── Profile ───────────────────────────────────────────────────────────────

export async function saveUserProfile(token, { name, interests }) {
    const url = `${BACKEND}/api/users/profile`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ name, interests }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getUserProfile(token) {
    const url = `${BACKEND}/api/users/profile`;
    const res = await safeFetch(url, {
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── Recommendations ───────────────────────────────────────────────────────

export async function getRecommendations(token) {
    const url = `${BACKEND}/api/users/recommendations`;
    const res = await safeFetch(url, {
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { recommendations: [], updatedAt: string }
}

export async function refreshRecommendations(token) {
    const url = `${BACKEND}/api/users/recommendations/refresh`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function generateTripPlan(token, { trip_name, trip_date, stop_count, favorites }) {
    const url = `${BACKEND}/api/users/trips/plan`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ trip_name, trip_date, stop_count, favorites }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function fetchPlaceCulture(token, place_name) {
    const url = `${BACKEND}/api/users/trips/culture`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ place_name }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── Event tracking ────────────────────────────────────────────────────────

export async function saveUserTrip(token, tripData) {
    const url = `${BACKEND}/api/users/trips`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify(tripData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function updateUserTrip(token, tripId, updates) {
    const url = `${BACKEND}/api/users/trips/${tripId}`;
    const res = await safeFetch(url, {
        method: "PUT",
        headers: await authHeaders(token),
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getUserTrips(token) {
    const url = `${BACKEND}/api/users/trips`;
    const res = await safeFetch(url, {
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function reorderRouteList(token, stops, route_preference) {
    const url = `${BACKEND}/api/users/trips/reorder`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ stops, route_preference }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function searchAndAddPlace(token, query) {
    const url = `${BACKEND}/api/users/trips/search-place`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function trackEvent(token, { place_name, category, action }) {
    // Fire-and-forget — don't block the UI
    const url = `${BACKEND}/api/events`;
    safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ place_name, category, action }),
    }).catch((e) => console.warn("[trackEvent]", e));
}

// ─── Quests ────────────────────────────────────────────────────────────────

export async function getQuests(token) {
    const url = `${BACKEND}/api/quests`;
    const res = await safeFetch(url, {
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { quests: [] }
}

export async function createQuest(token, { title, description, reward }) {
    const url = `${BACKEND}/api/quests`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ title, description, reward }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteQuest(token, questId) {
    const url = `${BACKEND}/api/quests/${questId}`;
    const res = await safeFetch(url, {
        method: "DELETE",
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function completeQuest(token, questId) {
    const url = `${BACKEND}/api/quests/${questId}/complete`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── Explore Places (CMS) ──────────────────────────────────────────────────

export async function getExplorePlaces(token) {
    const url = `${BACKEND}/api/explore`;
    const res = await safeFetch(url, {
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { places: [] }
}

export async function createExplorePlace(token, { title, snippet, content, image }) {
    const url = `${BACKEND}/api/explore`;
    const res = await safeFetch(url, {
        method: "POST",
        headers: await authHeaders(token),
        body: JSON.stringify({ title, snippet, content, image }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteExplorePlace(token, placeId) {
    const url = `${BACKEND}/api/explore/${placeId}`;
    const res = await safeFetch(url, {
        method: "DELETE",
        headers: await authHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}