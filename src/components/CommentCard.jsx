import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function CommentCard({
  comment,
  likeState, // "like" | "dislike" | null
  onToggleLike,
  onToggleDislike,
  disabled,

  // ✅ для удаления
  loggedInUser = "butter_bridge",
  onDelete,
  deleting = false,
}) {
  const liked = likeState === "like";
  const disliked = likeState === "dislike";
  const canDelete = comment.author === loggedInUser;

  const dateLabel = new Date(comment.created_at).toLocaleDateString("en-GB");

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mb: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2">{comment.author}</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {dateLabel}
          </Typography>

          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              disabled={disabled || deleting}
              aria-label="Delete comment"
            >
              {deleting ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlineIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Body */}
      <Typography sx={{ whiteSpace: "pre-line", mb: 1.25 }}>
        {comment.body}
      </Typography>

      {/* Reactions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 0.25,
          position: "relative",
          top: "8px",
        }}
      >
        {/* Like */}
        <IconButton
          size="small"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike?.();
          }}
          aria-label={liked ? "Unlike comment" : "Like comment"}
        >
          {liked ? (
            <ThumbUpAltIcon fontSize="small" />
          ) : (
            <ThumbUpAltOutlinedIcon fontSize="small" />
          )}
        </IconButton>

        {/* Dislike */}
        <IconButton
          size="small"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onToggleDislike?.();
          }}
          aria-label={disliked ? "Remove dislike" : "Dislike comment"}
        >
          {disliked ? (
            <ThumbDownAltIcon fontSize="small" />
          ) : (
            <ThumbDownAltOutlinedIcon fontSize="small" />
          )}
        </IconButton>

        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {comment.votes}
        </Typography>
      </Box>
    </Box>
  );
}