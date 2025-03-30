const { sequelize } = require("../configs/dbConnection");
const { Op } = require("sequelize");
const passwordEncrypt = require("./passEncrypt");

const { User, Firm, Material, Purchase, Product, Vehicle, Sale, Production, Delivery, SaleAccount, PurchaseAccount } = require('..//models');

// common data and functions
const productNames = ["C20", "C25", "C30", "C35", "C40", "C45", "C50", "C55"];

const materialsData = [
    { STONE: 1.2, SAND: 1.3, CEMENT: 140 },
    { STONE: 1.3, SAND: 1.4, CEMENT: 150 },
    { STONE: 1.4, SAND: 1.5, CEMENT: 160 },
    { STONE: 1.5, SAND: 1.6, CEMENT: 170 },
    { STONE: 1.6, SAND: 1.7, CEMENT: 180 },
    { STONE: 1.7, SAND: 1.8, CEMENT: 190 },
    { STONE: 1.8, SAND: 1.9, CEMENT: 200 },
    { STONE: 1.9, SAND: 2.0, CEMENT: 210 },
];

const totalQuantities = {
    sand: 400,
    stone: 400,
    cement: 1000,
};

function getRandomDateIn2024() {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const end = new Date('2024-12-31T23:59:59Z').getTime();
    return new Date(start + Math.random() * (end - start)).toISOString()
}

async function createUsers() {

    const zambianFirstNames = ["Chanda", "Mwansa", "Mutale", "Bwalya", "Kabwe", "Lombe", "Gift", "Faruk", "Moses", "John", "Peter", "Paul"];
    const zambianLastNames = ["Mulenga", "Phiri", "Tembo", "Zimba", "Mumba", "Ngoma", "Banda", "Kamanga", "Sakala", "Chirwa", "Lungu", "Mwanza"];

    const usersData = [
        {
            firstName: "Admin",
            lastName: "Admin",
            profilePic: "profile-1.jpeg",
            nrcNo: "1234567890123",
            phoneNo: "0971234567",
            address: "Lusaka, Zambia",
            role: 5,
            email: "admin@gmail.com",
            password: passwordEncrypt("Admin2024.,?"),
            isActive: true,
            isVerified: true,
        },
        ...Array.from({ length: 5 }, (_, i) => {
            const firstName = zambianFirstNames[i % zambianFirstNames.length];
            const lastName = zambianLastNames[i % zambianLastNames.length];
            return {
                firstName: firstName,
                lastName: lastName,
                profilePic: `profile-${i + 2}.jpeg`,
                nrcNo: `12345678901${i + 2}`,
                phoneNo: `097123456${i + 2}`,
                address: `Lusaka, Zambia`,
                role: 1,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@gmail.com`,
                password: passwordEncrypt("Sconcrete2024.,?"),
                isActive: true,
                isVerified: true,
            };
        }),
        // Two users for each of the other roles (2, 3, 4)
        ...[2, 3, 4].flatMap(role =>
            Array.from({ length: 2 }, (_, i) => {
                const firstName = zambianFirstNames[(role * 2 + i) % zambianFirstNames.length];
                const lastName = zambianLastNames[(role * 2 + i) % zambianLastNames.length];
                return {
                    firstName: firstName,
                    lastName: lastName,
                    profilePic: `profile-${role}${i + 1}.jpeg`,
                    nrcNo: `1234567890${role}${i + 1}`,
                    phoneNo: `09712345${role}${i + 1}`,
                    address: `Lusaka, Zambia`,
                    role: role,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${role}${i + 1}@gmail.com`,
                    password: passwordEncrypt("Sconcrete2024.,?"),
                    isActive: true,
                    isVerified: true,
                };
            })
        ),
    ];

    const res = await User.bulkCreate(usersData);

    if (res) console.log('Users createed successfully!');
    else console.log('Someting went wrong with Users creation!');

}

async function createFirms() {

    const firmsData = [
        {
            name: "Lusaka Cement",
            address: "Plot 23, Great East Road, Lusaka",
            phoneNo: "+260972222111",
            tpinNo: "123456789",
            email: "info@lusakacement.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Copperbelt Construction",
            address: "Plot 45, Ndola Industrial Area, Ndola",
            phoneNo: "+260973333222",
            tpinNo: "234567890",
            email: "contact@copperbeltconstruct.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Choma Builders",
            address: "Plot 19, Independence Avenue, Choma",
            phoneNo: "+260974444333",
            tpinNo: "345678901",
            email: "sales@chomabuilders.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Kitwe Steel",
            address: "Plot 67, Freedom Park, Kitwe",
            phoneNo: "+260975555444",
            tpinNo: "456789012",
            email: "kitwesteel@zambia.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Solwezi Mining Supplies",
            address: "Plot 34, Lumwana Road, Solwezi",
            phoneNo: "+260976666555",
            tpinNo: "567890123",
            email: "mining@solwezisupplies.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Mongu Lumber",
            address: "Plot 78, Kalabo Road, Mongu",
            phoneNo: "+260977777666",
            tpinNo: "678901234",
            email: "info@mongulumber.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Livingstone Quarries",
            address: "Plot 56, Mosi-Oa-Tunya Road, Livingstone",
            phoneNo: "+260978888777",
            tpinNo: "789012345",
            email: "contact@livingstonequarries.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Chipata Cement",
            address: "Plot 32, Chipata Main Road, Chipata",
            phoneNo: "+260979999888",
            tpinNo: "890123456",
            email: "chipatacement@zambia.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Kasama Bricks",
            address: "Plot 44, Kasama Industrial, Kasama",
            phoneNo: "+260971111222",
            tpinNo: "901234567",
            email: "kasamabricks@zambia.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Mbala Hardware",
            address: "Plot 21, Lake Tanganyika Road, Mbala",
            phoneNo: "+260972222333",
            tpinNo: "012345678",
            email: "info@mbalahardware.com",
            status: 1,
            creatorId: 1,
        }
    ];

    const res = await Firm.bulkCreate(firmsData)

    if (res) console.log('Firms createed successfully!');
    else console.log('Someting went wrong with Firms creation!');
}

async function createMaterials() {

    const materialsData = [
        { name: "cement", unitType: "kg", creatorId: 1 },
        { name: "stone", unitType: "tone", creatorId: 1 },
        { name: "sand", unitType: "tone", creatorId: 1 },
    ];

    const res = await Material.bulkCreate(materialsData)

    if (res) console.log('Materials createed successfully!');
    else console.log('Someting went wrong with Materials creation!');
}

async function createPurchases() {
    const purchasesData = [];
    const purchaseAccountsData = [];

    const firms = await Firm.findAll({ where: { status: 2 } });
    const firmIds = firms.map(firm => firm.id);

    const materialIds = {
        sand: 3,
        stone: 2,
        cement: 1,
    };

    const unitPriceRanges = {
        sand: { min: 110, max: 120 },
        stone: { min: 110, max: 120 },
        cement: { min: 2, max: 4 },
    };

    function getRandomUnitPrice(min, max) {
        return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

    function calculateTotalPrice(quantity, unitPrice) {
        return parseFloat((quantity * unitPrice).toFixed(2));
    }

    function distributeQuantities(total, firms) {
        const quantities = [];
        let remaining = total;
        while (remaining > 0) {
            const firmIndex = Math.floor(Math.random() * firms.length);
            const maxPossible = Math.min(70, remaining);
            const quantity = Math.max(20, Math.floor(Math.random() * (maxPossible - 20 + 1) + 20));
            quantities.push({ firmId: firms[firmIndex], quantity });
            remaining -= quantity;
        }
        return quantities;
    }

    const sandQuantities = distributeQuantities(totalQuantities.sand, firmIds);
    const stoneQuantities = distributeQuantities(totalQuantities.stone, firmIds);
    const cementQuantities = distributeQuantities(totalQuantities.cement, firmIds);

    function addPurchases(materialQuantities, materialId, unitPriceRange) {
        materialQuantities.forEach(({ firmId, quantity }) => {
            const unitPrice = getRandomUnitPrice(unitPriceRange.min, unitPriceRange.max);
            const totalPrice = calculateTotalPrice(quantity, unitPrice);
            const createdAt = getRandomDateIn2024();
            const purchaseData = {
                FirmId: firmId,
                MaterialId: materialId,
                quantity,
                unitPrice,
                totalPrice,
                createdAt,
                creatorId: 1,
            };
            purchasesData.push(purchaseData);

            const purchaseAccountData = {
                debit: totalPrice,
                balance: totalPrice,
                FirmId: firmId,
                creatorId: 1,
                updaterId: null,
            };
            purchaseAccountsData.push(purchaseAccountData);
        });
    }

    addPurchases(sandQuantities, materialIds.sand, unitPriceRanges.sand);
    addPurchases(stoneQuantities, materialIds.stone, unitPriceRanges.stone);
    addPurchases(cementQuantities, materialIds.cement, unitPriceRanges.cement);

    const res = await Purchase.bulkCreate(purchasesData);

    if (res) {
        console.log('Purchases created successfully!');
        res.forEach((purchase, index) => {
            purchaseAccountsData[index].PurchaseId = purchase.id;
        });
        const accountRes = await PurchaseAccount.bulkCreate(purchaseAccountsData);
        if (accountRes) console.log('Purchase accounts created successfully!');
        else console.log('Something went wrong with Purchase accounts creation!');
    } else {
        console.log('Something went wrong with Purchases creation!');
    }
}

async function createProducts() {

    const productsData = [];

    function calculatePrice(materials) {
        return (materials.STONE * 140 + materials.SAND * 140 + materials.CEMENT * 4).toFixed(2);
    }

    productNames.forEach((name, index) => {
        const materials = materialsData[index];
        const price = calculatePrice(materials);
        productsData.push({
            name,
            price,
            materials,
            creatorId: 1,
        });
    });

    const res = await Product.bulkCreate(productsData)

    if (res) console.log('Products createed successfully!');
    else console.log('Someting went wrong with Products creation!');
}

async function createVehicles() {
    const drivers = await User.findAll({ where: { role: 1 } });

    const vehiclesData = drivers.map((driver, index) => {
        return {
            DriverId: driver.id,
            plateNumber: `BAK0${index + 1}`,
            model: 2010 + index,
            capacity: Math.floor(Math.random() * (13 - 6 + 1)) + 6,
            status: 1,
        };
    });

    const res = await Vehicle.bulkCreate(vehiclesData);
    if (res) console.log('Vehicles created successfully!');
    else console.log('Something went wrong with Vehicles creation!');

}

async function createSales() {
    const salesData = [];

    const firms = await Firm.findAll({ where: { status: 1 } });
    const firmIds = firms.map(firm => firm.id);
    const products = await Product.findAll();
    const productIds = products.map(product => product.id);

    function getRandomDateIn2024() {
        const start = new Date('2024-01-01T00:00:00Z').getTime();
        const end = new Date('2024-12-31T23:59:59Z').getTime();
        return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
    }

    function calculateTotalPrice(quantity, unitPrice, otherCharges, discount) {
        return (quantity * unitPrice + otherCharges - discount).toFixed(2);
    }

    const materialSales = {
        sand: 0,
        stone: 0,
        cement: 0,
    };

    const allPurchase = await Purchase.findAndCountAll({ where: { deletedAt: null } })
    const totalPurchaseCost = allPurchase.rows.reduce((acc, item) => acc + item.totalPrice, 0);


    let totalSalesValue = 0;
    const targetSalesValue = totalPurchaseCost * 1.2;

    while (totalSalesValue < targetSalesValue) {
        const FirmId = firmIds[Math.floor(Math.random() * firmIds.length)];
        const ProductId = productIds[Math.floor(Math.random() * productIds.length)];
        const quantity = Math.floor(Math.random() * 10) + 5;
        const otherCharges = Math.floor(Math.random() * 100);
        const discount = Math.floor(Math.random() * 50);
        const requestedDate = getRandomDateIn2024();
        const sideContact = `+097-088-229-549`;
        const status = 2;
        const location = "Makeni, Kasama Road";

        const existingOrders = await Sale.findAll({ where: { orderDate: requestedDate } });
        const orderNumber = existingOrders.length + 1;

        const product = await Product.findByPk(ProductId);
        const unitPrice = product.price;
        const totalPrice = calculateTotalPrice(quantity, unitPrice, otherCharges, discount);

        if (materialSales.sand + quantity <= totalQuantities.sand) {
            materialSales.sand += quantity;
        } else if (materialSales.stone + quantity <= totalQuantities.stone) {
            materialSales.stone += quantity;
        } else if (materialSales.cement + quantity <= totalQuantities.cement) {
            materialSales.cement += quantity;
        } else {
            continue;
        }

        totalSalesValue += parseFloat(totalPrice);

        salesData.push({
            FirmId,
            ProductId,
            status,
            location,
            quantity,
            otherCharges,
            unitPrice,
            totalPrice,
            discount,
            requestedDate,
            orderDate: requestedDate,
            sideContact,
            orderNumber,
            creatorId: 1,
        });
    }

    const res = await Sale.bulkCreate(salesData);

    if (res) {
        console.log('Sales created successfully!');
        for (const sale of res) {
            const prevOrderNumber = sale.dataValues.orderNumber;
            await Sale.update({ orderNumber: sequelize.literal('"orderNumber" - 1') }, {
                where: {
                    orderDate: sale.dataValues.orderDate,
                    orderNumber: { [Op.gt]: prevOrderNumber },
                }
            });

            const vehicles = await Vehicle.findAll();
            const randomVehicleIndex = Math.floor(Math.random() * vehicles.length);
            const randomVehicle = vehicles[randomVehicleIndex];

            const productionData = {
                SaleId: sale.dataValues.id,
                creatorId: 1,
                status: 4,
                VehicleIds: [randomVehicle.id]
            };

            const createdProduction = await Production.create(productionData);
            if (createdProduction) console.log('created production');


            const createdDelivery = await Delivery.create({
                ProductionId: createdProduction.id,
                VehicleId: randomVehicle.id,
                creatorId: 1,
                status: 4
            });
            if (createdDelivery) console.log('created delivery');

            const saleAccData = {
                SaleId: sale.dataValues.id,
                creatorId: 1,
                FirmId: sale?.FirmId,
                totalPrice: sale?.totalPrice,
                balance: (sale?.totalPrice - 0).toFixed(2)
            };


            const createdSaleAccoutn = await SaleAccount.create(saleAccData);
            if (createdSaleAccoutn) console.log('created SaleAccoutn');


        }
        console.log('ends!');
    } else {
        console.log('Something went wrong with Sales creation!');
    }
}




module.exports = async function createDatabases() {
    try {
        console.log("Starting database creation...");

        await createUsers();
        console.log("Users created successfully!");

        await createFirms();
        console.log("Firms created successfully!");

        await createMaterials();
        console.log("Materials created successfully!");

        await createPurchases();
        console.log("Purchases created successfully!");

        await createProducts();
        console.log("Products created successfully!");

        await createVehicles();
        console.log("Vehicles created successfully!");

        await createSales();
        console.log("Sales created successfully!");

        console.log("Database creation completed successfully!");
    } catch (error) {
        console.error("An error occurred during database creation:", error);
    }
};
