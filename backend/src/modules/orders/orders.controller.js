const ordersService = require("./orders.service");

async function create(req, res, next) {
  try {
    const { tableId, type, items } = req.body;

    console.log("📞 Novo pedido recebido:", {
      tableId,
      type,
      itemsCount: items?.length,
    });

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "O pedido precisa de pelo menos um item." });
    }

    const orders = await ordersService.createOrder(
      req.user.id,
      tableId || null,
      type || "DINE_IN",
      items,
    );

    console.log("✅ Pedido(s) criado(s):", orders.length);

    // Emitir eventos WebSocket para cada pedido PENDING
    if (req.io) {
      orders.forEach((order) => {
        if (order.status === "PENDING") {
          req.io.emit("new_order", order);
          console.log(`📢 Evento new_order emitido para pedido #${order.id}`);
        }
      });
    }

    res.status(201).json(orders);
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    next(error);
  }
}

async function getKitchenOrders(req, res, next) {
  try {
    console.log("📞 Pedido GET /api/orders/kitchen");
    const orders = await ordersService.getActiveOrders();
    console.log(`📋 Pedidos ativos: ${orders.length}`);
    res.json(orders);
  } catch (error) {
    console.error("❌ Erro em getKitchenOrders:", error);
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`📞 Atualizar pedido ${id} para ${status}`);
    const order = await ordersService.updateStatus(Number(id), status);

    // Emitir evento WebSocket
    if (req.io) {
      req.io.emit("order_status_changed", order);
      console.log(
        `📢 Evento order_status_changed emitido para pedido #${order.id} → ${status}`,
      );
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Erro em updateOrderStatus:", error);
    next(error);
  }
}

async function getByTable(req, res, next) {
  try {
    const { tableId } = req.params;
    console.log(`📞 Pedidos da mesa ${tableId}`);
    const orders = await ordersService.getByTable(Number(tableId));
    res.json(orders);
  } catch (error) {
    console.error("❌ Erro em getByTable:", error);
    next(error);
  }
}

async function updateOrderItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    console.log(`📞 Atualizar orderItem ${id} → qtd: ${quantity}`);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantidade inválida." });
    }

    const item = await ordersService.updateOrderItem(
      Number(id),
      Number(quantity),
    );
    res.json(item);
  } catch (error) {
    console.error("❌ Erro em updateOrderItem:", error);
    next(error);
  }
}

async function deleteOrderItem(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`📞 Remover orderItem ${id}`);
    await ordersService.deleteOrderItem(Number(id));
    res.status(204).send();
  } catch (error) {
    console.error("❌ Erro em deleteOrderItem:", error);
    next(error);
  }
}

// ─── Gestão de Produtos ───

async function createProduct(req, res, next) {
  try {
    console.log("📞 Criar novo produto:", req.body);
    const product = await ordersService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`📞 Atualizar produto ${id}:`, req.body);
    const product = await ordersService.updateProduct(id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`📞 Remover produto ${id}`);
    await ordersService.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getKitchenOrders,
  updateOrderStatus,
  getByTable,
  updateOrderItem,
  deleteOrderItem,
  createProduct,
  updateProduct,
  deleteProduct,
};
