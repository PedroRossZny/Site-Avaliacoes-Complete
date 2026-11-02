import Review from '../models/Review.js';

// anonId is never sent back, so one visitor cannot learn another's ID and act as them.
function toPublic(review) {
  const { anonId, ...data } = review.get ? review.get({ plain: true }) : review;
  return data;
}

// Accepts only whole numbers from 1 to 5; anything else returns null.
function parseRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

export async function createReview(req, res) {
  try {
    const { placeId, comment, anonId } = req.body;
    const rating = parseRating(req.body.rating);
    if (!placeId || !anonId || rating === null) {
      return res.status(400).json({ error: 'Informe placeId, anonId e uma nota inteira de 1 a 5' });
    }

    // One vote per visitor and place: voting again replaces the previous vote.
    const existing = await Review.findOne({ where: { placeId: String(placeId), anonId } });
    if (existing) {
      existing.rating = rating;
      if (comment !== undefined) existing.comment = comment;
      await existing.save();
      return res.json(toPublic(existing));
    }

    const review = await Review.create({ placeId: String(placeId), rating, comment, anonId });
    res.status(201).json(toPublic(review));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar review' });
  }
}

// GET /api/reviews?placeId=1&anonId=... ; the frontend passes its own anonId to find its vote.
export async function listReviews(req, res) {
  try {
    const { placeId, anonId } = req.query;
    const where = {};
    if (placeId) where.placeId = placeId;
    if (anonId) where.anonId = anonId;
    const reviews = await Review.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews.map(toPublic));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar reviews' });
  }
}

export async function getAverageRatings(req, res) {
  try {
    const { placeId } = req.params;
    const stats = await Review.findAll({
      where: { placeId },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'count']
      ],
      raw: true
    });
    res.json(stats[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao calcular média de ratings' });
  }
}

// Only the visitor who cast the vote (same anonId) can change it.
export async function updateReview(req, res) {
  try {
    const rating = parseRating(req.body.rating);
    if (rating === null) {
      return res.status(400).json({ error: 'A nota deve ser um número inteiro de 1 a 5' });
    }

    const rev = await Review.findByPk(req.params.id);
    if (!rev) {
      return res.status(404).json({ error: 'Review não encontrada' });
    }
    if (!req.body.anonId || req.body.anonId !== rev.anonId) {
      return res.status(403).json({ error: 'Só quem votou pode alterar este voto' });
    }

    rev.rating = rating;
    if (req.body.comment !== undefined) rev.comment = req.body.comment;
    await rev.save();

    return res.json(toPublic(rev));
  } catch (error) {
    console.error('Erro ao atualizar review:', error);
    res.status(500).json({ error: 'Erro ao atualizar review' });
  }
}
