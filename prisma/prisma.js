import { PrismaClient } from "@prisma/client";
import { 
//*======={User}========
    addUserGender,
    getDisplayName, 
    getAge,
//*======={User}========
//*======={Suitcase and Bags}========
    getCurrentWeight,
    getIsWeightExceeded,
    getCurrentCapacity,
    getIsCapacityExceeded,
//*======={Suitcase and Bags}========
//*======={Items}========
    addItemCategory,
//*======={Items}========
//*======={Account}========
    addAccountProvider,
//*======={Account}========
} from "./prismaHelper.js";


//* add extension for Prisma to get the age of the user and the display name
const prisma = new PrismaClient().$extends({
    query: {
        user: {
            async create({ args, query }){ return addUserGender(args, query) },
            async update({ args, query }){ return addUserGender(args, query) },
        },
        items: {
            async create({ args, query }){ return addItemCategory(args, query) },
            async update({ args, query }){ return addItemCategory(args, query) },
        },
        accoount: {
            async create({ args, query }){ return addAccountProvider(args, query) },
            async update({ args, query }){ return addAccountProvider(args, query) },
        }
    },
    result: {
        user: {
            displayName: {
                compute(user) {
                    return getDisplayName(user.firstName, user.lastName);
                }
            },
            age: {
                compute(user) {
                    return getAge(user.birth);
                }
            }
        },
        suitcases: {
            currentWeight: {
                compute(suitcases){
                    return getCurrentWeight(suitcases.items)
                }
            },
            isWeightExceeded: {
                compute(suitcases){
                    return getIsWeightExceeded(suitcases.items, suitcases.maxWeight);
                }
            },
            currentCapacity: {
                compute(suitcases){
                    return getCurrentCapacity(suitcases.items)
                }
            },
            getisCapacityExceeded: {
                compute(suitcases){
                    return getIsCapacityExceeded(suitcases.items, suitcases.capacity);
                }
            },
        },
        bags: {
            currentWeight: {
                compute(bags){
                    return getCurrentWeight(bags.items)
                }
            },
            isWeightExceeded: {
                compute(bags){
                    return getIsWeightExceeded(bags.items, bags.maxWeight);
                }
            },
            currentCapacity: {
                compute(bags){
                    return getCurrentCapacity(bags.items)
                }
            },
            getisCapacityExceeded: {
                compute(bags){
                    return getIsCapacityExceeded(bags.items, bags.capacity);
                }
            },
        },
    }
});



export const UserModel = prisma.user;
export const AccountModel = prisma.accoount;
export const BagsModel = prisma.bags;
export const SuitcasesModel = prisma.suitcases;
export const ItemsModel = prisma.items;

async function main() {
    const user = await UserModel.findUnique({where: { id: "3598eed4-f1c3-4248-8600-d7115ba37376" } })
    console.log( user.age, user.displayName)
    return
}

// await main()

