import { act } from '@testing-library/react';
import useAbility from '../useAbility';
import { renderHookWithStore } from '@tests/utils';
import { setPermissions } from '../ability.slice';
import { Action, Subject, Scope } from '@beggy/shared/constants';

describe('useAbility()', () => {
	it('returns a stable ability instance across renders', () => {
		const { result, rerender } = renderHookWithStore(() => useAbility());

		const firstAbility = result.current;

		rerender();

		expect(result.current).toBe(firstAbility);
	});

	it('returns an ability with no rules initially', () => {
		const { result } = renderHookWithStore(() => useAbility());

		expect(result.current.rules).toHaveLength(0);
	});

	it('updates ability rules when permissions change', () => {
		const { result, store } = renderHookWithStore(() => useAbility());

		const ability = result.current;

		act(() => {
			store.dispatch(
				setPermissions({
					permissions: [
						{
							action: Action.READ,
							subject: Subject.USER,
							scope: Scope.ANY,
						},
					],
				})
			);
		});

		expect(ability.rules.length).toBeGreaterThan(0);
	});
});
