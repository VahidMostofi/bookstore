var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController.js');

/*
 * GET
 */
router.get('/', bookController.list);

/*
 * GET
 */
router.get('/:id', bookController.show);

/*
 * POST
 */
router.post('/', bookController.create);

/*
 * PUT
 */
router.put('/:id', bookController.update);

/*
 * DELETE
 */
router.delete('/:id', bookController.remove);

module.exports = router;
