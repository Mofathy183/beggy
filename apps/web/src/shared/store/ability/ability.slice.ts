import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Permissions } from '@beggy/shared/types';

/**
 * Ability slice state.
 *
 * @remarks
 * - Stores raw permissions only
 * - CASL ability is derived elsewhere (selectors/hooks)
 */
type AbilityState = {
	permissions: Permissions;
};

const initialState: AbilityState = {
	permissions: [],
};

/**
 * Redux slice responsible for managing user permissions.
 *
 * @remarks
 * - Permissions are set after successful authentication
 * - Cleared on logout or session invalidation
 * - Does NOT store CASL ability instances (non-serializable)
 */
const abilitySlice = createSlice({
	name: 'ability',
	initialState,
	reducers: {
		/**
		 * Replace current permissions with backend-provided permissions.
		 *
		 * @remarks
		 * - Typically dispatched after `/auth/me`
		 * - Optional `userId` allows debugging or future auditing
		 */
		setPermissions: (
			state,
			action: PayloadAction<{ permissions: Permissions }>
		) => {
			state.permissions = action.payload.permissions;
		},

		/**
		 * Clear all permissions.
		 *
		 * @remarks
		 * - Called on logout
		 * - Called on auth/session errors
		 */
		clearPermissions: (state) => {
			state.permissions = [];
		},
	},
});

export const { setPermissions, clearPermissions } = abilitySlice.actions;
export default abilitySlice.reducer;
