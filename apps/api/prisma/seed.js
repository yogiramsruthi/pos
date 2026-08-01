import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const buildBarcode = (productCode, size, color) => `${productCode}-${size}-${color}`.replace(/\s+/g, '').toUpperCase();
async function main() {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@pos.local' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@pos.local',
            passwordHash,
            role: 'ADMIN'
        }
    });
    const [mens, womens, tshirt, shirts, trousers] = await prisma.$transaction([
        prisma.category.upsert({
            where: { name_parentId: { name: "Men's", parentId: null } },
            update: {},
            create: { name: "Men's" }
        }),
        prisma.category.upsert({
            where: { name_parentId: { name: "Women's", parentId: null } },
            update: {},
            create: { name: "Women's" }
        }),
        prisma.category.upsert({
            where: { name_parentId: { name: 'T-Shirts', parentId: null } },
            update: {},
            create: { name: 'T-Shirts' }
        }),
        prisma.category.upsert({
            where: { name_parentId: { name: 'Shirts', parentId: null } },
            update: {},
            create: { name: 'Shirts' }
        }),
        prisma.category.upsert({
            where: { name_parentId: { name: 'Trousers', parentId: null } },
            update: {},
            create: { name: 'Trousers' }
        })
    ]);
    const warehouse = await prisma.warehouse.upsert({
        where: { code: 'MAIN' },
        update: {},
        create: { name: 'Main Store', code: 'MAIN', isPrimary: true }
    });
    const products = [
        { name: 'Classic Cotton Tee', sku: 'TEE-001', categoryId: tshirt.id, brand: 'UrbanFit', fabric: 'Cotton', mrp: 799, cost: 420, sell: 699 },
        { name: 'Formal Slim Shirt', sku: 'SRT-001', categoryId: shirts.id, brand: 'OfficeEdge', fabric: 'Linen Blend', mrp: 1499, cost: 850, sell: 1299 },
        { name: 'Stretch Fit Trouser', sku: 'TRS-001', categoryId: trousers.id, brand: 'DailyWear', fabric: 'Poly-Cotton', mrp: 1899, cost: 1050, sell: 1599 },
        { name: 'Women Casual Top', sku: 'WTP-001', categoryId: womens.id, brand: 'Aura', fabric: 'Rayon', mrp: 999, cost: 520, sell: 899 }
    ];
    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['Black', 'Blue'];
    for (const productData of products) {
        const product = await prisma.product.upsert({
            where: { sku: productData.sku },
            update: {
                name: productData.name,
                categoryId: productData.categoryId,
                brand: productData.brand,
                fabric: productData.fabric
            },
            create: {
                name: productData.name,
                sku: productData.sku,
                categoryId: productData.categoryId,
                brand: productData.brand,
                fabric: productData.fabric
            }
        });
        for (const size of sizes) {
            for (const color of colors) {
                const barcode = buildBarcode(productData.sku, size, color);
                const variant = await prisma.productVariant.upsert({
                    where: { barcode },
                    update: {
                        sizeLabel: size,
                        colorLabel: color,
                        costPrice: productData.cost,
                        mrp: productData.mrp,
                        sellingPrice: productData.sell,
                        taxPercent: 5
                    },
                    create: {
                        productId: product.id,
                        barcode,
                        sizeLabel: size,
                        colorLabel: color,
                        costPrice: productData.cost,
                        mrp: productData.mrp,
                        sellingPrice: productData.sell,
                        taxPercent: 5
                    }
                });
                await prisma.inventoryStock.upsert({
                    where: {
                        warehouseId_productVariantId: {
                            warehouseId: warehouse.id,
                            productVariantId: variant.id
                        }
                    },
                    update: {
                        quantityOnHand: 25
                    },
                    create: {
                        warehouseId: warehouse.id,
                        productVariantId: variant.id,
                        quantityOnHand: 25
                    }
                });
            }
        }
    }
    const tier = await prisma.membershipTier.upsert({
        where: { name: 'Silver' },
        update: {},
        create: {
            name: 'Silver',
            discountPercent: 5,
            pointsMultiplier: 1
        }
    });
    await prisma.customer.upsert({
        where: { phone: '9999999999' },
        update: {},
        create: {
            name: 'Walk-in Customer',
            phone: '9999999999',
            tierId: tier.id,
            defaultDiscountPercent: 2
        }
    });
    await prisma.cashRegisterSession.create({
        data: {
            openedByUserId: admin.id,
            openingBalance: 5000,
            movements: {
                create: {
                    movementType: 'OPENING',
                    amount: 5000,
                    notes: 'Day start opening cash'
                }
            }
        }
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});
