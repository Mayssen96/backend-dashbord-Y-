const mongoose = require("mongoose");

const FormationSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  endDate: Date,
  teacher: String,
  detail: String,
  placedisponible: { type: Number, default: 20 }, // Initialiser à 20 par défaut
  participantCount: { type: Number, default: 0 },
  duration: Number // Modifier le type en Number pour stocker la durée en jours
});

// Ajout de la méthode toJSON pour transformer l'objet avant de le renvoyer
FormationSchema.method("toJSON", function() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

// Ajout d'un hook pour calculer et mettre à jour la durée en jours avant de sauvegarder
FormationSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const durationInMilliseconds = endDate.getTime() - startDate.getTime();
    const durationInDays = Math.floor(durationInMilliseconds / (1000 * 3600 * 24)); // Convertir en jours entiers
    this.duration = durationInDays;
  }
  next();
});

const Formation = mongoose.model("Formation", FormationSchema);

module.exports = Formation;
