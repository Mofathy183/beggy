import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction, Reducer } from '@reduxjs/toolkit';
import type { RootState } from '@shared/store/store';

export interface DashboardState {
	nudgeDismissed: boolean;
	onboardingCompleted: boolean | null; // null = not yet loaded
}

const initialState: DashboardState = {
	nudgeDismissed: false,
	onboardingCompleted: null,
};

export const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState,
	reducers: {
		dismissNudge(state) {
			state.nudgeDismissed = true;
		},
		setOnboardingCompleted(state, action: PayloadAction<boolean>) {
			state.onboardingCompleted = action.payload;
		},
	},
});

export const { dismissNudge, setOnboardingCompleted } = dashboardSlice.actions;

export const selectNudgeDismissed = (state: RootState) =>
	state.dashboard.nudgeDismissed;

export const selectOnboardingCompleted = (state: RootState) =>
	state.dashboard.onboardingCompleted;

// Derived: show the dot when onboarding is not done and nudge not dismissed
export const selectShowOnboardingIndicator = (state: RootState) =>
	state.dashboard.onboardingCompleted === false &&
	!state.dashboard.nudgeDismissed;

export const dashboardReducer: Reducer<DashboardState> = dashboardSlice.reducer;
