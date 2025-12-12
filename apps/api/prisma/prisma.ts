import { IBag, ISuitcase } from './../src/types/prismaTypes';
import { PrismaClient } from './generated/prisma/client';
// import { UserCreateInput, BagsCreateInput, SuitcasesCreateInput, ItemsCreateInput } from './generated/prisma/models';
import {
	//*======={User}========
	getDisplayName,
	getAge,
	//*======={User}========
	//*======={Suitcase and Bags}========
	calculateCurrentCapacity,
	calculateCurrentWeight,
	calculateRemainingCapacity,
	calculateRemainingWeight,
	calculateCapacityPercentage,
	calculateWeightPercentage,
	checkIsFull,
	checkIsOverCapacity,
	checkIsOverweight,
	getContainerStatus,
	calculateItemCount,
	//*======={Suitcase and Bags}========
} from './helper';

//* add extension for Prisma to get the age of the user and the display name
const prisma = new PrismaClient({} as any)
	.$extends({
		name: 'UserComputedFields',
		result: {
			user: {
				displayName: {
					needs: { firstName: true, lastName: true },
					compute(user) {
						const { firstName, lastName } = user;
						return getDisplayName(firstName, lastName);
					},
				},
				age: {
					needs: { birthDate: true },
					compute(user) {
						const { birthDate } = user;
						return getAge(birthDate);
					},
				},
			},
		},
	})
	.$extends({
		name: 'BagComputedFields',
		result: {
			bags: {
				currentWeight: {
					needs: {},
					compute(bag: IBag) {
						if ('bagItems' in bag && !Array.isArray(bag.bagItems))
							return null;
						// If bagItems is undefined or not an array, treat as empty array
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];
						return calculateCurrentWeight(items);
					},
				},
				currentCapacity: {
					needs: {},
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];
						return calculateCurrentCapacity(items);
					},
				},
				remainingWeight: {
					needs: { maxWeight: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const currentWeight = calculateCurrentWeight(items);

						return calculateRemainingWeight(
							currentWeight,
							bag.maxWeight
						);
					},
				},
				remainingCapacity: {
					needs: { maxCapacity: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const currentCapacity = calculateCurrentCapacity(items);

						return calculateRemainingCapacity(
							currentCapacity,
							bag.maxCapacity
						);
					},
				},
				isOverweight: {
					needs: { maxCapacity: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const currentWeight = calculateCurrentWeight(items);
						return checkIsOverweight(currentWeight, bag.maxWeight);
					},
				},
				isOverCapacity: {
					needs: { maxCapacity: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const currentCapacity = calculateCurrentCapacity(items);

						return checkIsOverCapacity(
							currentCapacity,
							bag.maxCapacity
						);
					},
				},
				isFull: {
					needs: { maxCapacity: true, maxWeight: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const { maxWeight, maxCapacity } = bag;
						const currentCapacity = calculateCurrentCapacity(items);
						const currentWeight = calculateCurrentWeight(items);

						return checkIsFull(
							currentWeight,
							maxWeight,
							currentCapacity,
							maxCapacity
						);
					},
				},
				weightPercentage: {
					needs: { maxWeight: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];
						const currentWeight = calculateCurrentWeight(items);
						return calculateWeightPercentage(
							currentWeight,
							bag.maxWeight
						);
					},
				},
				capacityPercentage: {
					needs: { maxCapacity: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const currentCapacity = calculateCurrentCapacity(items);

						return calculateCapacityPercentage(
							currentCapacity,
							bag.maxCapacity
						);
					},
				},
				itemCount: {
					needs: {},
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						return calculateItemCount(items);
					},
				},
				status: {
					needs: { maxCapacity: true, maxWeight: true },
					compute(bag: IBag) {
						if ('bagItems' in bag && !bag?.bagItems) return null;
						const items = Array.isArray(bag.bagItems)
							? bag.bagItems
							: [];

						const { maxWeight, maxCapacity } = bag;
						const currentCapacity = calculateCurrentCapacity(items);
						const currentWeight = calculateCurrentWeight(items);

						const itemCount = calculateItemCount(items);
						const isFull = checkIsFull(
							currentWeight,
							maxWeight,
							currentCapacity,
							maxCapacity
						);
						const isOverWeight = checkIsOverweight(
							currentWeight,
							bag.maxWeight
						);
						const isOverCapacity = checkIsOverCapacity(
							currentCapacity,
							bag.maxCapacity
						);

						return getContainerStatus(
							isOverWeight,
							isOverCapacity,
							isFull,
							itemCount
						);
					},
				},
			},
		},
	})
	.$extends({
		name: 'SuitcaseComputedFields',
		result: {
			suitcases: {
				currentWeight: {
					needs: {},
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];
						return calculateCurrentWeight(items);
					},
				},
				currentCapacity: {
					needs: {},
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];
						return calculateCurrentCapacity(items);
					},
				},
				remainingWeight: {
					needs: { maxWeight: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const currentWeight = calculateCurrentWeight(items);

						return calculateRemainingWeight(
							currentWeight,
							suitcase.maxWeight
						);
					},
				},
				remainingCapacity: {
					needs: { maxCapacity: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const currentCapacity = calculateCurrentCapacity(items);

						return calculateRemainingCapacity(
							currentCapacity,
							suitcase.maxCapacity
						);
					},
				},
				isOverweight: {
					needs: { maxCapacity: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const currentWeight = calculateCurrentWeight(items);
						return checkIsOverweight(
							currentWeight,
							suitcase.maxWeight
						);
					},
				},
				isOverCapacity: {
					needs: { maxCapacity: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const currentCapacity = calculateCurrentCapacity(items);

						return checkIsOverCapacity(
							currentCapacity,
							suitcase.maxCapacity
						);
					},
				},
				isFull: {
					needs: { maxCapacity: true, maxWeight: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const { maxWeight, maxCapacity } = suitcase;
						const currentCapacity = calculateCurrentCapacity(items);
						const currentWeight = calculateCurrentWeight(items);

						return checkIsFull(
							currentWeight,
							maxWeight,
							currentCapacity,
							maxCapacity
						);
					},
				},
				weightPercentage: {
					needs: { maxWeight: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const currentWeight = calculateCurrentWeight(items);

						return calculateWeightPercentage(
							currentWeight,
							suitcase.maxWeight
						);
					},
				},
				capacityPercentage: {
					needs: { maxCapacity: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const currentCapacity = calculateCurrentCapacity(items);

						return calculateCapacityPercentage(
							currentCapacity,
							suitcase.maxCapacity
						);
					},
				},
				itemCount: {
					needs: {},
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						return calculateItemCount(items);
					},
				},
				status: {
					needs: { maxCapacity: true, maxWeight: true },
					compute(suitcase: ISuitcase) {
						if (
							'suitcaseItems' in suitcase &&
							!suitcase?.suitcaseItems
						)
							return null;
						const items = Array.isArray(suitcase.suitcaseItems)
							? suitcase.suitcaseItems
							: [];

						const { maxWeight, maxCapacity } = suitcase;
						const currentCapacity = calculateCurrentCapacity(items);
						const currentWeight = calculateCurrentWeight(items);

						const itemCount = calculateItemCount(items);
						const isFull = checkIsFull(
							currentWeight,
							maxWeight,
							currentCapacity,
							maxCapacity
						);
						const isOverWeight = checkIsOverweight(
							currentWeight,
							suitcase.maxWeight
						);
						const isOverCapacity = checkIsOverCapacity(
							currentCapacity,
							suitcase.maxCapacity
						);

						return getContainerStatus(
							isOverWeight,
							isOverCapacity,
							isFull,
							itemCount
						);
					},
				},
			},
		},
	});

export default prisma;

// export const mockSuitcase: SuitcasesCreateInput= {
//     name: "Samsonite Spinner 55",
//     brand: "Samsonite",
//     type: "CARRY_ON",
//     color: "red",
//     size: "SMALL",

//     maxCapacity: 40,        // liters
//     maxWeight: 15,          // kg
//     suitcaseWeight: 3.0,    // empty suitcase weight

//     wheels: "FOUR_WHEEL",
//     material: "POLYESTER",
// };

// export const mockBag: BagsCreateInput = {
//     name: "Travel Backpack",
//     type: "BACKPACK",
//     color: "black",
//     size: "MEDIUM",

//     maxCapacity: 25,  // liters
//     maxWeight: 12,    // kg
//     bagWeight: 1.2,   // empty bag weight

//     material: "NYLON",
// };

// export const mockItems: ItemsCreateInput[] = [
//     {
//         id: "item-2",
//         name: "Laptop",
//         category: "ELECTRONICS",
//         quantity: 1,
//         weight: 2.5,
//         weightUnit: "KILOGRAM",
//         volume: 1.2,
//         volumeUnit: "LITER",
//         color: "gray",
//         isFragile: true,
//     },
//     {
//         id: "item-3",
//         name: "Perfume Bottle",
//         category: "TOILETRIES",
//         quantity: 2,
//         weight: 250, // grams
//         weightUnit: "GRAM",
//         volume: 100, // ml
//         volumeUnit: "ML",
//         color: "pink",
//         isFragile: true,
//     },
//     {
//         id: "item-1",
//         name: "T-Shirt",
//         category: "CLOTHING",
//         quantity: 3,
//         weight: 0.2,
//         weightUnit: "KILOGRAM",
//         volume: 0.5,
//         volumeUnit: "LITER",
//         color: "blue",
//         isFragile: false,
//     }
// ];

// export const mockUser: UserCreateInput = {
//     firstName: "mohamed",
//     lastName: "fathy",
//     birthDate: new Date("2000-04-10"),
//     email: "mohamed@example.com",
//     password: "password",
//     gender: "MALE",
// };

// const test = async () => {
//     const user = await prisma.user.create({
//         data: mockUser
//     })

//     const bag = await prisma.bags.create({
//         data: mockBag
//     })

//     const suitcase = await prisma.suitcases.create({
//         data: mockSuitcase,
//     })

//     await prisma.items.createMany({
//         data: mockItems,
//     })

//     const findUser = await prisma.user.findUnique({
//         where: { id: user.id },
//         include: {
//             items: {
//                 include: {
//                     bagItems: true,
//                     suitcaseItems: true
//                 }
//             },
//             suitcases: {
//                 include: {
//                     suitcaseItems: true
//                 }
//             },
//             bags: {
//                 include: {
//                     bagItems: true,
//                 }
//             }
//         }
//     })
//     const findBag = await prisma.bags.findUnique({
//         where: { id: bag.id },
//         include: {
//             bagItems: {
//                 include: {
//                     bag: true,
//                     item: true
//                 }
//             }
//         }
//     })
//     const findSuitcase = await prisma.suitcases.findUnique({
//         where: { id: suitcase.id },
//         include: {
//             suitcaseItems: {
//                 include: {
//                     suitcase: true,
//                     item: true
//                 }
//             }
//         }
//     })
//     const findItems = await prisma.items.findMany({})

//     console.log(`
//         *********************************
//         USER: ${findUser}
//         User Items: ${findUser?.items}
//         User bags: ${findUser?.bags}
//         User suitcase: ${findUser?.suitcases}
//         *************************************
//     `)

//     console.log(`
//         *********************************
//         Bag: ${findBag}
//         Bag Items: ${findBag?.bagItems}
//         *************************************
//     `)

//     console.log(`
//         *********************************
//         Suitcase: ${findSuitcase}
//         Suitcase Items: ${findSuitcase?.suitcaseItems}
//         *************************************
//     `)

//     console.log(`
//         *********************************
//         Items: ${findItems}
//         *************************************
//     `)
// }
