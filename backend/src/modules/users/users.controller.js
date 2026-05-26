const usersService = require("./users.service");

async function getAll(req, res, next) {
  try {
    const users = await usersService.getAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const user = await usersService.create({ name, email, password, role });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = await usersService.update(Number(id), data);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await usersService.remove(Number(id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };
