const express = require("express");
const router = express.Router();
const controller = require("../controllers/calendrier.controller");

// Create a new Avis
router.post("/add", controller.create);

// Retrieve all Avis
router.get("/", controller.findAll);

// Retrieve a single Avis by id
router.get("/:id", controller.findOne);

// Update a Avis by id
router.put("/:id", controller.update);

// Delete a Avis by id
router.delete("/:id", controller.delete);

module.exports = router;