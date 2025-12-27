import { BagsGetPayload, SuitcasesGetPayload } from '@prisma-generated/models';

export type PrismaBagModel = BagsGetPayload<{
	include: {
		bagItems: {
			include: {
				item: true;
				bag: true;
			};
		};
		user: true;
	};
}>;

export type PrismaSuitcaseModel = SuitcasesGetPayload<{
	include: {
		suitcaseItems: {
			include: {
				suitcase: true;
				item: true;
			};
		};
		user: true;
	};
}>;
