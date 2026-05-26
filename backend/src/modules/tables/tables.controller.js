const tablesService = require("./tables.service");

async function getAll(req, res, next) {
  try {
    console.log("📞 GET /api/tables");
    const tables = await tablesService.getAll();
    res.json(tables);
  } catch (error) {
    console.error("❌ Erro em getAll:", error);
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`📞 PATCH /api/tables/${id}/status → ${status}`);
    const table = await tablesService.updateStatus(Number(id), status);
    res.json(table);
  } catch (error) {
    console.error("❌ Erro em updateStatus:", error);
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { number, capacity } = req.body;
    console.log(
      `📞 POST /api/tables → número=${number}, capacidade=${capacity}`,
    );

    if (!number || number < 1) {
      return res.status(400).json({ error: "Número de mesa inválido." });
    }

    const table = await tablesService.create(
      Number(number),
      Number(capacity) || 4,
    );
    res.status(201).json(table);
  } catch (error) {
    console.error("❌ Erro em create:", error);
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { number, capacity, status } = req.body;
    console.log(`📞 PUT /api/tables/${id} →`, { number, capacity, status });

    const table = await tablesService.update(Number(id), {
      number,
      capacity,
      status,
    });
    res.json(table);
  } catch (error) {
    console.error("❌ Erro em update:", error);
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`📞 DELETE /api/tables/${id}`);

    // Verificar se a mesa tem pedidos ativos
    const hasActiveOrders = await tablesService.hasActiveOrders(Number(id));
    if (hasActiveOrders) {
      return res.status(400).json({
        error:
          "Esta mesa tem pedidos ativos. Feche os pedidos antes de remover.",
      });
    }

    await tablesService.remove(Number(id));
    res.status(204).send();
  } catch (error) {
    console.error("❌ Erro em remove:", error);
    next(error);
  }
}

async function getTableOrders(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`📞 GET /api/tables/${id}/orders`);
    const orders = await tablesService.getTableOrders(Number(id));
    res.json(orders);
  } catch (error) {
    console.error("❌ Erro em getTableOrders:", error);
    next(error);
  }
}

module.exports = {
  getAll,
  updateStatus,
  create,
  update,
  remove,
  getTableOrders,
};
