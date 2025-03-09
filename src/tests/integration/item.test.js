import request from "supertest";
import prisma from "../../../prisma/prisma.js";
import app from "../../../app.js";
import { hashingPassword } from "../../utils/hash.js";
import { birthOfDate } from "../../utils/userHelper.js"
import { signToken } from "../../utils/jwt.js";
import { beforeEach } from "@jest/globals";

let csrfToken;
let cookies;
let user;
const items = [
    {
        name: "Test Item 1",
        quantity: 100,
        category: "clothing",
        weight: 1.5,
        volume: 0.05,
        color: "blue",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
    {
        name: "Test Item 1",
        quantity: 100,
        category: "clothing",
        weight: 1.5,
        volume: 0.05,
        color: "blue",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
    {
        name: "Test Item 1",
        quantity: 100,
        category: "clothing",
        weight: 1.5,
        volume: 0.05,
        color: "blue",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
    {
        name: "Test Item 1",
        quantity: 100,
        category: "clothing",
        weight: 1.5,
        volume: 0.05,
        color: "blue",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
    {
        name: "Test Item 1",
        quantity: 100,
        category: "clothing",
        weight: 1.5,
        volume: 0.05,
        color: "blue",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
    {
        name: "Test Item 1",
        quantity: 100,
        category: "clothing",
        weight: 1.5,
        volume: 0.05,
        color: "blue",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
    {
        name: "Test Item 2",
        quantity: 50,
        category: "electronics",
        weight: 0.5,
        volume: 0.01,
        color: "red",
    },
    {
        name: "Test Item 3",
        quantity: 20,
        category: "books",
        weight: 0.2,
        volume: 0.005,
        color: "green",
    },
];

beforeAll(async () => {
    const response = await request(app).get("/api/beggy/auth/csrf-token");
    cookies = response.headers["set-cookie"];
    csrfToken = response.body.data.csrfToken;
});

test("Should return a CSRF token", async () => {
    expect(csrfToken).toBeDefined();
});

describe("Base Items Route Tests for get All Items", () => {
    test("Get All Items", async () => {
        await prisma.items.createMany({
            data: items,
        });

        const response = await request(app)
        .get("/api/beggy/items/");

        console.log("Response", response.body);
        console.log("Response data", response.body.data);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });
});

describe("Base Items Route Tests For Get Item By ID", () => {
    test("Should return Item by ID", async () => {
        const item = await prisma.items.create({
            data: {
                name: "Test Item 1",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
            }
        });

        const res = await request(app).get(`/api/beggy/items/${item.id}`);

        console.log("Response", res.body);
        console.log("Response data", res.body.data);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully found item by id")
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Test Item 1",
            quantity: 100,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "blue",
        });
    })
})

describe("Base Items Route Tests For Search for Items", () => {
    beforeEach(async () => {
        // Create test items once before all tests
        await prisma.items.createMany({
            data: items,
        });
    });

    test("Should return items by search query If there is no Match to the Query", async () => {
        const res = await request(app)
        //* There is no match for color yellow
        .get(`/api/beggy/items/search?field=color&search=yellow`);
        
        console.log("Response Not Match", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully found all items by Search");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
    });

    test("Should return items by search query if there are Match to the search", async () => {
        const res = await request(app)
        //* There is a match for color blue
        .get(`/api/beggy/items/search?field=category&search=electronics`);
        
        console.log("Response Match for Search", res.body);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully found all items by Search");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    })

    test("Should return items by Search and Order and Pagination if there are Match", async () => {
        const res = await request(app)
        .get("/api/beggy/items/search?field=category&search=electronics&page=2&limit=4&order=desc&sortBy=volume")

        console.log("Response For Search and Order and Pagination", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully found all items by Search");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    })
})


describe("Base Items Route Tests For Replace By ID For Admin and Member Only", () => {
    test("Should replace items by ID", async () => {
        const item = await prisma.items.create({
            data: {
                name: "Test Item",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
            }
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                role: "admin",
            }
        })

        const res = await request(app)
        .put(`/api/beggy/items/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)
        .send({
            name: "Updated-Test Item 1",
            quantity: 150,
            category: "electronics",
            weight: 2,
            volume: 0.1,
            color: "red",
        })

        console.log("Response", res.body);
        console.log("Response data", res.body.data);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Replaced Item by ID")
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Updated-Test Item 1",
            quantity: 150,
            category: "ELECTRONICS",
            weight: 2,
            volume: 0.1,
            color: "red",
        });
        
        const updatedItem = await prisma.items.delete({
            where: {
                id: item.id,
            }
        });

        console.log("Updated Item", updatedItem);

        expect(updatedItem).not.toBeNull();
        expect(updatedItem).toMatchObject({
            id: item.id,
            name: "Updated-Test Item 1",
            quantity: 150,
            category: "ELECTRONICS",
            weight: 2,
            volume: 0.1,
            color: "red",
        });
    })
})


describe("Base Item Route Tests For Modify Item For Admin and Member Only", () => {
    test("Should modify the item By ID", async () => {
        const item = await prisma.items.create({
            data: {
                name: "Test Item",
                quantity: 50,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
            }
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                role: "admin",
            }
        })

        const res = await request(app)
        .patch(`/api/beggy/items/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)
        .send({
            quantity: 200,
            color: "green",
        })

        console.log("Response", res.body);
        console.log("Response data", res.body.data);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Modified Item by ID")
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Test Item",
            quantity: 200,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "green",
        });

        const updatedItem = await prisma.items.delete({
            where: {
                id: item.id,
            }
        });

        console.log("Updated Item", updatedItem);

        expect(updatedItem).not.toBeNull();
        expect(updatedItem).toMatchObject({
            id: item.id,
            name: "Test Item",
            quantity: 200,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "green",
        })
    })
})

describe("Base Items Route Tests For Deleted Item By ID for Admin and Member Only", () => {
    test("Should delete the item By ID", async () => {
        const item = await prisma.items.create({
            data: {
                name: "Test Item",
                quantity: 50,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
            }
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                role: "admin",
            }
        })

        const res = await request(app)
        .delete(`/api/beggy/items/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)
        
        console.log("Response", res.body);
        console.log("Response data", res.body.data);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted Item by ID")
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Test Item",
            quantity: 50,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "blue",
        });

        const deletedItem = await prisma.items.findUnique({
            where: {
                id: item.id,
            }
        });

        console.log("Deleted Item", deletedItem);

        expect(deletedItem).toBeNull();
    });
})

describe("Base Items Route Tests For Delete All Items for Admin Only", () => {
    test("Should delete all items", async () => {
        await prisma.items.createMany({
            data: items
        });

        const admin = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                role: "admin",
            }
        })

        const res = await request(app)
        .delete(`/api/beggy/items/delete-all`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(admin.id)}`)
        .send({
            confirmDelete: true
        });

        console.log("Response", res.body);
        console.log("Response data", res.body.data);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Delete All Items")
        // expect(res.body.data).toBe(null);

        const deletedItems = await prisma.items.findMany();

        console.log("Deleted Items", deletedItems);

        expect(deletedItems).toHaveLength(0);
    });
})



////*============================={Items Route For User}============================

describe("Items Route For User to Get Item User Has By ID", () => {
    test("Should get item Belongs To User by ID", async () => {
        const user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
            }
        });

        const item = await prisma.items.create({
            data: {
                name: "Test Item",
                quantity: 50,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
                userId: user.id,
            }
        });

        const res = await request(app)
        .get(`/api/beggy/items/user/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`);

        console.log("Response", res.body);
        console.log("Response data", res.body.data);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Found Item User Has By ID")
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Test Item",
            quantity: 50,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "blue",
        });
    });
})

describe("Items Route For User to Get All Items User Has", () => {
    beforeEach(async () => {
        user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            }
        });

        const items = await prisma.items.createMany({
            data: [
                {
                    name: "Test Item 1",
                    quantity: 50,
                    category: "clothing",
                    weight: 1.5,
                    volume: 0.05,
                    color: "blue",
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    quantity: 100,
                    category: "electronics",
                    weight: 2.5,
                    volume: 0.1,
                    color: "red",
                    userId: user.id,
                },

                {
                    name: "Test Item 3",
                    quantity: 200,
                    category: "books",
                    weight: 0.75,
                    volume: 0.025,
                    color: "green",
                    userId: user.id,
                },

                {
                    name: "Test Item 4",
                    quantity: 75,
                    category: "accessories",
                    weight: 0.25,
                    volume: 0.005,
                    color: "yellow",
                    userId: user.id,
                },

                {
                    name: "Test Item 5",
                    quantity: 300,
                    category: "furniture",
                    weight: 1.25,
                    volume: 0.05,
                    color: "purple",
                    userId: user.id,
                },
                {
                    name: "Test Item 1",
                    quantity: 50,
                    category: "clothing",
                    weight: 1.5,
                    volume: 0.05,
                    color: "blue",
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    quantity: 100,
                    category: "electronics",
                    weight: 2.5,
                    volume: 0.1,
                    color: "red",
                    userId: user.id,
                },

                {
                    name: "Test Item 3",
                    quantity: 200,
                    category: "books",
                    weight: 0.75,
                    volume: 0.025,
                    color: "green",
                    userId: user.id,
                },

                {
                    name: "Test Item 4",
                    quantity: 75,
                    category: "accessories",
                    weight: 0.25,
                    volume: 0.005,
                    color: "yellow",
                    userId: user.id,
                },

                {
                    name: "Test Item 5",
                    quantity: 300,
                    category: "furniture",
                    weight: 1.25,
                    volume: 0.05,
                    color: "purple",
                    userId: user.id,
                },
                {
                    name: "Test Item 1",
                    quantity: 50,
                    category: "clothing",
                    weight: 1.5,
                    volume: 0.05,
                    color: "blue",
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    quantity: 100,
                    category: "electronics",
                    weight: 2.5,
                    volume: 0.1,
                    color: "red",
                    userId: user.id,
                },

                {
                    name: "Test Item 3",
                    quantity: 200,
                    category: "books",
                    weight: 0.75,
                    volume: 0.025,
                    color: "green",
                    userId: user.id,
                },

                {
                    name: "Test Item 4",
                    quantity: 75,
                    category: "accessories",
                    weight: 0.25,
                    volume: 0.005,
                    color: "yellow",
                    userId: user.id,
                },

                {
                    name: "Test Item 5",
                    quantity: 300,
                    category: "furniture",
                    weight: 1.25,
                    volume: 0.05,
                    color: "purple",
                    userId: user.id,
                },
            ]
        });
    })

    test("Should get all items Belongs To User", async () => {
        const res = await request(app)
        .get(`/api/beggy/items/user`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`);
        
        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Found All Items User Has")
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(5);
    });

    test("Should get paginated items Belongs To User", async () => {
        const res = await request(app)
        .get(`/api/beggy/items/user?page=2&limit=5`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`);

        console.log("Response", res.body);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Found All Items User Has")
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(5);
    });
})

describe("Items Route For User To Create Item For User", () => {
    test("Should create a new item For User", async () => {
        user = await prisma.user.create({
            data: {
                firstName: 'John',
                lastName: 'Doe',
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            },
        })

        const res = await request(app)
        .post(`/api/beggy/items/user`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({
            name: "Test Item 1",
            quantity: 50,
            category: "clothing",
            weight: 1.5,
            volume: 0.05,
            color: "blue",
        });

        console.log("Response", res.body);
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Item Created Successfully For User");
        expect(res.body.data).toMatchObject({
            name: "Test Item 1",
            quantity: 50,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "blue",
            userId: user.id,
        });
    })
})

describe("Items Route For User to Create Items For User", () => {
    test("Should create Items for User", async () => {
        user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            }
        });

        const items = [
            {
                name: "Test Item 1",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
            },
            {
                name: "Test Item 2",
                quantity: 50,
                category: "electronics",
                weight: 0.5,
                volume: 0.01,
                color: "red",
            },
            {
                name: "Test Item 3",
                quantity: 20,
                category: "books",
                weight: 0.2,
                volume: 0.005,
                color: "green",
            },
            {
                name: "Test Item 1",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
            },
            {
                name: "Test Item 2",
                quantity: 50,
                category: "electronics",
                weight: 0.5,
                volume: 0.01,
                color: "red",
            },
        ]

        const res = await request(app)
        .post("/api/beggy/items/user/multiple")
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send(items)

        console.log("Response", res.body);
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Items Created Successfully For User");
        expect(res.body.data).toHaveProperty("count")
        expect(res.body.data.count).toBe(items.length);
    })
})

describe("Items Route For User to Replace an Item User Has", () => {
    test("Should replace an item Belongs To User", async () => {
        user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            }
        });

        const item = await prisma.items.create({
            data: {
                name: "Test Item 1",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
                userId: user.id,
            }
        });

        const res = await request(app)
        .put(`/api/beggy/items/user/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({
            name: "Updated Test Item 1",
            quantity: 50,
            category: "electronics",
            weight: 0.5,
            volume: 0.01,
            color: "red",
        });

        console.log("Response", res.body);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Replaced Item Belongs to User");
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Updated Test Item 1",
            quantity: 50,
            category: "ELECTRONICS",
            weight: 0.5,
            volume: 0.01,
            color: "red",
            userId: user.id,
        });

        const updatedItem = await prisma.items.findUnique({
            where: {
                id: item.id
            }
        });

        expect(updatedItem).toMatchObject({
            id: item.id,
            name: "Updated Test Item 1",
            quantity: 50,
            category: "ELECTRONICS",
            weight: 0.5,
            volume: 0.01,
            color: "red",
            userId: user.id,
        })
    });
})

describe("Items Route For User to Modify Item User Has", () => {
    test("Should modify an item Belongs To User", async () => {
        user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            }
        });

        const item = await prisma.items.create({
            data: {
                name: "Test Item 1",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
                userId: user.id,
            }
        });

        const res = await request(app)
        .patch(`/api/beggy/items/user/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)
        .send({
            name: "Updated Test Item 1",
            category: "electronics",
            color: "red",
        })

        console.log("Response", res.body);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Modified Item Belongs to User");
        expect(res.body.data).toMatchObject({
            id: item.id,
            name: "Updated Test Item 1",
            quantity: 100,
            category: "ELECTRONICS",
            weight: 1.5,
            volume: 0.05,
            color: "red",
            userId: user.id,
        });

        const updatedItem = await prisma.items.findUnique({
            where: {
                id: item.id
            }
        });

        expect(updatedItem).toMatchObject({
            id: item.id,
            name: "Updated Test Item 1",
            quantity: 100,
            category: "ELECTRONICS",
            weight: 1.5,
            volume: 0.05,
            color: "red",
            userId: user.id,
        })
    });
})

describe("Items Route For User to Delete Item User Has By ID", () => {
    test("Should delete an item Belongs To User", async () => {
        user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            }
        });

        const item = await prisma.items.create({
            data: {
                name: "Test Item 1",
                quantity: 100,
                category: "clothing",
                weight: 1.5,
                volume: 0.05,
                color: "blue",
                userId: user.id,
            }
        });

        const res = await request(app)
        .delete(`/api/beggy/items/user/${item.id}`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)

        console.log("Response", res.body);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted Item Belongs to User");
        expect(res.body.data).toMatchObject({
            id: item.id,
            userId: user.id,
            name: "Test Item 1",
            quantity: 100,
            category: "CLOTHING",
            weight: 1.5,
            volume: 0.05,
            color: "blue",
        });
    });
})

describe("Items Route For User To Delete All Items User Has", () => {
    beforeEach(async () => {
        user = await prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: await hashingPassword("password"),
                birth: birthOfDate("2003-06-18")
            }
        });

        const items = await prisma.items.createMany({
            data: [
                {
                    name: "Test Item 1",
                    userId: user.id,
                    quantity: 50,
                    category: "clothing",
                    weight: 1.5,
                    volume: 0.05,
                    color: "blue",
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    userId: user.id,
                    quantity: 100,
                    category: "electronics",
                    weight: 2.5,
                    volume: 0.1,
                    color: "red",
                    userId: user.id,
                },

                {
                    name: "Test Item 3",
                    userId: user.id,
                    quantity: 200,
                    category: "books",
                    weight: 0.75,
                    volume: 0.025,
                    color: "green",
                    userId: user.id,
                },

                {
                    name: "Test Item 4",
                    userId: user.id,
                    quantity: 75,
                    category: "accessories",
                    weight: 0.25,
                    volume: 0.005,
                    color: "yellow",
                    userId: user.id,
                },

                {
                    name: "Test Item 5",
                    userId: user.id,
                    quantity: 300,
                    category: "furniture",
                    weight: 1.25,
                    volume: 0.05,
                    color: "purple",
                    userId: user.id,
                },
                {
                    name: "Test Item 1",
                    userId: user.id,
                    quantity: 50,
                    category: "clothing",
                    weight: 1.5,
                    volume: 0.05,
                    color: "blue",
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    userId: user.id,
                    quantity: 100,
                    category: "electronics",
                    weight: 2.5,
                    volume: 0.1,
                    color: "red",
                    userId: user.id,
                },

                {
                    name: "Test Item 3",
                    userId: user.id,
                    quantity: 200,
                    category: "books",
                    weight: 0.75,
                    volume: 0.025,
                    color: "green",
                    userId: user.id,
                },

                {
                    name: "Test Item 4",
                    userId: user.id,
                    quantity: 75,
                    category: "accessories",
                    weight: 0.25,
                    volume: 0.005,
                    color: "yellow",
                    userId: user.id,
                },

                {
                    name: "Test Item 5",
                    userId: user.id,
                    quantity: 300,
                    category: "furniture",
                    weight: 1.25,
                    volume: 0.05,
                    color: "purple",
                    userId: user.id,
                },
                {
                    name: "Test Item 1",
                    userId: user.id,
                    quantity: 50,
                    category: "clothing",
                    weight: 1.5,
                    volume: 0.05,
                    color: "blue",
                    userId: user.id,
                },
                {
                    name: "Test Item 2",
                    userId: user.id,
                    quantity: 100,
                    category: "electronics",
                    weight: 2.5,
                    volume: 0.1,
                    color: "red",
                    userId: user.id,
                },

                {
                    name: "Test Item 3",
                    userId: user.id,
                    quantity: 200,
                    category: "books",
                    weight: 0.75,
                    volume: 0.025,
                    color: "green",
                    userId: user.id,
                },

                {
                    name: "Test Item 4",
                    userId: user.id,
                    quantity: 75,
                    category: "accessories",
                    weight: 0.25,
                    volume: 0.005,
                    color: "yellow",
                    userId: user.id,
                },

                {
                    name: "Test Item 5",
                    userId: user.id,
                    quantity: 300,
                    category: "furniture",
                    weight: 1.25,
                    volume: 0.05,
                    color: "purple",
                    userId: user.id,
                },
            ]
        });
    })


    test("Should delete all items Belongs To User", async () => {
        const res = await request(app)
        .delete(`/api/beggy/items/user/all`)
        .set("Cookie", cookies)
        .set("X-XSRF-TOKEN", csrfToken)
        .set("Authorization", `Bearer ${signToken(user.id)}`)

        console.log("Response", res.body);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Successfully Deleted All Items Belongs to User");
        expect(res.body.data).toHaveProperty("count");
        expect(res.body.data.count).toBeGreaterThan(10);

        const deletedItems = await prisma.items.findMany({
            where: {
                userId: user.id,
            },
        });

        expect(deletedItems).toHaveLength(0);
    });
})