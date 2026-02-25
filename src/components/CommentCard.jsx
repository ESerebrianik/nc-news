// src/components/CommentCard.jsx
import { Box, IconButton, Typography } from "@mui/material";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

export default function CommentCard({
  comment,
  likeState,          // "like" | "dislike" | null
  onToggleLike,
  onToggleDislike,
  disabled,
}) {
  const liked = likeState === "like";
  const disliked = likeState === "dislike";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
      }}
    >
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
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.created_at).toLocaleDateString("en-GB")}
        </Typography>
      </Box>

      <Typography sx={{ whiteSpace: "pre-line", mb: 1.25 }}>
        {comment.body}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 0.25, 
          position: "relative",
          top: "8px"
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