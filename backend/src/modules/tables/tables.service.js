const prisma = require("../../config/database");

async function getAll() {
  return prisma.restaurantTable.findMany({
    orderBy: { number: "asc" },
    include: {
      orders: {
        where: { paymentStatus: "UNPAID" },
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });
}

async function updateStatus(id, status) {
  // Se estiver a libertar a mesa, marcar todos os pedidos como PAGOS
  if (status === "FREE") {
    const updatedOrders = await prisma.order.updateMany({
      where: {
        tableId: id,
        paymentStatus: "UNPAID",
      },
      data: {
        paymentStatus: "PAID",
        status: "DELIVERED",
      },
    });
    console.log(
      `💰 ${updatedOrders.count} pedido(s) da mesa ${id} marcado(s) como PAGO(S)`,
    );
  }

  // Se estiver a tentar reservar, verificar se há pedidos ativos
  if (status === "RESERVED") {
    const activeOrders = await prisma.order.count({
      where: {
        tableId: id,
        paymentStatus: "UNPAID",
      },
    });

    if (activeOrders > 0) {
      throw {
        status: 400,
        message:
          "Não é possível reservar uma mesa com pedidos ativos. Feche os pedidos primeiro.",
      };
    }
  }

  return prisma.restaurantTable.update({
    where: { id },
    data: { status },
  });
}

async function create(number, capacity) {
  const existing = await prisma.restaurantTable.findUnique({
    where: { number },
  });

  if (existing) {
    throw {
      status: 400,
      message: `Já existe uma mesa com o número ${number}.`,
    };
  }

  return prisma.restaurantTable.create({
    data: {
      number,
      capacity: capacity || 4,
      status: "FREE",
    },
  });
}

async function update(id, data) {
  if (data.number) {
    const existing = await prisma.restaurantTable.findFirst({
      where: {
        number: data.number,
        id: { not: id },
      },
    });
    if (existing) {
      throw {
        status: 400,
        message: `Já existe outra mesa com o número ${data.number}.`,
      };
    }
  }

  return prisma.restaurantTable.update({
    where: { id },
    data: {
      ...(data.number && { number: data.number }),
      ...(data.capacity && { capacity: data.capacity }),
      ...(data.status && { status: data.status }),
    },
  });
}

async function remove(id) {
  // Verificar se há pedidos ativos antes de remover
  const activeOrders = await prisma.order.count({
    where: {
      tableId: id,
      paymentStatus: "UNPAID",
    },
  });

  if (activeOrders > 0) {
    throw {
      status: 400,
      message:
        "Esta mesa tem pedidos ativos. Feche os pedidos antes de remover.",
    };
  }

  return prisma.restaurantTable.delete({ where: { id } });
}

async function hasActiveOrders(tableId) {
  const count = await prisma.order.count({
    where: {
      tableId,
      paymentStatus: "UNPAID",
    },
  });
  return count > 0;
}

async function getTableOrders(tableId) {
  return prisma.order.findMany({
    where: {
      tableId,
      paymentStatus: "UNPAID",
    },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
      user: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

module.exports = {
  getAll,
  updateStatus,
  create,
  update,
  remove,
  hasActiveOrders,
  getTableOrders,
};
