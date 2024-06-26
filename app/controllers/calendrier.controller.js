const db = require("../models");
const Calendrier = db.calendrier;

// Create a new Avis
exports.create = (req, res) => {
  const { startDate, endDate,description } = req.body;

  // Validate request
  if (!startDate || !endDate || !description ) {
    return res.status(400).send({ message: "Fields cannot be empty!" });
  }

  // Create a new Avis
  const calendrier = new Calendrier({
    startDate,
    endDate,
    description
   
  });

  // Save Avis in the database
  calendrier.save((err, data) => {
    if (err) {
      res.status(500).send({ message: err });
    } else {
      res.send(data);
    }
  });
};

// Retrieve all Avis
exports.findAll = (req, res) => {
  Calendrier.find()
    .then((calendrier) => {
      res.send(calendrier);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving avis." });
    });
};

// Find a single Avis by id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Calendrier.findById(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Avis with id ${id} not found.` });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: `Error retrieving Avis with id ${id}` });
    });
};

// Update a Avis by id
exports.update = (req, res) => {
  const id = req.params.id;

  Calendrier.findByIdAndUpdate(id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: `Cannot update Avis with id ${id}. Maybe Avis was not found!` });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: `Error updating Avis with id ${id}` });
    });
};

// Delete a Avis by id
exports.delete = (req, res) => {
  const id = req.params.id;

  Calendrier.findByIdAndRemove(id)
    .then(() => {
      res.send({ message: "Avis was deleted successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: `Could not delete Avis with id ${id}` });
    });
};