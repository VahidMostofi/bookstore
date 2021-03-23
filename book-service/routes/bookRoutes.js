var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController.js');
const {trackMiddleware} = require('../trace_utils');
/*
 * GET
 */
router.get('/', [trackMiddleware("list")], bookController.list);

/*
 * GET
 */
router.get('/:id', [trackMiddleware("getone")], bookController.show);

/*
 * POST
 */
router.post('/', [trackMiddleware("create")], bookController.create);

/*
 * PUT
 */
router.put('/:id', [trackMiddleware("update")], bookController.update);

/*
 * DELETE
 */
router.delete('/:id', [trackMiddleware("remove")], bookController.remove);

module.exports = router;
