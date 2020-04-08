var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController.js');
const {trackMiddleware,extractSpanMiddleware} = require('../trace_utils');
/*
 * GET
 */
router.get('/', [trackMiddleware("list"),extractSpanMiddleware], bookController.list);

/*
 * GET
 */
router.get('/:id', [trackMiddleware("getone"),extractSpanMiddleware], bookController.show);

/*
 * POST
 */
router.post('/', [trackMiddleware("create"),extractSpanMiddleware], bookController.create);

/*
 * PUT
 */
router.put('/:id', [trackMiddleware("update"),extractSpanMiddleware], bookController.update);

/*
 * DELETE
 */
router.delete('/:id', [trackMiddleware("remove"),extractSpanMiddleware], bookController.remove);

module.exports = router;
