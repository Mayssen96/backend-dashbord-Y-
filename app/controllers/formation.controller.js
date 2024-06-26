const Formation = require("../models/formation.model");
const Reservation = require("../models/reservation.model");

async function add(req, res, next) {
  try {
    const formations = await Formation.find();
    const totalPlacesDisponibles = formations.reduce((acc, formation) => acc + formation.placedisponible, 0);

    // Vérifier si le nombre total de places disponibles dépasse 20 après l'ajout de la nouvelle formation
    if (totalPlacesDisponibles + req.body.placedisponible > 20) {
      return res.status(400).send("Le nombre de places disponibles ne peut pas dépasser 20");
    }

    const { title, startDate, endDate, teacher, detail, ...formationData } = req.body;

    // Vérifier si la date de fin est postérieure à la date de début
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).send("La date de fin doit être postérieure à la date de début");
    }

    const durationInMilliseconds = new Date(endDate).getTime() - new Date(startDate).getTime();
    const durationInDays = Math.floor(durationInMilliseconds / (1000 * 3600 * 24));

    const formation = new Formation({
      title,
      startDate,
      endDate,
      teacher,
      detail,
      placedisponible: req.body.placedisponible || 20, // Utiliser la valeur fournie ou initialiser à 20 par défaut
      duration: durationInDays, // Ajouter la durée calculée en jours
      ...formationData
    });
    await formation.save();
    res.send("Formation ajoutée");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'ajout de la formation");
  }
}

async function reserve(req, res, next) {
  try {
    const { formationId, userId, date, ...reservationData } = req.body;

    // Vérifier si la formation existe déjà
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).send("Formation non trouvée");
    }

    let placesDisponibles; // Nombre de places disponibles après réservation

    // Si la formation est nouvelle (placesDisponibles non défini), initialiser à 20
    if (formation.placedisponible === undefined) {
      placesDisponibles = 20;
    } else {
      placesDisponibles = formation.placedisponible;
      // Vérifier s'il y a des places disponibles
      console.log("Places disponibles avant la réservation :", placesDisponibles); // Ajout d'une instruction de débogage
      if (placesDisponibles <= 0) {
        return res.status(400).send("Aucune place disponible pour cette formation");
      }
    }

    // Créer une nouvelle réservation
    const reservation = new Reservation({
      formationId,
      userId, // Ajouter l'ID de l'utilisateur à la réservation
      date,
      ...reservationData
    });
    await reservation.save();

    // Mettre à jour le nombre de places disponibles et le nombre de participants
    placesDisponibles -= 1;
    formation.placedisponible = placesDisponibles;
    formation.participantCount += 1;
    await formation.save();

    console.log("Places disponibles après la réservation :", placesDisponibles); // Ajout d'une instruction de débogage

    res.send("Réservation ajoutée");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'ajout de la réservation");
  }
}




async function show(req, res, next) {
  try {
    const formations = await Formation.find();
    for (let i = 0; i < formations.length; i++) {
      const startDate = new Date(formations[i].startDate);
      const endDate = new Date(formations[i].endDate);
      const durationInMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInDays = Math.floor(durationInMilliseconds / (1000 * 3600 * 24)); // Convertir en jours entiers
      formations[i].duration = durationInDays + " jours"; // Ajouter la durée à la formation actuelle
    }
    res.json(formations);
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de la récupération des formations");
  }
}



async function update(req, res, next) {
  try {
    if (req.body.participantCount && req.body.participantCount > 20) {
      return res.status(400).send("Le nombre de participants ne peut pas dépasser 20");
    }

    await Formation.findByIdAndUpdate(req.params.id, req.body);
    res.send("Mise à jour effectuée");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de la mise à jour de la formation");
  }
}

async function remove(req, res, next) {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) {
      return res.status(404).send("Formation non trouvée");
    }

    formation.placedisponible += 1;
    await formation.save();

    await Formation.findByIdAndDelete(req.params.id);
    res.send("Suppression effectuée");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de la suppression de la formation");
  }
}

module.exports = { add, reserve, show, update, remove };
