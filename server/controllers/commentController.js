import Comment from '../models/Comment.js';

const MAX_COMMENT_LENGTH = 1000;

// anonId is never sent back, so one visitor cannot learn another's ID and act as them.
function toPublic(comment) {
  const { anonId, ...data } = comment.get ? comment.get({ plain: true }) : comment;
  return data;
}

export async function postComment(req, res) {
  const { anonId, parentCommentId } = req.body;
  const placeId = Number(req.body.placeId);
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

  if (!Number.isInteger(placeId) || placeId < 1 || !anonId) {
    return res.status(400).json({ error: 'Informe placeId e anonId' });
  }
  if (!text || text.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({ error: `O comentário deve ter de 1 a ${MAX_COMMENT_LENGTH} caracteres` });
  }

  try {
    // A reply must point to an existing comment on the same place.
    if (parentCommentId) {
      const parent = await Comment.findByPk(parentCommentId);
      if (!parent || parent.placeId !== placeId) {
        return res.status(400).json({ error: 'Comentário original não encontrado neste estabelecimento' });
      }
    }

    const comment = await Comment.create({ placeId, text, anonId, parentCommentId: parentCommentId || null });
    res.status(201).json(toPublic(comment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
}

export async function likeComment(req, res) {
  const { id } = req.params;
  try {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    comment.likeCount += 1;
    await comment.save();
    res.json({ likeCount: comment.likeCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao curtir comentário' });
  }
}

export async function unlikeComment(req, res) {
  const { id } = req.params;
  try {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    comment.likeCount = Math.max(comment.likeCount - 1, 0);
    await comment.save();
    return res.json({ likeCount: comment.likeCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao descurtir comentário' });
  }
}

export async function getComments(req, res) {
  const { placeId, sortBy } = req.query;

  if (!placeId) {
    return res.status(400).json({ error: 'Parâmetro "placeId" é obrigatório na query' });
  }

  try {
    const rows = await Comment.findAll({
      where: { placeId },
      order: [['createdAt', 'DESC']],
      raw: true
    });

    const map = {};
    rows.forEach(c => { map[c.id] = { ...toPublic(c), respostas: [] }; });

    const roots = [];
    rows.forEach(c => {
      if (c.parentCommentId && map[c.parentCommentId]) {
        map[c.parentCommentId].respostas.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    if (sortBy === 'curtidas') {
      roots.sort((a, b) => b.likeCount - a.likeCount);
      roots.forEach(r => r.respostas.sort((a, b) => b.likeCount - a.likeCount));
    }

    res.json(roots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
}

// Only the author (same anonId, sent in the body or the query string) can delete a comment.
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const anonId = req.body?.anonId || req.query.anonId;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    if (!anonId || anonId !== comment.anonId) {
      return res.status(403).json({ error: 'Só quem escreveu pode excluir este comentário' });
    }

    await Comment.destroy({ where: { parentCommentId: id } });
    await comment.destroy();
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao tentar excluir comentário' });
  }
}
