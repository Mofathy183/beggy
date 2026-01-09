/**
 * 👤 PROFILES — User-Facing Identity
 *
 * The Profiles domain represents how users present themselves
 * to other users and to the public.
 *
 * Profiles are:
 * - Separate from authentication
 * - Editable by the owning user
 * - Publicly readable where allowed
 *
 * ------------------------------------------------------------------
 * Private Profile (Authenticated)
 * ------------------------------------------------------------------
 *
 * GET /profiles/me
 * - Returns the authenticated user's private profile
 * - Requires authentication
 *
 * PATCH /profiles/me
 * - Updates the authenticated user's profile
 * - Accepts structured JSON data only (e.g. first and last name, birthDate, avatarUrl)
 *
 * The /me pattern avoids exposing internal user IDs
 * and simplifies frontend logic.
 *
 * ------------------------------------------------------------------
 * Public Profile
 * ------------------------------------------------------------------
 *
 * GET /profiles/:id
 * - Returns a user's public profile by ID
 * - Accessible without authentication
 * - Does NOT expose private or sensitive fields
 *
 * Public vs private access is intentionally explicit
 * to avoid accidental data leakage.
 */
