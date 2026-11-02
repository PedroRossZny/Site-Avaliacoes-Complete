import { Router } from 'express';
import {
  createReview,
  listReviews,
  getAverageRatings,
  updateReview
} from '../controllers/reviewController.js';

const router = Router();

router.post('/', createReview);
router.get('/', listReviews);
router.get('/average/:placeId', getAverageRatings);
router.put('/:id', updateReview);

export default router;
