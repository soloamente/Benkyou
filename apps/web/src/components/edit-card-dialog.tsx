"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateCard, type Card } from "@/lib/cards-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card;
  onSuccess?: (card: Card) => void;
}

export function EditCardDialog({
  open,
  onOpenChange,
  card,
  onSuccess,
}: EditCardDialogProps) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [isLoading, setIsLoading] = useState(false);

  // Update form when card changes
  useEffect(() => {
    if (open && card) {
      setFront(card.front);
      setBack(card.back);
    }
  }, [open, card]);

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFront(card.front);
      setBack(card.back);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!front.trim()) {
      toast.error("Front field is required");
      return;
    }

    if (!back.trim()) {
      toast.error("Back field is required");
      return;
    }

    setIsLoading(true);

    try {
      const updatedCard = await updateCard(card.id, {
        front: front.trim(),
        back: back.trim(),
      });
      toast.success("Card updated successfully");
      handleOpenChange(false);
      onSuccess?.(updatedCard);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update card. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the front (question) and back (answer) of the card.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-front">Front</Label>
              <Textarea
                id="edit-front"
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                disabled={isLoading}
                autoFocus
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-back">Back</Label>
              <Textarea
                id="edit-back"
                placeholder="Enter the answer..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              disabled={isLoading || !front.trim() || !back.trim()}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Card"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
