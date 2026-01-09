import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Check, X } from 'lucide-react';
import type { Comment } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { createComment, toggleCommentResolved, deleteComment } from '@/db/api';

interface CommentsPanelProps {
  documentId: string;
  comments: Comment[];
  currentUserId: string;
  onUpdate: () => void;
}

export function CommentsPanel({ documentId, comments, currentUserId, onUpdate }: CommentsPanelProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    const result = await createComment(documentId, currentUserId, newComment);
    setLoading(false);

    if (result) {
      toast({
        title: 'Success',
        description: 'Comment added',
      });
      setNewComment('');
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    setLoading(true);
    const result = await createComment(documentId, currentUserId, replyText, undefined, undefined, parentId);
    setLoading(false);

    if (result) {
      toast({
        title: 'Success',
        description: 'Reply added',
      });
      setReplyText('');
      setReplyTo(null);
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add reply',
        variant: 'destructive',
      });
    }
  };

  const handleToggleResolved = async (commentId: string, resolved: boolean) => {
    const success = await toggleCommentResolved(commentId, !resolved);
    if (success) {
      toast({
        title: 'Success',
        description: resolved ? 'Comment reopened' : 'Comment resolved',
      });
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      toast({
        title: 'Success',
        description: 'Comment deleted',
      });
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwner = comment.user_id === currentUserId;

    return (
      <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
        <div className="flex gap-3 p-3 rounded-lg border border-border bg-card">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {comment.user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{comment.user?.username || comment.user?.email}</span>
              <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
              {comment.resolved && (
                <Badge variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
            <div className="flex items-center gap-2 mt-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setReplyTo(comment.id)}
                >
                  Reply
                </Button>
              )}
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleToggleResolved(comment.id, comment.resolved)}
                >
                  {comment.resolved ? 'Reopen' : 'Resolve'}
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}

        {/* Reply Input */}
        {replyTo === comment.id && (
          <div className="ml-8 mt-2 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex flex-col gap-1">
              <Button size="icon" onClick={() => handleAddReply(comment.id)} disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setReplyTo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
            </div>
          ) : (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleAddComment();
              }
            }}
          />
          <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Ctrl+Enter to send</p>
      </div>
    </div>
  );
}
