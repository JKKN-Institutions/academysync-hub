import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SessionCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  sessionName: string;
}

export const SessionCancellationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  sessionName
}: SessionCancellationDialogProps) => {
  const { toast } = useToast();
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cancellationReason.trim()) {
      toast({
        title: "Cancellation reason required",
        description: "Please provide a reason for cancelling the session.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(cancellationReason.trim());
      setCancellationReason("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
          <DialogDescription>
            You are about to cancel "{sessionName}". Please provide a reason for the cancellation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Reason for Cancellation *</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please explain why this session is being cancelled..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Keep Session
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Cancel Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};