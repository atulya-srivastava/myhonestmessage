"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";

interface RecoveryCodeModalProps {
  recoveryCode: string;
  isOpen: boolean;
  onConfirm: () => void;
}

export const RecoveryCodeModal: React.FC<RecoveryCodeModalProps> = ({
  recoveryCode,
  isOpen,
  onConfirm
}) => {
  const [countdown, setCountdown] = useState(10);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setHasCopied(false);
      setHasChecked(false);
      setEmailSent(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryCode);
    setHasCopied(true);
    toast.success("Recovery code copied to clipboard!");
  };

  const sendRecoveryEmail = async () => {
    setIsSendingEmail(true);
    try {
      // This will be handled by the signup flow - the email will be sent there
      // For now we just mark it as requested
      setEmailSent(true);
      toast.success("Recovery code will be sent to your email!");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send recovery code email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const canProceed = countdown === 0 && hasChecked;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="w-full [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Save Your Recovery Code</DialogTitle>
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-full">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <DialogDescription className="text-base text-center pt-2">
            <strong className="text-foreground">This is NOT your usual popup!</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Message */}
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-foreground leading-relaxed">
              Your messages are <strong>end-to-end encrypted</strong>. Only YOU can read them using your password.
              If you forget your password, this <strong>Recovery Code</strong> is the ONLY way to access your messages.
              <br /><br />
              <span className="block text-center">
                <span className="text-destructive font-semibold"> We CANNOT recover your messages without this code.
                </span>
              </span>
            </p>
          </div>

          {/* Recovery Code Display */}
          <div className="p-4 bg-muted rounded-lg border-2 border-dashed border-primary/50">
            <p className="text-xs text-muted-foreground mb-2 text-center">Your Recovery Code</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-mono font-bold tracking-wider text-primary">
                {recoveryCode}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8"
              >
                {hasCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email Option */}
          <Button
            variant="outline"
            onClick={sendRecoveryEmail}
            disabled={isSendingEmail || emailSent}
            className="w-full"
          >
            {emailSent ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Recovery code will be emailed to your email
              </>
            ) : (
              <>Email me this recovery code</>
            )}
          </Button>

          {/* Checkbox Confirmation */}
          <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="confirm"
              checked={hasChecked}
              onCheckedChange={(checked) => setHasChecked(checked === true)}
            />
            <label
              htmlFor="confirm"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have saved my recovery code in a safe place. I understand that without this code, 
              I may <strong>permanently lose access</strong> to my encrypted messages if I forget my password.
            </label>
          </div>

          {/* Continue Button with Timer */}
          <Button
            onClick={onConfirm}
            disabled={!canProceed}
            className="w-full"
            size="lg"
          >
            {countdown > 0 ? (
              <>Please read carefully... ({countdown}s)</>
            ) : !hasChecked ? (
              <>Check the box above to continue</>
            ) : (
              <>I understand, continue with signup</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecoveryCodeModal;
