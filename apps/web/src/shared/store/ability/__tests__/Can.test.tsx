import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import * as abilityModule from '@shared/store/ability';

import Can from '../Can';
import { Action, Subject } from '@beggy/shared/constants';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Can', () => {
	it('renders children for permitted actions', () => {
		vi.spyOn(abilityModule, 'useAbility').mockReturnValue({
			can: () => true,
		} as any);

		render(
			<Can action={Action.READ} subject={Subject.USER}>
				<div>Allowed Content</div>
			</Can>
		);

		expect(screen.getByText('Allowed Content')).toBeInTheDocument();
	});

	it('renders nothing for denied actions', () => {
		vi.spyOn(abilityModule, 'useAbility').mockReturnValue({
			can: () => false,
		} as any);

		render(
			<Can action={Action.DELETE} subject={Subject.USER}>
				<div>Hidden Content</div>
			</Can>
		);

		expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
	});
});
