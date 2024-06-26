const express = require("express");
const router = express.Router();
const formationController = require("../controllers/formation.controller");

router.post("/add", formationController.add);
router.get("/show", formationController.show);
router.put("/update/:id", formationController.update);
router.delete("/remove/:id", formationController.remove);
router.post('/reserve', formationController.reserve);

module.exports = router;
