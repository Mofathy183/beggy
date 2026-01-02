import { BagsGetPayload, SuitcasesGetPayload } from '@prisma-generated/models';
import { prisma } from '@prisma';

// Export the TYPE of the extended client
export type ExtendedPrismaClient = typeof prisma;

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
