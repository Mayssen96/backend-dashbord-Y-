const mongoose = require("mongoose");

const CalendrierSchema = new mongoose.Schema({
    startDate: Date,
    endDate: Date,
    description: String
    
});

CalendrierSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Calendrier = mongoose.model("Calendrier", CalendrierSchema);

module.exports = Calendrier;