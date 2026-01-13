import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Shield, Crown, Sparkles } from 'lucide-react';
import { updateProfile } from '@/db/api';
import { ProfilePictureUpload } from '@/components/ui/ProfilePictureUpload';
import { PremiumBadge } from '@/components/ui/PremiumBadge';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !username.trim()) {
      toast({
        title: 'Error',
        description: 'Username cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const result = await updateProfile(user.id, { username });
    setSaving(false);

    if (result) {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      await refreshProfile();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAvatarUploadSuccess = async (url: string) => {
    await refreshProfile();
  };

  const handleUpgradeToPremium = () => {
    toast({
      title: 'Premium Upgrade',
      description: 'Premium subscription feature coming soon! Contact support for early access.',
    });
  };

  const isPremium = profile?.subscription_tier === 'premium';
  const subscriptionExpires = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at)
    : null;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Your account information and role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {/* Profile Picture Upload */}
                {user && (
                  <ProfilePictureUpload
                    userId={user.id}
                    currentAvatarUrl={profile?.avatar_url || null}
                    onUploadSuccess={handleAvatarUploadSuccess}
                  />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{profile?.username || user?.email}</h3>
                    {isPremium && <PremiumBadge size="sm" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {profile?.role === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                    {isPremium && subscriptionExpires && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expires {formatDate(subscriptionExpires.toISOString())}
                      </Badge>
                    )}
                  </div>
                  {!isPremium && (
                    <Button
                      onClick={handleUpgradeToPremium}
                      className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
                      size="sm"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      placeholder="Enter username"
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only letters, numbers, and underscores allowed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Details about your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Member since</span>
                </div>
                <span className="text-sm font-medium">
                  {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Account Role</span>
                </div>
                <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                  {profile?.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">User ID</span>
                </div>
                <span className="text-sm font-mono text-muted-foreground">{user?.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card className={isPremium ? 'border-amber-500/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Premium Features
                  </CardTitle>
                  <CardDescription>
                    {isPremium ? 'You have access to all premium features' : 'Upgrade to unlock premium features'}
                  </CardDescription>
                </div>
                {isPremium && <PremiumBadge />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className={`p-2 rounded-full ${isPremium ? 'bg-amber-500/20' : 'bg-muted'}`}>
                    <Crown className={`h-4 w-4 ${isPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Version History</h4>
                    <p className="text-xs text-muted-foreground">Access and restore previous versions of your documents</p>
                  </div>
                  {!isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className={`p-2 rounded-full ${isPremium ? 'bg-amber-500/20' : 'bg-muted'}`}>
                    <Crown className={`h-4 w-4 ${isPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Export to PDF</h4>
                    <p className="text-xs text-muted-foreground">Download your documents as PDF files</p>
                  </div>
                  {!isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className={`p-2 rounded-full ${isPremium ? 'bg-amber-500/20' : 'bg-muted'}`}>
                    <Crown className={`h-4 w-4 ${isPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Advanced Collaboration</h4>
                    <p className="text-xs text-muted-foreground">Enhanced real-time collaboration features</p>
                  </div>
                  {!isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className={`p-2 rounded-full ${isPremium ? 'bg-amber-500/20' : 'bg-muted'}`}>
                    <Crown className={`h-4 w-4 ${isPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Custom Themes</h4>
                    <p className="text-xs text-muted-foreground">Personalize your editor with custom themes</p>
                  </div>
                  {!isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className={`p-2 rounded-full ${isPremium ? 'bg-amber-500/20' : 'bg-muted'}`}>
                    <Crown className={`h-4 w-4 ${isPremium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Priority Support</h4>
                    <p className="text-xs text-muted-foreground">Get faster response times from our support team</p>
                  </div>
                  {!isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                </div>
              </div>

              {!isPremium && (
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Unlock All Features</h4>
                      <p className="text-xs text-muted-foreground">Get access to all premium features for just $9.99/month</p>
                    </div>
                    <Button
                      onClick={handleUpgradeToPremium}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
                      size="sm"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
