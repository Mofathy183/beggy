import prisma from '../../prisma/prisma.js';
import { ErrorHandler } from '../utils/error.js';

/**
 * @function findSuitcasesUserHas
 * @description Fetches a list of suitcases owned by a specific user based on filters, pagination, and sorting criteria.
 * @param {string} userId - The ID of the user whose suitcases are being retrieved.
 * @param {Object} searchFilter - Filtering conditions for the suitcases search.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the user's suitcases and metadata, or an error if the operation fails.
 */
export const findSuitcasesUserHas = async (
	userId,
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await prisma.suitcases.findMany({
			where: { ...searchFilter, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
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
				'Failed to find suitcases in the database ' +
					suitcases.error.message
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
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

/**
 * @function findSuitcaseUserHasById
 * @description Retrieves a specific suitcase owned by a user based on the suitcase's ID.
 * @param {string} userId - The ID of the user who owns the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase to retrieve.
 * @returns {Promise<Object>} The suitcase details, or an error if the operation fails.
 */
export const findSuitcaseUserHasById = async (userId, suitcaseId) => {
	try {
		const suitcase = await prisma.suitcases.findUnique({
			where: { userId: userId, id: suitcaseId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
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
				'Failed to find suitcase in the database ' +
					suitcase.error.message
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

/**
 * @function addSuitcaseToUser
 * @description Adds a new suitcase for a user with the specified details.
 * @param {string} userId - The ID of the user to whom the suitcase is being added.
 * @param {Object} body - Contains suitcase details such as name, type, brand, color, size, etc.
 * @returns {Promise<Object>} The newly created suitcase and metadata, or an error if the operation fails.
 */
export const addSuitcaseToUser = async (userId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features,
			wheels,
		} = body;

		const newSuitcase = await prisma.suitcases.create({
			data: {
				userId: userId,
				name: name,
				type: type,
				brand: brand,
				color: color,
				size: size,
				capacity: capacity,
				maxWeight: maxWeight,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
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
				'Failed to create suitcase in the database ' +
					newSuitcase.error.message
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalCreate: newSuitcase ? 1 : 0,
		};

		return { newSuitcase: newSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add suitcase to user'
		);
	}
};

/**
 * @function replaceSuitcaseUserHas
 * @description Replaces the details of an existing suitcase owned by a user.
 * @param {string} userId - The ID of the user who owns the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase to be replaced.
 * @param {Object} body - New data to update the suitcase.
 * @returns {Promise<Object>} The updated suitcase details, or an error if the operation fails.
 */
export const replaceSuitcaseUserHas = async (userId, suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await prisma.suitcases.update({
			where: { userId: userId, id: suitcaseId },
			data: {
				name: name,
				type: type,
				brand: brand,
				color: color,
				size: size,
				capacity: capacity,
				maxWeight: maxWeight,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
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
				'Failed to modify suitcase in the database ' +
					updatedSuitcase.error.message
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

/**
 * @function modifySuitcaseUserHas
 * @description Modifies specific fields of a suitcase owned by a user, with support for feature additions and removals.
 * @param {string} userId - The ID of the user who owns the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase to be modified.
 * @param {Object} body - Partial fields to update, including features to add or remove.
 * @returns {Promise<Object>} The modified suitcase details, or an error if the operation fails.
 */
export const modifySuitcaseUserHas = async (userId, suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features,
			removeFeatures,
			wheels,
		} = body;

		const suitcase = await prisma.suitcases.findUnique({
			where: { id: suitcaseId },
			select: {
				features: true,
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
				'Failed to find suitcase in the database ' +
					suitcase.error.message
			);

		// Normalize `removeFeatures` for case-insensitive matching
		let removeSet = [
			...new Set([...removeFeatures.map((f) => f.toUpperCase())]),
		];
		console.log('Removing features: ', removeSet);

		// Filter out features that need to be removed
		let newFeatures =
			suitcase.features?.filter(
				(f) => !removeSet.includes(f.toUpperCase())
			) || [];
		console.log('New features: ', newFeatures);

		// Convert `features` to uppercase to match `suitcase.features`
		let updatedFeatures = [
			...new Set([
				...features.map((f) => f.toUpperCase()),
				...newFeatures,
			]),
		];
		console.log('Updated features: ', updatedFeatures);

		const updatedSuitcase = await prisma.suitcases.update({
			where: { userId: userId, id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWeight: maxWeight || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features:
					features.length || newFeatures.length
						? updatedFeatures
						: undefined,
				wheels: wheels || undefined,
			},
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
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
				'Failed to find suitcase in the database ' +
					updatedSuitcase.error.message
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

/**
 * @function removeSuitcaseUserHasById
 * @description Removes a specific suitcase owned by a user based on the suitcase's ID.
 * @param {string} userId - The ID of the user who owns the suitcase.
 * @param {string} suitcaseId - The ID of the suitcase to delete.
 * @returns {Promise<Object>} An object with metadata and the deleted suitcase details, or an error if the operation fails.
 */
export const removeSuitcaseUserHasById = async (userId, suitcaseId) => {
	try {
		const deletedSuitcase = await prisma.suitcases.delete({
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
				'Failed to delete suitcase in the database ' +
					deletedSuitcase.error.message
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcase ? 1 : 0,
		};

		return { deletedSuitcase: deletedSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove suitcase user has by id'
		);
	}
};

/**
 * @function removeAllSuitcasesUserHas
 * @description Deletes all suitcases owned by a user based on filtering criteria.
 * @param {string} userId - The ID of the user whose suitcases are being deleted.
 * @param {Object} searchFilter - Filtering conditions for suitcase deletion.
 * @returns {Promise<Object>} Metadata of the deletion operation, or an error if the operation fails.
 */
export const removeAllSuitcasesUserHas = async (userId, searchFilter) => {
	try {
		const deletedSuitcases = await prisma.suitcases.deleteMany({
			where: { ...searchFilter, userId: userId },
		});

		if (deletedSuitcases.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcases.error,
				'Failed to delete suitcases in the database ' +
					deletedSuitcases.error.description
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcases.count,
		};

		return { deletedSuitcases: deletedSuitcases, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases user has'
		);
	}
};
