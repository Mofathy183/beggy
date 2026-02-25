import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
	AuthMeDTO,
	AuthMeUserDTO,
	AuthMeProfileDTO,
} from '@beggy/shared/types';

/**
 * Auth status lifecycle.
 *
 * - idle          → initial state, bootstrap not yet attempted
 * - loading       → /auth/me in flight (app boot or manual refresh)
 * - authenticated → /auth/me succeeded, user is known
 * - unauthenticated → /auth/me failed (no cookie, expired, etc.)
 */
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
	status: AuthStatus;

	/**
	 * Core user identity — id, email, role, createdAt.
	 * Null until authenticated.
	 */
	user: AuthMeUserDTO | null;

	/**
	 * Public profile for UI personalization.
	 * Null if the user hasn't completed their profile yet
	 * (valid for new sign-ups and OAuth users on first login).
	 */
	profile: AuthMeProfileDTO | null;

	/**
	 * Authentication method metadata.
	 * Drives account settings UI (password change, OAuth linking).
	 */
	auth: AuthMeDTO['auth'] | null;

	/**
	 * Indicates whether bootstrap has completed at least once.
	 * Prevents route flashing.
	 */
	initialized: boolean;

	/**
	 * Non-blocking error for the last failed auth operation.
	 * Used to show feedback on login/signup forms.
	 */
	error: string | null;
}

/**
 * Initial auth state.
 *
 * App starts in idle.
 * First `/auth/me` call transitions it.
 */
const initialState: AuthState = {
	status: 'idle',
	user: null,
	profile: null,
	auth: null,
	initialized: false,
	error: null,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		/**
		 * setLoading
		 *
		 * Marks session as checking.
		 * Used before `/auth/me`.
		 */
		setLoading(state) {
			state.status = 'loading';
			state.error = null;
		},

		/**
		 * setAuthenticated
		 *
		 * Called ONLY from `/auth/me` success.
		 *
		 * Never call this directly after login —
		 * always re-fetch `/auth/me`.
		 */
		setAuthenticated(state, action: PayloadAction<AuthMeDTO>) {
			state.status = 'authenticated';
			state.user = action.payload.user;
			state.profile = action.payload.profile;
			state.auth = action.payload.auth;
			state.initialized = true;
			state.error = null;
		},

		/**
		 * setUnauthenticated
		 *
		 * Clears identity state.
		 *
		 * Called when:
		 * - `/auth/me` fails
		 * - logout succeeds
		 * - refresh fails
		 */
		setUnauthenticated(state) {
			state.status = 'unauthenticated';
			state.user = null;
			state.profile = null;
			state.auth = null;
			state.initialized = true;
			state.error = null;
		},

		/**
		 * clearAuthError
		 *
		 * Used by forms to reset error UI.
		 */
		clearAuthError(state) {
			state.error = null;
		},
	},
});

export const {
	setLoading,
	setAuthenticated,
	setUnauthenticated,
	clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
