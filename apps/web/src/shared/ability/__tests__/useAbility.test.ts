import { act } from '@testing-library/react';
import useAbility from '../useAbility';
import { renderHookWithStore } from '@tests';
import { setPermissions, clearPermissions } from '../ability.slice';
import { Action, Subject, Scope } from '@beggy/shared/constants';

describe('useAbility()', () => {
	it('returns no rules initially', () => {
		const { result } = renderHookWithStore(() => useAbility());

		expect(result.current.rules).toHaveLength(0);
	});

	it('updates the ability when permissions change', () => {
		const { result, store } = renderHookWithStore(() => useAbility());

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

		expect(result.current.can(Action.READ, 'USER:ANY')).toBe(true);
		expect(result.current.can(Action.READ, 'USER:OWN')).toBe(true);
	});

	it('replaces the ability instance when permissions change', () => {
		const { result, store } = renderHookWithStore(() => useAbility());

		const firstAbility = result.current;

		act(() => {
			store.dispatch(
				setPermissions({
					permissions: [
						{
							action: Action.READ,
							subject: Subject.USER,
							scope: Scope.OWN,
						},
					],
				})
			);
		});

		expect(result.current).not.toBe(firstAbility);
	});

	it('clears ability rules when permissions are cleared', () => {
		const { result, store } = renderHookWithStore(() => useAbility());

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

		expect(result.current.rules.length).toBeGreaterThan(0);

		act(() => {
			store.dispatch(clearPermissions());
		});

		expect(result.current.rules).toHaveLength(0);
	});
});
