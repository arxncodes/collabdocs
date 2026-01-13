import { ReactNode } from 'react';
import { Crown, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SubscriptionTier } from '@/types/types';

interface PremiumFeatureGateProps {
  children: ReactNode;
  userTier: SubscriptionTier;
  featureName: string;
  featureDescription?: string;
  onUpgrade?: () => void;
}

export function PremiumFeatureGate({
  children,
  userTier,
  featureName,
  featureDescription,
  onUpgrade,
}: PremiumFeatureGateProps) {
  const isPremium = userTier === 'premium';

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="p-6 max-w-md bg-background/95 backdrop-blur">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
              <p className="text-muted-foreground">
                {featureDescription || `${featureName} is only available for Premium users`}
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface PremiumFeatureLockProps {
  featureName: string;
  userTier: SubscriptionTier;
  onUpgrade?: () => void;
}

export function PremiumFeatureLock({
  featureName,
  userTier,
  onUpgrade,
}: PremiumFeatureLockProps) {
  const [showDialog, setShowDialog] = React.useState(false);
  const isPremium = userTier === 'premium';

  if (isPremium) return null;

  return (
    <>
      <div
        className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={() => setShowDialog(true)}
      >
        <Lock className="h-3 w-3" />
        Premium
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Premium Feature
            </DialogTitle>
            <DialogDescription>
              {featureName} is only available for Premium subscribers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Premium Benefits:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Access to version history</span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Export documents to PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Advanced collaboration features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Custom themes and styling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <Button
              onClick={() => {
                setShowDialog(false);
                onUpgrade?.();
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add React import
import * as React from 'react';
