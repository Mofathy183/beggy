import { SuitcasesModel } from '../../prisma/prisma.js';
import { ErrorHandler } from '../utils/error.js';

export const findAllSuitcasesByQuery = async (
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await SuitcasesModel.findMany({
			where: { OR: searchFilter },
			omit: {
				user: true,
				userId: true,
				items: true,
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (!suitcases)
			return new ErrorHandler(
				'suitcases not found',
				'Failed to find suitcases in the database',
				'prisma Error'
			);

		if (suitcases.error)
			return new ErrorHandler(
				'prisma',
				suitcases.error,
				'Failed to find suitcases in the database'
			);

		const meta = {
			totalCount: suitcases.length,
			page: page,
			limit: limit,
			offset: offset,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { meta: meta, suitcases: suitcases };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to find all suitcases');
	}
};

export const findSuitcaseById = async (suitcaseId) => {
	try {
		const suitcase = await SuitcasesModel.findOne({
			where: { id: suitcaseId },
			omit: {
				user: true,
				userId: true,
				items: true,
			},
		});

		if (!suitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database'
			);

		return suitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to find suitcase by id'
		);
	}
};

export const replaceSuitcaseResource = async (suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await SuitcasesModel.update({
			where: { id: suitcaseId },
			data: {
				name: name,
				type: type,
				brand: brand,
				color: color,
				size: size,
				capacity: capacity,
				maxWidth: maxWidth,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			omit: {
				user: true,
				userId: true,
				items: true,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database'
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to replace suitcase resource'
		);
	}
};

export const modifySuitcaseResource = async (suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await SuitcasesModel.update({
			where: { id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWidth: maxWidth || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features: features || undefined,
				wheels: wheels || undefined,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database'
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify suitcase resource'
		);
	}
};

export const removeSuitcaseById = async (suitcaseId) => {
	try {
		const deletedSuitcase = await SuitcasesModel.delete({
			where: { id: suitcaseId },
			omit: {
				user: true,
				userId: true,
				items: true,
			},
		});

		if (!deletedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (deletedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcase.error,
				'Failed to remove suitcase from the database'
			);

		return deletedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove suitcase by id'
		);
	}
};

export const removeAllSuitcases = async () => {
	try {
		const deleteCount = await SuitcasesModel.delete({ where: {} });

		if (!deleteCount || deleteCount.count === 0)
			return new ErrorHandler(
				'Suitcases not deleted',
				'Failed to delete all suitcases in the database',
				'prisma Error'
			);

		return deleteCount;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases'
		);
	}
};

export const findSuitcasesUserHas = async (
	userId,
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await SuitcasesModel.findMany({
			where: { userId: userId, OR: searchFilter },
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (!suitcases)
			return new ErrorHandler(
				'suitcases not found',
				'Failed to find suitcases in the database',
				'prisma Error'
			);

		if (suitcases.error)
			return new ErrorHandler(
				'prisma',
				suitcases.error,
				'Failed to find suitcases in the database'
			);

		const meta = {
			totalCount: suitcases.length,
			page: page,
			limit: limit,
			offset: offset,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { meta: meta, suitcases: suitcases };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to find suitcases user has'
		);
	}
};

export const findSuitcaseUserHasById = async (userId, suitcaseId) => {
	try {
		const suitcase = await SuitcasesModel.findOne({
			where: { userId: userId, id: suitcaseId },
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
			},
		});

		if (!suitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database'
			);

		return suitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to find suitcase user has by id'
		);
	}
};

export const addSuitcaseToUser = async (userId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const newSuitcase = await SuitcasesModel.create({
			data: {
				userId: userId,
				name: name,
				type: type,
				brand: brand,
				color: color,
				size: size,
				capacity: capacity,
				maxWidth: maxWidth,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
			},
		});

		if (!newSuitcase)
			return new ErrorHandler(
				'suitcase not created',
				'Failed to create suitcase in the database',
				'prisma Error'
			);

		if (newSuitcase.error)
			return new ErrorHandler(
				'prisma',
				newSuitcase.error,
				'Failed to create suitcase in the database'
			);

		return newSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add suitcase to user'
		);
	}
};

export const replaceSuitcaseUserHas = async (userId, suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await SuitcasesModel.update({
			where: { userId: userId, id: suitcaseId },
			data: {
				name: name,
				type: type,
				brand: brand,
				color: color,
				size: size,
				capacity: capacity,
				maxWidth: maxWidth,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database'
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify suitcase user has'
		);
	}
};

export const modifySuitcaseUserHas = async (userId, suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await SuitcasesModel.update({
			where: { userId: userId, id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWidth: maxWidth || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features: features || undefined,
				wheels: wheels || undefined,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to find suitcase in the database'
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify suitcase user has'
		);
	}
};

export const removeSuitcaseUserHasById = async (userId, suitcaseId) => {
	try {
		const deletedSuitcase = await SuitcasesModel.delete({
			where: { userId: userId, id: suitcaseId },
		});

		if (!deletedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (deletedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcase.error,
				'Failed to delete suitcase in the database'
			);

		return deletedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove suitcase user has by id'
		);
	}
};

export const removeAllSuitcasesUserHas = async (userId) => {
	try {
		const deletedSuitcases = await SuitcasesModel.deleteMany({
			where: { userId: userId },
		});

		if (!deletedSuitcases || deletedSuitcases.count === 0)
			return new ErrorHandler(
				'suitcases not found',
				'Failed to find suitcases in the database',
				'prisma Error'
			);

		if (deletedSuitcases.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcases.error,
				'Failed to delete suitcases in the database'
			);

		return deletedSuitcases;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases user has'
		);
	}
};
