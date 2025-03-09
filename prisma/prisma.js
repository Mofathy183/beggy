import { PrismaClient } from '@prisma/client';
import {
	//*======={User}========
	getDisplayName,
	getAge,
	//*======={User}========
	//*======={Suitcase and Bags}========
	getCurrentWeight,
	getIsWeightExceeded,
	getCurrentCapacity,
	getIsCapacityExceeded,
	//*======={Suitcase and Bags}========
} from './prismaHelper.js';

//* add extension for Prisma to get the age of the user and the display name
/** @type {import('@prisma/client').PrismaClient} */
const prisma = new PrismaClient().$extends({
    name: "Make Enum Fields TO Uppercase & Make Compute Fields",
    query: {
        user: {
            async create({ args, query }) {
                // Ensure role and gender are uppercase
                if (args.data.role) args.data.role = args.data.role.toUpperCase();
                if (args.data.gender) args.data.gender = args.data.gender.toUpperCase();
                return query(args);
            },
            async update({ args, query }) {
                // Ensure role and gender are uppercase
                if (args.data.role) args.data.role = args.data.role.toUpperCase();
                if (args.data.gender) args.data.gender = args.data.gender.toUpperCase();
                return query(args);
            },
        },
        items: {
            async create({ args, query }) {
                // Ensure category is uppercase
                if (args.data.category) args.data.category = args.data.category.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async update({ args, query }) {
                // Ensure category is uppercase
                if (args.data.category) args.data.category = args.data.category.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async createMany({ args, query }) {
                // Ensure category is uppercase
                if (Array.isArray(args.data)) {
                    args.data = args.data.map(item => ({
                        ...item,
                        category: item.category ? item.category.toUpperCase() : item.category,
                    }));
                }
                // Call the query with modified args
                return query(args);
            },
        },
        account: {
            async create({ args, query }) {
                // Convert provider to uppercase
                if (args.data.provider)args.data.provider = args.data.provider.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async update({ args, query }) {
                // Convert provider to uppercase
                if (args.data.provider)args.data.provider = args.data.provider.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
        },
        bags: {
            async create({ args, query }) {
                if (args.data.type) args.data.type = args.data.type.toUpperCase();
                if (args.data.size) args.data.size = args.data.size.toUpperCase();
                if (args.data.features) args.data.features = args.data.features.map(f => f.toUpperCase());
                if (args.data.material) args.data.material = args.data.material.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async update({ args, query }) {
                if (args.data.type) args.data.type = args.data.type.toUpperCase();
                if (args.data.size) args.data.size = args.data.size.toUpperCase();
                if (args.data.features) args.data.features = args.data.features.map(f => f.toUpperCase());
                if (args.data.material) args.data.material = args.data.material.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async createMany({ args, query }) {
                // Ensure category is uppercase
                if (Array.isArray(args.data)) {
                    args.data = args.data.map(bag => ({
                        ...bag,
                        type: bag.type ? bag.type.toUpperCase() : bag.type,
                        size: bag.size ? bag.size.toUpperCase() : bag.size,
                        features: bag.features ? bag.features.map(f => f.toUpperCase()) : bag.features,
                        material: bag.material ? bag.material.toUpperCase() : bag.material,
                    }));
                }
                // Call the query with modified args
                return query(args);
            },
        },
        suitcases: {
            async create({ args, query }) {
                if (args.data.type) args.data.type = args.data.type.toUpperCase();
                if (args.data.size) args.data.size = args.data.size.toUpperCase();
                if (args.data.material) args.data.material = args.data.material.toUpperCase();
                if (args.data.features) args.data.features = args.data.features.map(f => f.toUpperCase());
                if (args.data.wheels) args.data.wheels = args.data.wheels.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async update({ args, query }) {
                if (args.data.type) args.data.type = args.data.type.toUpperCase();
                if (args.data.size) args.data.size = args.data.size.toUpperCase();
                if (args.data.material) args.data.material = args.data.material.toUpperCase();
                if (args.data.features) args.data.features = args.data.features.map(f => f.toUpperCase());
                if (args.data.wheels) args.data.wheels = args.data.wheels.toUpperCase();
                // Call the query with modified args
                return query(args);
            },
            async createMany({ args, query }) {
                // Ensure category is uppercase
                if (Array.isArray(args.data)) {
                    args.data = args.data.map(suitcase => ({
                        ...suitcase,
                        type: suitcase.type ? suitcase.type.toUpperCase() : suitcase.type,
                        size: suitcase.size ? suitcase.size.toUpperCase() : suitcase.size,
                        features: suitcase.features ? suitcase.features.map(f => f.toUpperCase()) : suitcase.features,
                        material: suitcase.material ? suitcase.material.toUpperCase() : suitcase.material,
                        wheels: suitcase.wheels ? suitcase.wheels.toUpperCase() : suitcase.wheels,
                    }));
                }
                // Call the query with modified args
                return query(args);
            },
        },
    },
    result: {
        user: {
            displayName: {
                compute(user) {
                    return getDisplayName(user.firstName, user.lastName);
                },
            },
            age: {
                compute(user) {
                    return getAge(user.birth);
                },
            },
        },
        bags: {
            currentWeight: {
                compute(bag) {
                    return getCurrentWeight(bag.bagItems);
                },
            },
            isWeightExceeded: {
                compute(bags) {
                    return getIsWeightExceeded(bags.bagItems, bags.maxWeight);
                },
            },
            currentCapacity: {
                compute(bags) {
                    return getCurrentCapacity(bags.bagItems);
                },
            },
            isCapacityExceeded: {
                compute(bags) {
                    return getIsCapacityExceeded(bags.bagItems, bags.capacity);
                },
            },
        },
        suitcase: {
			currentWeight: {
				compute(suitcases) {
					return getCurrentWeight(suitcases.suitcaseItems);
				},
			},
			isWeightExceeded: {
				compute(suitcases) {
					return getIsWeightExceeded(
						suitcases.suitcaseItems,
						suitcases.maxWeight
					);
				},
			},
			currentCapacity: {
				compute(suitcases) {
					return getCurrentCapacity(suitcases.suitcaseItems);
				},
			},
			isCapacityExceeded: {
				compute(suitcases) {
					return getIsCapacityExceeded(
						suitcases.suitcaseItems,
						suitcases.capacity
					);
				},
			},
        }
    }
})


export default prisma