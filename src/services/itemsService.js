import { ItemsModel, UserModel } from '../../prisma/prisma.js';
import ErrorHandler from '../utils/error.js';

export const findItemsUserHas = async (userId, page, limit, offset) => {
	try {
		const userItems = await ItemsModel.findMany({
			where: { userId: userId },
			omit: {
				createdAt: true,
				updatedAt: true,
				bagId: true,
				suitcaseId: true,
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
			take: limit,
			skip: offset,
		});

		if (userItems.error)
			return new ErrorHandler(
				'prisma',
				'User has no item' || userItems.error,
				'There is no item to that user' || userItems.error.message
			);

		const itemsCount = await ItemsModel.count({
			where: { userId: userId },
			take: limit,
			skip: offset,
		});

		if (itemsCount.error)
			return new ErrorHandler(
				'prisma',
				'User has no item' || itemsCount.error,
				'There is no item to that user' || itemsCount.error.message
			);

		//* for if the user dose not have any items
		const userRole = await UserModel.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		const meta = {
			total: itemsCount,
			page: page,
			limit: limit,
		};

		return { userRole: userRole, userItems: userItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			error.message || 'Failed to get items user has'
		);
	}
};
