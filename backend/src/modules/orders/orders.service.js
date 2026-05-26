const prisma = require("../../config/database");

async function createOrder(userId, tableId, type, items) {
  console.log("📦 A processar pedido...");

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  });

  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  const drinkItems = [];
  const foodItems = [];

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) {
      throw {
        status: 400,
        message: `Produto com ID ${item.productId} não encontrado.`,
      };
    }

    if (product.category.name === "Bebidas") {
      drinkItems.push(item);
    } else {
      foodItems.push(item);
    }
  }

  console.log(`🥤 ${drinkItems.length} bebidas → prontas automaticamente`);
  console.log(`🍽️ ${foodItems.length} comidas → enviadas para cozinha`);

  const createdOrders = [];

  if (foodItems.length > 0) {
    const foodOrder = await createSingleOrder(
      userId,
      tableId,
      type,
      foodItems,
      productMap,
      "PENDING",
    );
    createdOrders.push(foodOrder);
  }

  if (drinkItems.length > 0) {
    const drinkOrder = await createSingleOrder(
      userId,
      tableId,
      type,
      drinkItems,
      productMap,
      "READY",
    );
    createdOrders.push(drinkOrder);
  }

  // Atualizar estado da mesa para OCCUPIED
  if (tableId) {
    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: { status: "OCCUPIED" },
    });
    console.log(`🪑 Mesa ${tableId} marcada como OCUPADA`);
  }

  return createdOrders;
}

async function createSingleOrder(
  userId,
  tableId,
  type,
  items,
  productMap,
  initialStatus,
) {
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap[item.productId];
    const subtotal = product.price * item.quantity;
    total += subtotal;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity || 1,
      notes: item.notes || "",
    });
  }

  return prisma.order.create({
    data: {
      type: type || "DINE_IN",
      tableId: tableId || null,
      userId,
      total,
      status: initialStatus,
      paymentStatus: "UNPAID",
      items: { create: orderItems },
    },
    include: {
      items: {
        include: { product: { include: { category: true } } },
      },
      table: true,
      user: { select: { id: true, name: true } },
    },
  });
}

async function getActiveOrders() {
  return prisma.order.findMany({
    where: {
      status: { not: "DELIVERED" },
      paymentStatus: "UNPAID",
    },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
      table: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function updateStatus(orderId, status) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
      table: true,
      user: { select: { id: true, name: true } },
    },
  });
}

async function getByTable(tableId) {
  return prisma.order.findMany({
    where: {
      tableId,
      paymentStatus: "UNPAID",
    },
    include: {
      items: {
        include: {
          product: { include: { category: true } },
        },
      },
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function updateOrderItem(itemId, quantity) {
  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { quantity },
    include: {
      product: { include: { category: true } },
      order: true,
    },
  });

  await recalculateOrderTotal(item.orderId);
  return item;
}

async function deleteOrderItem(itemId) {
  const item = await prisma.orderItem.findUnique({
    where: { id: itemId },
    include: { order: true },
  });

  if (!item) throw { status: 404, message: "Item não encontrado." };

  await prisma.orderItem.delete({ where: { id: itemId } });

  const remainingItems = await prisma.orderItem.count({
    where: { orderId: item.orderId },
  });

  if (remainingItems === 0) {
    await prisma.order.delete({ where: { id: item.orderId } });
  } else {
    await recalculateOrderTotal(item.orderId);
  }

  return { success: true };
}

async function recalculateOrderTotal(orderId) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { product: true },
  });
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  await prisma.order.update({
    where: { id: orderId },
    data: { total },
  });
}

// ─── Gestão de Produtos ───

async function createProduct(data) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description || "",
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
      imageUrl: data.imageUrl || "",
    },
    include: { category: true },
  });
}

async function updateProduct(id, data) {
  return prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
      imageUrl: data.imageUrl,
    },
    include: { category: true },
  });
}

async function deleteProduct(id) {
  const activeUsage = await prisma.orderItem.count({
    where: {
      productId: parseInt(id),
      order: { paymentStatus: "UNPAID" },
    },
  });

  if (activeUsage > 0) {
    throw {
      status: 400,
      message:
        "Este produto está em pedidos ativos. Feche os pedidos primeiro.",
    };
  }

  return prisma.product.delete({ where: { id: parseInt(id) } });
}

module.exports = {
  createOrder,
  getActiveOrders,
  updateStatus,
  getByTable,
  updateOrderItem,
  deleteOrderItem,
  createProduct,
  updateProduct,
  deleteProduct,
};
