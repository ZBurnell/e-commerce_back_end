const router = require('express').Router();
const { Category, Product } = require('../../models');

// find all categories
router.get('/', async (req, res) => {
    await Category.findAll({attributes: ['id', 'category_name'],
        include: [{model: Product, attributes: ['id', 'product_name', 'price', 'stock', 'category_id']}]
    })  .then((categories) => {
        res.json(categories);
    })
});

// find one category by its `id` value
router.get('/:id', async (req, res) => {
    await Category.findByPk(req.params.id, {attributes: ['id', 'category_name'],
		    include: [{model: Product, attributes: ['id', 'product_name', 'price', 'stock', 'category_id']}]
	  })  .then((categories) => {
        res.json(categories);
    })  .catch((err) => {
        res.json(err);
    });
});

// create a new category
router.post('/', async (req, res) => {
    await Category.create(req.body.category_name)
    .then((categories) => res.status(200).json(categories))
    .catch((err) => {
        console.log(err);
        res.status(400).json(err);
    });
});

// update category
router.put('/:id', async (req, res) => {
    await Category.update(req.body, {where: {id: req.params.id}
	})  .then((categories) => res.status(200).json(categories))
        .catch((err) => {res.json(err);
    });
});

// delete a category by its `id` value
router.delete('/:id', async (req, res) => {
    await Category.destroy({
		    where: {id: req.params.id}
	  })    .then((categories) => {
		    res.json(`The category was removed from the database`);
	  })	  .catch((err) => {
		    res.json(err);
	  });
});

module.exports = router;
