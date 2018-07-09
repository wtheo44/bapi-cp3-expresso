const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu WHERE Menu.menuItems = 1',
    (err, menu) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menu: menuItem});
      }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory === 0 ? 0 : 1,
        price = req.body.menuItem.price;
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (name, description, inventory, price)' +
      'VALUES ($name, $description, $inventory, $price)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

menusRouter.get('/:menuId/menu-items', (req, res, next) => {
  res.status(200).json({menu: req.menu.menuItems});
});


module.exports = employeesRouter;
