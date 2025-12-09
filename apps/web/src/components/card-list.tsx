"use client";

import { useState } from "react";
import { type Card } from "@/lib/cards-api";
import { Edit, Trash2 } from "lucide-react";
import { EditCardDialog } from "@/components/edit-card-dialog";
import { deleteCard } from "@/lib/cards-api";
import { toast } from "sonner";

interface CardListProps {
  cards: Card[];
  onCardUpdated: (card: Card) => void;
  onCardDeleted: (cardId: string) => void;
}

export function CardList({
  cards,
  onCardUpdated,
  onCardDeleted,
}: CardListProps) {
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleDelete = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) {
      return;
    }

    setDeletingCardId(cardId);
    try {
      await deleteCard(cardId);
      toast.success("Card deleted successfully");
      onCardDeleted(cardId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete card. Please try again.",
      );
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleCardUpdated = (updatedCard: Card) => {
    onCardUpdated(updatedCard);
    setEditingCard(null);
  };

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Front
              </p>
              <p className="text-sm whitespace-pre-wrap">{card.front}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Back
              </p>
              <p className="text-sm whitespace-pre-wrap">{card.back}</p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => setEditingCard(card)}
            >
              <Edit className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => handleDelete(card.id)}
              disabled={deletingCardId === card.id}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}

      {editingCard && (
        <EditCardDialog
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
          card={editingCard}
          onSuccess={handleCardUpdated}
        />
      )}
    </div>
  );
}



