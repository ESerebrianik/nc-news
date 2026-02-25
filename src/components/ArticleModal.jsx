
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";

import CommentCard from "./CommentCard";

import {
  fetchArticleById,
  fetchCommentsByArticleId,
  postComment,
  patchCommentVotes,
} from "../api";

export default function ArticleModal({
  open,
  articleId,
  onClose,
  loggedInUser = "butter_bridge",

  // лайк статьи (как у тебя уже работает)
  votes,
  liked,
  onToggleLike,
  likeDisabled,
}) {
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);

  const [loadingArticle, setLoadingArticle] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const commentsRef = useRef(null);

  // -----------------------------
  // ✅ реакции на комментарии: like | dislike | null
  // хранение: { [commentId]: "like" | "dislike" }
  // -----------------------------
  const [commentReactions, setCommentReactions] = useState(() => {
    try {
      const raw = localStorage.getItem("commentReactions");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [reactingCommentIds, setReactingCommentIds] = useState(() => new Set());

  useEffect(() => {
    localStorage.setItem("commentReactions", JSON.stringify(commentReactions));
  }, [commentReactions]);

  const getReaction = (commentId) => commentReactions[commentId] ?? null;

  // -----------------------------
  // загрузка статьи + комментариев
  // -----------------------------
  useEffect(() => {
    if (!open || !articleId) return;

    let ignore = false;

    setError("");
    setArticle(null);
    setComments([]);
    setCommentBody("");

    const load = async () => {
      try {
        setLoadingArticle(true);
        setLoadingComments(true);

        const [a, c] = await Promise.all([
          fetchArticleById(articleId),
          fetchCommentsByArticleId(articleId),
        ]);

        if (ignore) return;
        setArticle(a);
        setComments(c);
      } catch (e) {
        if (ignore) return;
        setError(e.message || "Failed to load article");
      } finally {
        if (ignore) return;
        setLoadingArticle(false);
        setLoadingComments(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [open, articleId]);

  // дата
  const dateLabel = useMemo(() => {
    if (!article?.created_at) return "";
    return new Date(article.created_at).toLocaleDateString("en-GB");
  }, [article]);

  // лайки статьи: показываем из пропсов (синхронно с листом)
  const votesLabel = typeof votes === "number" ? votes : article?.votes;

  // -----------------------------
  // ✅ добавить комментарий
  // -----------------------------
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    try {
      setPosting(true);
      const newComment = await postComment(articleId, {
        username: loggedInUser,
        body,
      });
      setComments((curr) => [newComment, ...curr]);
      setCommentBody("");
      setTimeout(
        () => commentsRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    } catch (e) {
      setError(e.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const toggleCommentReaction = async (commentId, target) => {
    if (reactingCommentIds.has(commentId)) return;

    const prev = getReaction(commentId); // "like" | "dislike" | null

    // считаем inc_votes
    let inc = 0;
    let next = null;

    if (prev === target) {
      // снять реакцию
      next = null;
      inc = target === "like" ? -1 : +1;
    } else {
      // поставить target
      next = target;
      if (prev === null) inc = target === "like" ? +1 : -1;
      else if (prev === "like" && target === "dislike") inc = -2;
      else if (prev === "dislike" && target === "like") inc = +2;
    }

    setReactingCommentIds((s) => new Set(s).add(commentId));

    // optimistic votes
    setComments((curr) =>
      curr.map((c) =>
        c.comment_id === commentId ? { ...c, votes: (c.votes ?? 0) + inc } : c
      )
    );

    // optimistic reaction
    setCommentReactions((curr) => {
      const copy = { ...curr };
      if (next === null) delete copy[commentId];
      else copy[commentId] = next;
      return copy;
    });

    try {
      const updated = await patchCommentVotes(commentId, inc);
      setComments((curr) =>
        curr.map((c) =>
          c.comment_id === commentId ? { ...c, votes: updated.votes } : c
        )
      );
    } catch (e) {
      // rollback votes
      setComments((curr) =>
        curr.map((c) =>
          c.comment_id === commentId ? { ...c, votes: (c.votes ?? 0) - inc } : c
        )
      );

      // rollback reaction
      setCommentReactions((curr) => {
        const copy = { ...curr };
        if (prev === null) delete copy[commentId];
        else copy[commentId] = prev;
        return copy;
      });

      setError(e.message || "Failed to update comment reaction");
    } finally {
      setReactingCommentIds((s) => {
        const nextSet = new Set(s);
        nextSet.delete(commentId);
        return nextSet;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ pr: 2 }}>
          {article ? article.title : "Loading..."}
        </Typography>

        <IconButton onClick={onClose} aria-label="Close modal">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "75vh" }}>
        {(loadingArticle || loadingComments) && !article && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {article && (
          <>
            {/* Meta + Like статьи */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mb: 2,
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Topic: <b>{article.topic}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Author: <b>{article.author}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: <b>{dateLabel}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comments: <b>{article.comment_count}</b>
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  ml: "auto",
                }}
              >
                <IconButton
                  size="small"
                  disabled={likeDisabled}
                  onClick={onToggleLike}
                  aria-label={liked ? "Unlike article" : "Like article"}
                >
                  {liked ? (
                    <ThumbUpAltIcon fontSize="small" />
                  ) : (
                    <ThumbUpAltOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
                <Typography variant="body2">{votesLabel}</Typography>
              </Box>
            </Box>

            {/* Image */}
            {article.article_img_url && (
              <Box
                component="img"
                src={article.article_img_url}
                alt={article.title}
                sx={{
                  width: "100%",
                  height: { xs: 180, sm: 260 },
                  objectFit: "cover",
                  borderRadius: 2,
                  mb: 2,
                }}
              />
            )}

            {/* Body */}
            <Typography sx={{ whiteSpace: "pre-line", mb: 3 }}>
              {article.body}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box ref={commentsRef} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              Comments
            </Typography>

            {/* Add comment */}
            <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 2 }}>
              <TextField
                label="Add a comment"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button type="submit" variant="contained" disabled={posting}>
                  {posting ? "Posting..." : "Post"}
                </Button>
              </Box>
            </Box>

            {/* Comments list */}
            {loadingComments ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            ) : comments.length === 0 ? (
              <Typography color="text.secondary">No comments yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {comments.map((c) => (
                  <CommentCard
                    key={c.comment_id}
                    comment={c}
                    likeState={getReaction(c.comment_id)} // "like" | "dislike" | null
                    disabled={reactingCommentIds.has(c.comment_id)}
                    onToggleLike={() => toggleCommentReaction(c.comment_id, "like")}
                    onToggleDislike={() =>
                      toggleCommentReaction(c.comment_id, "dislike")
                    }
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}