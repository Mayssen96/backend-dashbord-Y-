const express = require('express');
const router = express.Router();
const reservation = require('../controllers/reservation.controller');
const { authJwt } = require('../middlewares');

router.post("/add",  reservation.add);
router.get("/show",  reservation.show);
router.put("/update/:id", reservation.update);
router.delete("/remove/:id", reservation.remove);

module.exports = router;
