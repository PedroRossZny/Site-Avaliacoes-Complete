import Comment from '../models/Comment.js';

export async function postComment(req, res) {
  const { placeId, text, anonId, parentCommentId } = req.body;
  try {
    const comment = await Comment.create({ placeId, text, anonId, parentCommentId });
    res.status(201).json(comment);
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
  const comment = await Comment.findByPk(id);
  if (!comment) {
    return res.status(404).json({ error: 'Comentário não encontrado' });
  }
  comment.likeCount = Math.max(comment.likeCount - 1, 0);
  await comment.save();
  return res.json({ likeCount: comment.likeCount });
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
    rows.forEach(c => { map[c.id] = { ...c, respostas: [] }; });

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


export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    await Comment.destroy({ where: { parentCommentId: id } });

    const deleted = await Comment.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao tentar excluir comentário' });
  }
}

