const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  await Product.findAll({
		attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
		include: [
			{model: Tag, attributes: ['id', 'tag_name'], through: 'ProductTag'},
			{model: Category, attributes: ['id', 'category_name']}]
		})	.then((productData) => {
			res.json(productData);
		})	.catch((err) => {
			res.json(err);
		});
});

// get one product
router.get('/:id', (req, res) => {
  Product.findByPk(req.params.id, {
		include: [{model: Tag, attributes: ['id', 'tag_name'], through: 'ProductTag'},
			{model: Category, attributes: ['id', 'category_name']}]
		})	.then((specificProduct) => {
			res.json(specificProduct);
		})	.catch((err) => {
			res.json(err);
		});
});

// create new product
router.post('/', (req, res) => {
    Product.create({ 
		product_name: req.body.product_name,
		price: req.body.price,
		stock: req.body.stock,
		category_id: req.body.category_id
	})	.then((product) => {
			if (req.body.tagIds.length) {
				const productTagIdArr = req.body.tagIds.map((tag_id) => {
					return {product_id: product.id,	tag_id};
				});
				return ProductTag.bulkCreate(productTagIdArr);
			}	else{
			res.status(200).json(product);
			}
		})	.then((productTagIds) => res.status(200).json(productTagIds))
			.catch((err) => {
			console.log(err);
			res.status(400).json(err);
		});
});

// update a product
router.put('/:id', (req, res) => {
  Product.update(req.body, {
		where: {id: req.params.id}
		})	.then((product) => {
			return ProductTag.findAll({where: {product_id: req.params.id}});
		})	.then((productTags) => {
			const productTagIds = productTags.map(({tag_id}) => tag_id);
			const newProductTags = req.body.tagIds
				.filter((tag_id) => !productTagIds.includes(tag_id))
				.map((tag_id) => {
					return {product_id: req.params.id, tag_id};
				});
			const productTagsToRemove = productTags
				.filter(({tag_id}) => !req.body.tagIds.includes(tag_id))
				.map(({id}) => id);
			return Promise.all([
				ProductTag.destroy({where: {id: productTagsToRemove}}),
				ProductTag.bulkCreate(newProductTags),
			]);
		})	.then((updatedProductTags) => res.json(updatedProductTags))
		.catch((err) => {
			res.status(400).json(err);
		});
});

//delete a product
router.delete('/:id', (req, res) => {
	let deletedProduct = Product.findByPk(req.params.id);
	Product.destroy({where: {id: req.params.id}
	})	.then((product) => {
		res.json(`${deletedProduct} was removed from database`);
	})	.catch((err) => {
		res.json(err);
	});
});

module.exports = router;
