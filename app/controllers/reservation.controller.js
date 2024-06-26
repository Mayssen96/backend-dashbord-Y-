const pdfmake = require('pdfmake');
const fs = require('fs');
const Reservation = require('../models/reservation.model');
const Formation = require("../models/formation.model");
// Fonction pour générer le PDF de réservation
// Fonction pour générer le PDF de réservation
// Fonction pour générer le PDF de réservation
// Fonction pour générer le PDF de réservation
// Fonction pour générer le PDF de réservation
// Fonction pour générer le PDF de réservation
async function generateReservationPDF(reservationId) {
  try {
    const reservation = await Reservation.findById(reservationId).populate('formationId').populate('userId');
    if (!reservation) {
      throw new Error("Réservation introuvable");
    }

    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const startDate = new Date(reservation.formationId.startDate);
    const endDate = new Date(reservation.formationId.endDate);
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Calcul de la durée en jours

    const documentDefinition = {
      content: [
        { text: 'Bienvenue chez ARTETTA', style: 'header' },
        { text: 'Détails de la réservation', style: 'subheader' },
        { text: `ID de la réservation: ${reservation.id}`, style: 'subheader' },
        { text: `ID de l'utilisateur: ${reservation.userId._id}`, style: 'subheader' }, // Ajouter l'identifiant de l'utilisateur
        { text: `Date de la réservation: ${reservation.date.toISOString().split('T')[0]}` }, // Affichage sans l'heure
        { text: `Statut: ${reservation.status}` },
        { text: `Formation associée: ${reservation.formationId.title}`, style: 'subheader' },

       
        { text: `Début: ${reservation.formationId.startDate.toISOString().split('T')[0]}` }, // Affichage sans l'heure
        { text: `Fin: ${reservation.formationId.endDate.toISOString().split('T')[0]}` }, // Affichage sans l'heure
        { text: `Durée: ${durationInDays} jour(s)`, style: 'subheader' },
        { text: `Enseignant: ${reservation.formationId.teacher}` },
        
       
      ],
      styles: {
        header: { fontSize: 24, bold: true, margin: [0, 0, 0, 10], alignment: 'center', color: 'red' }, // Taille de police plus grande
        subheader: { fontSize: 18, bold: true, margin: [0, 10, 0, 5] } // Taille de police réduite
      },
      defaultStyle: {
        font: 'Roboto'
      },
      fonts: fonts
    };

    const printer = new pdfmake(fonts);
    const pdfDoc = printer.createPdfKitDocument(documentDefinition);

    const fileName = `reservation_${reservation.id}.pdf`;
    const filePath = `./pdfs/${fileName}`;

    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();

    return filePath;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF de réservation:", error);
    throw error;
  }
}




// Fonction pour mettre à jour le statut de la réservation
async function updateReservationStatus(reservation) {
  try {
    const currentDate = new Date();
    const reservationDate = new Date(reservation.date);
    
    // Comparer les dates sans tenir compte de l'heure
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const reservationDateOnly = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate());

    if (reservationDateOnly < currentDateOnly) {
      reservation.status = "Expirée";
    } else if (reservationDateOnly.getTime() === currentDateOnly.getTime()) {
      reservation.status = "En cours";
    } else {
      const millisecondsUntilReservation = reservationDateOnly.getTime() - currentDateOnly.getTime();
      const daysUntilReservation = Math.ceil(millisecondsUntilReservation / (1000 * 3600 * 24));
      reservation.status = `À venir (${daysUntilReservation} jours)`;
    }
    await reservation.save();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation :", error);
  }
}

// Fonction pour ajouter une réservation
// Fonction pour ajouter une réservation
async function add(req, res, next) {
  try {
    const { formationId, date, userId, ...reservationData } = req.body;

    // Vérifier si l'utilisateur a déjà réservé cette formation
    const existingReservation = await Reservation.findOne({ formationId, userId });
    if (existingReservation) {
      return res.status(400).send("Vous avez déjà réservé cette formation");
    }

    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).send("Formation non trouvée");
    }
    if (formation.placedisponible <= 0) {
      return res.status(400).send("Aucune place disponible pour cette formation");
    }

    // Calculer la durée de la formation
    const startDate = new Date(formation.startDate);
    const endDate = new Date(formation.endDate);
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const reservation = new Reservation({
      date,
      userId,
      formationId,
      ...reservationData,
      duration: durationInDays // Ajouter la durée de la formation à la réservation
    });
    await reservation.save();
    await updateReservationStatus(reservation);
    formation.placedisponible -= 1;
    formation.participantCount += 1;
    await formation.save();

    // Générer le PDF de la réservation avec le code QR
    const pdfPath = await generateReservationPDF(reservation.id);

    res.json({ message: "Réservation ajoutée", pdfPath });
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de l'ajout de la réservation");
  }
}



// Fonction pour afficher les réservations
// Fonction pour afficher les réservations
// Fonction pour afficher les réservations
// Fonction pour afficher les réservations
// Fonction pour afficher les réservations
async function show(req, res, next) {
  try {
    const currentDate = new Date();
    console.log("Current Date:", currentDate); // Journal pour vérifier la date actuelle

    // Récupérer toutes les réservations et peupler les champs formationId et userId
    const reservations = await Reservation.find().populate('formationId').populate('userId');
    console.log("Reservations:", reservations); // Journal pour vérifier les réservations récupérées

    const reservationsWithDetails = reservations.map(reservation => {
      if (!reservation.formationId || !reservation.userId) {
        console.warn(`Reservation ${reservation.id} does not have a valid formationId or userId`); // Journal des réservations sans userId ou formationId
        return null;
      }
      const { id, date, status, details, formationId, userId } = reservation;
      const { startDate, endDate, duration, teacher, title } = formationId;

      const reservationDate = new Date(date);
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const reservationDateOnly = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate());

      const remainingTime = reservationDateOnly - currentDateOnly;
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24)); // Convertir en jours

      const reservationStatus = reservationDateOnly < currentDateOnly ? "Expirée"
                             : reservationDateOnly.getTime() === currentDateOnly.getTime() ? "En cours"
                             : `À venir (${remainingDays} jour(s))`;

      return {
        id,
        userId: userId._id, // Inclure userId dans la sortie, en accédant à son _id
        date: date.toISOString().split('T')[0], // Affichage sans l'heure
        status: reservationStatus,
        details,
        formation: {
          title,
          startDate: startDate.toISOString().split('T')[0], // Affichage sans l'heure
          endDate: endDate.toISOString().split('T')[0], // Affichage sans l'heure
          duration,
          teacher
        }
      };
    }).filter(Boolean); // Supprime les éléments nuls du tableau

    console.log("Reservations with Details:", reservationsWithDetails); // Journal pour vérifier les détails des réservations
    res.json(reservationsWithDetails);
  } catch (err) {
    console.log("Erreur lors de la récupération des réservations:", err); // Journal pour l'erreur
    res.status(500).send("Erreur lors de la récupération des réservations");
  }
}


// Fonction pour mettre à jour une réservation
async function update(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).send("Réservation non trouvée");
    }
    const { formationId, ...updatedData } = req.body;
    const formation = await Formation.findById(reservation.formationId);

    if (!formation) {
      return res.status(404).send("Formation non trouvée");
    }

    if (updatedData.date && new Date(updatedData.date) !== reservation.date) {
      const newFormation = await Formation.findById(formationId);
      if (newFormation.placedisponible <= 0) {
        return res.status(400).send("Aucune place disponible pour cette formation");
      }
      formation.placedisponible += 1; // Libérer une place dans l'ancienne formation
      formation.participantCount -= 1; // Décrémenter le nombre de participants dans l'ancienne formation
      newFormation.placedisponible -= 1; // Prendre une place dans la nouvelle formation
      newFormation.participantCount += 1; // Incrémenter le nombre de participants dans la nouvelle formation
      await formation.save();
      await newFormation.save();
    }

    reservation.set(updatedData);
    await reservation.save();
    await updateReservationStatus(reservation);
    res.json(reservation);
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de la mise à jour de la réservation");
  }
}

// Fonction pour supprimer une réservation
async function remove(req, res, next) {
  try {
    const reservation = await Reservation.findByIdAndRemove(req.params.id);
    if (!reservation) {
      return res.status(404).send("Réservation non trouvée");
    }
    const formation = await Formation.findById(reservation.formationId);
    if (formation) {
      formation.placedisponible += 1;
      formation.participantCount -= 1;
      await formation.save();
    }
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de la suppression de la réservation");
  }
}

module.exports = {
  add,
  show,
  update,
  remove,
};
