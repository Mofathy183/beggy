import request from "supertest";
import prisma from "../../../prisma/prisma.js";
import cookieParser from "cookie-parser";
import app from "../../../app.js";
import { hashingPassword } from "../../utils/hash.js"
import { signToken } from "../../utils/jwt.js";

let csrfToken;
let cookies;
const bags = [
    {
        name: "Bag 1",
        type: "laptop_bag",
        color: "green",
        size: "small",
        capacity: 11.2,
        maxWeight: 12.55,
        weight: 1.5,
        material: "nylon",
        features: ["usb_port"],
    },
    {
        name: "Bag 2",
        type: "backpack",
        color: "blue",
        size: "medium",
        capacity: 15.3,
        maxWeight: 16.88,
        weight: 2.2,
        material: "polyester",
        features: ["multiple_pockets"],
    },
    {
        name: "Bag 3",
        type: "travel_bag",
        color: "red",
        size: "large",
        capacity: 18.7,
        maxWeight: 20.33,
        weight: 2.8,
        material: "leather",
        features: ["lightweight"],
    },
    {
        name: "Bag 4",
        type: "duffel",
        color: "yellow",
        size: "extra_large",
        capacity: 21.9,
        maxWeight: 23.5,
        weight: 3.4,
        material: "fabric",
        features: ["trolley_sleeve"],
    },
    {
        name: "Bag 5",
        type: "tote",
        color: "purple",
        size: "small",
        capacity: 25.6,
        maxWeight: 27.11,
        weight: 4.1,
        material: "polyester",
        features: ["waterproof"],
    },
    {
        name: "Bag 6",
        type: "travel_bag",
        color: "pink",
        size: "large",
        capacity: 29.8,
        maxWeight: 31.33,
        weight: 4.7,
        material: "leather",
        features: ["waterproof"],
    },
    {
        name: "Bag 7",
        type: "handbag",
        color: "orange",
        size: "medium",
        capacity: 34.2,
        maxWeight: 35.77,
        weight: 5.3,
        material: "fabric",
        features:[ "waterproof"],
    }
]

beforeAll(async () => {
    const response = await request(app).get("/api/beggy/auth/csrf-token");
    cookies = response.headers["set-cookie"];
    csrfToken = response.body.data.csrfToken;
});

test("Should return a CSRF token", async () => {
    expect(csrfToken).toBeDefined();
});

describe("Base Bags Route Tests To get All Bags", () => {
    test("Should Get All Bags", async () => {
        await prisma.bags.createMany({
            data: bags,
        });

        const res = await request(app)
        .get("/api/beggy/bags/");

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved All Bags")
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(1);
    });
})

describe("Base Bags Route Tests To Get All Bags By Search", () => {
    test("Should get all Bags by search for Not Enum Fields", async () => {
        await prisma.bags.createMany({
            data: bags,
        });

        const res = await request(app)
        //* search by fields not Enum
        .get(`/api/beggy/bags/search?field=color&search=green,blue`);
        
        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved All Bags By Search")
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    })

    test("Should get all Bags by search for Enum Field", async () => {
        await prisma.bags.createMany({
            data: bags,
        });

        const res = await request(app)
        //* search by field Enum
        .get(`/api/beggy/bags/search?field=type&search=travel_bag,backpack`);
        
        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved All Bags By Search")
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    })
})

describe("Base Bags Route Tests To Get Bag By ID", () => {
    test("Should Get Bag By ID", async () => {
        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
            },
        });

        const res = await request(app)
        .get(`/api/beggy/bags/${bag.id}`);

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved Bag By ID")
        expect(res.body.data).toMatchObject({
            id: bag.id,
            name: "Test Bag 1",
            type: "LAPTOP_BAG",
            color: "green",
            size: "SMALL",
            capacity: 11.2,
            maxWeight: 12.55,
            weight: 1.5,
            material: "NYLON",
            features: ["USB_PORT"],
        })
    })
})

describe("Base Bags Route Tests To Replace Bag By ID For Admin and Member", () => {
    test("Should Replace Bag By ID as Admin", async () => {
        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
            },
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Don",
                email: "admin@example.com",
                password: await hashingPassword("password$1155"),
                role: "admin",
            },
        })

        const res = await request(app)
        .put(`/api/beggy/bags/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)
        .send({
            name: "Test Bag 1 Updated",
            type: "travel_bag",
            color: "blue",
            size: "medium",
            capacity: 13.5,
            maxWeight: 14.88,
            weight: 2.1,
            material: "polyester",
            features: ["multiple_pockets"],
        });

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Replaced Bag By ID")
        expect(res.body.data).toMatchObject({
            id: bag.id,
            name: "Test Bag 1 Updated",
            type: "TRAVEL_BAG",
            color: "blue",
            size: "MEDIUM",
            capacity: 13.5,
            maxWeight: 14.88,
            weight: 2.1,
            material: "POLYESTER",
            features: ["MULTIPLE_POCKETS"],
        })

        const updatedBag = await prisma.bags.findUnique({
            where: {
                id: bag.id,
            },
        });

        expect(updatedBag).toMatchObject({
            id: updatedBag.id,
            name: "Test Bag 1 Updated",
            type: "TRAVEL_BAG",
            color: "blue",
            size: "MEDIUM",
            capacity: 13.5,
            maxWeight: 14.88,
            weight: 2.1,
            material: "POLYESTER",
            features: ["MULTIPLE_POCKETS"],
        })
    })
})

describe("Base Bags Route Tests To Modify Bag By ID For Admin and Member", () => {
    test("Should Modify Bag By ID as Member", async () => {
        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
            },
        });

        const member = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "member@example.com",
                password: await hashingPassword("password$1155"),
                role: "member",
            },
        })

        const res = await request(app)
        .patch(`/api/beggy/bags/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(member.id)}`)
        .send({
            type: "travel_bag",
            size: "medium",
            material: "polyester",
            features: ["multiple_pockets"],
        });

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Replaced Bag By ID")
        expect(res.body.data).toMatchObject({
            id: bag.id,
            type: "TRAVEL_BAG",
            size: "MEDIUM",
            material: "POLYESTER",
            features: ["MULTIPLE_POCKETS"],
        });

        const updatedBag = await prisma.bags.findUnique({
            where: {
                id: bag.id,
            },
        });

        expect(updatedBag).toMatchObject({
            id: updatedBag.id,
            type: "TRAVEL_BAG",
            size: "MEDIUM",
            material: "POLYESTER",
            features: ["MULTIPLE_POCKETS"],
        })
    });
})

describe("Base Bags Route Tests To Delete Bag By ID For Admin and Member", () => {
    test("Should Delete Bag By ID as Admin", async () => {
        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
            },
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "admin@example.com",
                password: await hashingPassword("password$1155"),
                role: "admin",
            },
        })

        const res = await request(app)
        .delete(`/api/beggy/bags/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted Bag By ID")
        expect(res.body.data).toMatchObject({
            id: bag.id,
            name: "Test Bag 1",
            type: "LAPTOP_BAG",
            color: "green",
            size: "SMALL",
            capacity: 11.2, 
            maxWeight: 12.55,
            weight: 1.5,
            material: "NYLON",
            features: ["USB_PORT"],
        });

        const deletedBag = await prisma.bags.findUnique({
            where: {
                id: bag.id,
            },
        });

        expect(deletedBag).toBeNull();
    });
})


describe("Base Bags Route Tests To Delete All Bags From DB For Only Admin", () => {
    test("Should Delete All Bags As Admin", async () => {
        await prisma.bags.createMany({
            data: bags,
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "admin@example.com",
                password: await hashingPassword("password$1155"),
                role: "admin",
            },
        })

        const res = await request(app)
        .delete(`/api/beggy/bags/delete-all`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)
        .send({
            confirmDelete: true
        })
        
        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Delete All Bags")

        const findBags = await prisma.bags.findMany();

        expect(findBags).toHaveLength(0);
    });
})

//*=============================={Bags Route For User}===================================

describe("Bags Route For User For Get All Bags Belongs To User", () => {
    test("Should Get All Bags Belongs To User", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const manyBags = bags.map(bag => ({
            ...bag,
            userId: user.id, 
        }));

        await prisma.bags.createMany({
            data: manyBags,
        });

        const res = await request(app)
        .get(`/api/beggy/bags/user`)
        .set("Authorization", `Bearer ${signToken(user.id)}`)

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved Bags User Has")
        expect(res.body.data.length).toBeGreaterThan(4);
    });

    test("Should Get All Bags Belongs To User By searching", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const manyBags = bags.map(bag => ({
            ...bag,
            userId: user.id, 
        }));

        await prisma.bags.createMany({
            data: manyBags,
        });

        const res = await request(app)
        .get(`/api/beggy/bags/user?field=features&search=usb_port`)
        .set("Authorization", `Bearer ${signToken(user.id)}`)

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved Bags User Has")
        expect(res.body.data.length).toBeGreaterThan(0);
    });
})

describe("Bags Route For User For Get User Bag By Its ID", () => {
    test("Should Get User Bag By Its ID", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        const res = await request(app)
        .get(`/api/beggy/bags/user/${bag.id}`)
        .set("Authorization", `Bearer ${signToken(user.id)}`)

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Retrieved Bag User Has")
        expect(res.body.data).toMatchObject({
            id: bag.id,
            name: "Test Bag 1",
            type: "LAPTOP_BAG",
            color: "green",
            size: "SMALL",
            capacity: 11.2,
            maxWeight: 12.55,
            weight: 1.5,
            material: "NYLON",
            features: ["USB_PORT"],
            userId: user.id,
        });
    });
})

describe("Bags Route For User For Create Bag For User", () => {
    test("Should Create Bag For User", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const res = await request(app)
        .post(`/api/beggy/bags/user`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({
            name: "Test Bag 1",
            type: "laptop_bag",
            color: "green",
            size: "small",
            capacity: 11.2,
            maxWeight: 12.55,
            weight: 1.5,
            material: "nylon",
            features: ["usb_port"],
        });

        console.log("Response", res.body);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Created Bag For User")
        expect(res.body.data).toMatchObject({
            name: "Test Bag 1",
            type: "LAPTOP_BAG",
            color: "green",
            size: "SMALL",
            capacity: 11.2,
            maxWeight: 12.55,
            weight: 1.5,
            material: "NYLON",
            features: ["USB_PORT"],
            userId: user.id,
        });

        const findBag = await prisma.bags.findFirst({
            where: {
                id: res.body.data.id,
            },
        });

        expect(findBag).toBeTruthy();
    });
})

describe("Bags Route For User For Add User's Item To User's Bag", () => {
    test("Should Add User's Item By Id To User's Bag", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        const item = await prisma.items.create({
            data: {
                name: "Test Item 1",
                category: "electronics",
                color: "blue",
                weight: .2,
                quantity: 10,
                volume: .5,
                userId: user.id,
            },
        })

        const res = await request(app)
        .post(`/api/beggy/bags/user/item/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        //* Send ItemId in the body
        .send({
            itemId: item.id,
        });

        console.log("Response", res.body);
        console.log("bag Items", res.body.data.bagItems);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Added User's Item To User's Bag")
    });
})

describe("Bags Route For User For Add User's Items To User's Bag", () => {
    test("Should add Items By Its IDs To the bag", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        await prisma.items.createMany({
            data: [
                {
                    name: "Test Item 1",
                    category: "electronics",
                    color: "blue",
                    weight: .2,
                    quantity: 10,
                    volume: .5,
                    userId: user.id,
                },
                {
                    name: "Test Item 3",
                    category: "medicine",
                    color: "red",
                    weight: .8,
                    quantity: 5,
                    volume: .10,
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    category: "furniture",
                    color: "blue",
                    weight: .4,
                    quantity: 2,
                    volume: .7,
                    userId: user.id,
                },
            ]
        })

        const items = await prisma.items.findMany({
            where: {userId: user.id}
        })

        const myItems = items.map((itemId) => {
            return {itemId: itemId.id}
        })


        const res = await request(app)
        .post(`/api/beggy/bags/user/items/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        //* Send ItemsIds in the body
        .send({
            itemsIds: myItems,
        });

        console.log("Response", res.body);
        console.log("Response Bag Items", res.body.data.bagItems);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Added User's Items To User's Bag")
        expect(res.body.data.bagItems).toHaveLength(items.length);
    })
});


describe("Bags Route For User For Replace User's Bag", () => {
    test("Should Replace User's Bag", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        const res = await request(app)
        .put(`/api/beggy/bags/user/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({
            name: "Updated Test Bag 1",
            type: "backpack",
            color: "blue",
            size: "medium",
            capacity: 15.2,
            maxWeight: 17.55,
            weight: 2.5,
            material: "leather",
            features: ["waterproof", "expandable"],
        });

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Replace User's Bag")
        expect(res.body.data).toMatchObject({
            name: "Updated Test Bag 1",
            type: "BACKPACK",
            color: "blue",
            size: "MEDIUM",
            capacity: 15.2,
            maxWeight: 17.55,
            weight: 2.5,
            material: "LEATHER",
            features: ["WATERPROOF", "EXPANDABLE"],
        })
    })
})

describe("Bags Route For User For Modify User's Bag", () => {
    test("Should Modify User's Bag", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port", "anti_theft", "multiple_pockets", "waterproof"],
                userId: user.id,
            },
        });

        const res = await request(app)
        .patch(`/api/beggy/bags/user/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({
            material: "leather",
            features: ["waterproof", "expandable"],
            removeFeatures: ["usb_port", "multiple_pockets"],
        });

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Modified User's Bag")
        expect(res.body.data).toMatchObject({
            material: "LEATHER",
            features: [ 'WATERPROOF', 'EXPANDABLE', 'ANTI_THEFT' ],
        })
    });
})

describe("Bags Route For User For Delete All User's Bags", () => {
    test("Should Delete All User's Bags", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        await prisma.bags.createMany({
            data: [
                {
                    name: "Test Bag 1",
                    type: "laptop_bag",
                    color: "green",
                    size: "small",
                    capacity: 11.2,
                    maxWeight: 12.55,
                    weight: 1.5,
                    material: "nylon",
                    features: ["usb_port", "anti_theft", "multiple_pockets", "waterproof"],
                    userId: user.id,
                },
                {
                    name: "Test Bag 2",
                    type: "backpack",
                    color: "blue",
                    size: "medium",
                    capacity: 15.2,
                    maxWeight: 17.55,
                    weight: 2.5,
                    material: "leather",
                    features: ["waterproof", "expandable", "anti_theft"],
                    userId: user.id,
                },
            ]
        });

        const res = await request(app)
        .delete(`/api/beggy/bags/user/all`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`);

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted All User's Bags");
        expect(res.body.data.count).toBe(2);
    });
})

describe("Bags Route For User For Delete User's Bags By ID", () => {
    test("Should Delete User's Bag By ID", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag1 = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port", "anti_theft", "multiple_pockets", "waterproof"],
                userId: user.id,
            },
        });

        const res = await request(app)
        .delete(`/api/beggy/bags/user/${bag1.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`);

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted User's Bag");
    });
})

describe("Bags Route For User For Delete All User's Bags By Search", () => {
    test("Should Delete All User's Bags By Search", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        await prisma.bags.createMany({
            data: [
                {
                    name: "Test Bag 1",
                    type: "laptop_bag",
                    color: "green",
                    size: "small",
                    capacity: 11.2,
                    maxWeight: 12.55,
                    weight: 1.5,
                    material: "nylon",
                    features: ["usb_port", "anti_theft", "multiple_pockets", "waterproof"],
                    userId: user.id,
                },
                {
                    name: "Test Bag 2",
                    type: "backpack",
                    color: "blue",
                    size: "medium",
                    capacity: 15.2,
                    maxWeight: 17.55,
                    weight: 2.5,
                    material: "leather",
                    features: ["waterproof", "expandable", "anti_theft"],
                    userId: user.id,
                },
            ]
        })

        const res = await request(app)
        .delete(`/api/beggy/bags/user/all/search?field=material&search=nylon`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`);

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted All User's Bags By Search Filter");
        expect(res.body.data.count).toBe(1);
    });
})

describe("Bags Route For User For Delete Items User's Bags", () => {
    test("Should Delete Items By They IDs from User's Bags", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        await prisma.items.createMany({
            data: [
                {
                    name: "Test Item 1",
                    category: "electronics",
                    color: "blue",
                    weight: .2,
                    quantity: 10,
                    volume: .5,
                    userId: user.id,
                },
                {
                    name: "Test Item 3",
                    category: "medicine",
                    color: "red",
                    weight: .8,
                    quantity: 5,
                    volume: .10,
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    category: "furniture",
                    color: "blue",
                    weight: .4,
                    quantity: 2,
                    volume: .7,
                    userId: user.id,
                },
            ]
        })

        const items = await prisma.items.findMany({
            where: {userId: user.id}
        })

        const myItems = items.map((itemId) => {
            return itemId.id
        })

        await prisma.bagItems.createMany({
            data: myItems.map((item) => {
                return {
                    itemId: item,
                    bagId: bag.id,
                }
            })
        })

        const res = await request(app)
        .delete(`/api/beggy/bags/user/items/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({itemsIds: myItems});

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted Items From User's Bag");
        expect(res.body.meta.totalDelete).toBe(3);
    });
})

describe("Bags Route For User For Delete Item From User's Bag", () => {
    test("Should Delete Item By Its ID From User's Bag", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        await prisma.items.createMany({
            data: [
                {
                    name: "Test Item 1",
                    category: "electronics",
                    color: "blue",
                    weight: .2,
                    quantity: 10,
                    volume: .5,
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    category: "furniture",
                    color: "blue",
                    weight: .4,
                    quantity: 2,
                    volume: .7,
                    userId: user.id,
                },
            ]
        })

        const item = await prisma.items.findMany({
            where: {userId: user.id}
        })

        await prisma.bagItems.createMany({
            data: item.map(i => {
                return {
                    itemId: i.id,
                    bagId: bag.id,
                }
            })
        })

        const res = await request(app)
        .delete(`/api/beggy/bags/user/item/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({itemId: item[0].id});

        console.log("Response", res.body);
        console.log("Bag Items", res.body.data.bagItems);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted Item From User's Bag");
        expect(res.body.meta.totalDelete).toBe(1);
    });
})

describe("Bags Route For User For Delete All Items In User's Bag", () => {
    test("Should Delete All Items From User's Bag", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "user@example.com",
                password: await hashingPassword("password$1155"),
                role: "user",
            },
        })

        const bag = await prisma.bags.create({
            data: {
                name: "Test Bag 1",
                type: "laptop_bag",
                color: "green",
                size: "small",
                capacity: 11.2,
                maxWeight: 12.55,
                weight: 1.5,
                material: "nylon",
                features: ["usb_port"],
                userId: user.id,
            },
        });

        await prisma.items.createMany({
            data: [
                {
                    name: "Test Item 1",
                    category: "electronics",
                    color: "blue",
                    weight: .2,
                    quantity: 10,
                    volume: .5,
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    category: "furniture",
                    color: "blue",
                    weight: .4,
                    quantity: 2,
                    volume: .7,
                    userId: user.id,
                },
            ]
        })

        const item = await prisma.items.findMany({
            where: {userId: user.id}
        })

        await prisma.bagItems.createMany({
            data: item.map(i => {
                return {
                    itemId: i.id,
                    bagId: bag.id,
                }
            })
        })

        const res = await request(app)
        .delete(`/api/beggy/bags/user/items/all/${bag.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted All Items From User's Bag");
        expect(res.body.meta.totalDelete).toBe(2);
    });
    
});
