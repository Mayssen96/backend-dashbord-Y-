const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new mongoose.Schema({
 
  nomformation: String,
  date: Date,
  status: String,
  details: String,
  formationId: { type: Schema.Types.ObjectId, ref: 'Formation' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  
});

// Ajout de la méthode toJSON pour transformer l'objet avant de le renvoyer
ReservationSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;
