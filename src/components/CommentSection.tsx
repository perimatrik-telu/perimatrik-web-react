import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faReply, 
  faTrash, 
  faPaperPlane, 
  faComments,
  faSignInAlt
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Comment {
  id: string;
  body: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  created_at: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId?: string;
  newsId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId, newsId }) => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const fetchComments = async () => {
    try {
      const params = articleId ? { article_id: articleId } : { news_id: newsId };
      const response = await api.get("/content/comments", { params });
      setComments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId, newsId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/content/comments", {
        body: newComment,
        article_id: articleId,
        news_id: newsId,
        parent_id: replyTo?.id
      });
      setNewComment("");
      setReplyTo(null);
      fetchComments();
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/content/comments/${id}`);
      fetchComments();
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete comment");
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ marginBottom: '20px' }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar 
          src={comment.user.avatar || "/images/default-avatar.webp"} 
          sx={{ width: isReply ? 32 : 44, height: isReply ? 32 : 44, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
        />
        <Box sx={{ flexGrow: 1 }}>
          <Paper elevation={0} sx={{ 
            p: 2, 
            borderRadius: 3, 
            bgcolor: isReply ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "800" }}>{comment.user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
              {comment.body}
            </Typography>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5, ml: 1 }}>
            {user && (
              <Button 
                size="small" 
                startIcon={<FontAwesomeIcon icon={faReply} style={{ fontSize: '10px' }} />}
                sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '0.75rem', p: 0, minWidth: 0 }}
                onClick={() => {
                  setReplyTo(comment);
                  const inputEl = document.getElementById('comment-input');
                  if (inputEl) {
                    window.scrollTo({ top: inputEl.offsetTop - 100, behavior: 'smooth' });
                  }
                }}
              >
                Reply
              </Button>
            )}
            {(user?.id === comment.user.id || user?.role === 'admin') && (
              <Button 
                size="small" 
                color="error"
                startIcon={<FontAwesomeIcon icon={faTrash} style={{ fontSize: '10px' }} />}
                sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '0.75rem', p: 0, minWidth: 0, opacity: 0.6, '&:hover': { opacity: 1 } }}
                onClick={() => handleDelete(comment.id)}
              >
                Delete
              </Button>
            )}
          </Box>

          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2, ml: 2, borderLeft: '2px solid rgba(0,0,0,0.05)', pl: 2 }}>
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );

  if (authLoading) {
    return (
      <Box sx={{ mt: 8, mb: 5, textAlign: 'center' }}>
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Menyiapkan diskusi...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 8, mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <FontAwesomeIcon icon={faComments} style={{ color: '#e67817', fontSize: '1.5rem' }} />
        <Typography variant="h5" sx={{ fontWeight: "900" }}>Diskusi ({comments.length})</Typography>
      </Box>

      {/* Comment Input */}
      <Box id="comment-input" sx={{ mb: 6 }}>
        {user ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', bgcolor: 'background.paper' }}>
            {replyTo && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, bgcolor: 'rgba(230, 120, 23, 0.05)', p: 1.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  Replying to <b>{replyTo.user.name}</b>
                </Typography>
                <IconButton size="small" onClick={() => setReplyTo(null)}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>{t('crud.batal')}</Typography>
                </IconButton>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar src={user.avatar || ""} />
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Bagikan pemikiran kamu..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    disabled={submitting || !newComment.trim()}
                    onClick={handleSubmit}
                    sx={{ 
                      borderRadius: 50, px: 4, fontWeight: '900', textTransform: 'none',
                      background: 'linear-gradient(135deg, #e67817) 0%, #ff9800 100%)',
                      boxShadow: '0 8px 20px rgba(230, 120, 23, 0.3)'
                    }}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <FontAwesomeIcon icon={faPaperPlane} />}
                  >
                    Kirim Komentar
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '2px dashed rgba(0,0,0,0.1)', bgcolor: 'rgba(0,0,0,0.01)' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Kamu harus masuk untuk dapat ikut berdiskusi.
            </Typography>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined" 
              startIcon={<FontAwesomeIcon icon={faSignInAlt} />}
              sx={{ borderRadius: 50, fontWeight: 'bold', textTransform: 'none', px: 4 }}
            >
              Masuk ke Portal
            </Button>
          </Paper>
        )}
      </Box>

      {/* Comments List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <AnimatePresence>
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 5, opacity: 0.5 }}>
              <Typography>Belum ada diskusi. Jadilah yang pertama berkomentar!</Typography>
            </Box>
          )}
        </AnimatePresence>
      )}
    </Box>
  );
};
