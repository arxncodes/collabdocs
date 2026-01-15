import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Check, X, Loader2, AlertCircle, Clock, User } from 'lucide-react';
import { getInvitationByToken, acceptInvitation, declineInvitation } from '@/db/api';
import type { DocumentInvitation } from '@/types/types';

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<DocumentInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;

    setLoading(true);
    const invite = await getInvitationByToken(token);
    setLoading(false);

    if (!invite) {
      setError('Invitation not found or has expired');
      return;
    }

    // Check if expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      setError('This invitation has expired');
      return;
    }

    // Check if max uses reached
    if (invite.max_uses && invite.use_count >= invite.max_uses) {
      setError('This invitation has reached its maximum number of uses');
      return;
    }

    setInvitation(invite);
  };

  const handleAccept = async () => {
    if (!invitation || !token || !user) {
      if (!user) {
        toast({
          title: 'Login Required',
          description: 'Please login to accept this invitation',
          variant: 'destructive',
        });
        navigate('/login', { state: { from: `/invite/${token}` } });
      }
      return;
    }

    setProcessing(true);
    const result = await acceptInvitation(invitation.id, token, user.id);
    setProcessing(false);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'You have been added as a collaborator',
      });
      navigate(`/editor/${invitation.document_id}`, { replace: true });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to accept invitation. You may already be a collaborator.',
        variant: 'destructive',
      });
    }
  };

  const handleDecline = async () => {
    if (!invitation || !user) return;

    setProcessing(true);
    const success = await declineInvitation(invitation.id, user.id);
    setProcessing(false);

    if (success) {
      toast({
        title: 'Declined',
        description: 'You have declined this invitation',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to decline invitation',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Document Invitation</CardTitle>
          <CardDescription className="text-center">
            You've been invited to collaborate on a document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Info */}
          <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Document</p>
              <p className="font-semibold text-lg">{invitation.document?.title || 'Untitled Document'}</p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invited by</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {invitation.creator?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">
                    {invitation.creator?.username || invitation.creator?.email || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Role</p>
                <Badge variant={getRoleBadgeVariant(invitation.role)} className="text-sm">
                  {invitation.role}
                </Badge>
              </div>
            </div>

            {invitation.document?.owner && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Document Owner</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {invitation.document.owner.username || invitation.document.owner.email}
                  </span>
                </div>
              </div>
            )}

            {invitation.expires_at && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expires</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(invitation.expires_at)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Role Description */}
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">What you can do as {invitation.role}</h3>
            {invitation.role === 'editor' ? (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View and read the document</li>
                <li>• Edit and modify content</li>
                <li>• Add and reply to comments</li>
                <li>• See other collaborators</li>
              </ul>
            ) : (
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View and read the document</li>
                <li>• Add and reply to comments</li>
                <li>• See other collaborators</li>
                <li>• Cannot edit content</li>
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                You need to be logged in to accept this invitation
              </p>
              <Button
                onClick={() => navigate('/login', { state: { from: `/invite/${token}` } })}
                className="w-full"
              >
                Login to Accept
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={processing}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
