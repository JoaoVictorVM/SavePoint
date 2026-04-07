"use client";

import { useState } from "react";
import { TagPill } from "./TagPill";
import { assignTagToGame, removeTagFromGame } from "@/actions/tags";
import toast from "react-hot-toast";
import type { Tag } from "@/schema/tags";

interface TagPickerProps {
  allTags: Tag[];
  assignedTags: Tag[];
  gameId: string;
  onTagsChanged: (tags: Tag[]) => void;
}

export function TagPicker({
  allTags,
  assignedTags,
  gameId,
  onTagsChanged,
}: TagPickerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const assignedIds = new Set(assignedTags.map((t) => t.id));
  const atMax = assignedTags.length >= 5;

  async function handleToggle(tag: Tag) {
    const isAssigned = assignedIds.has(tag.id);
    setLoading(tag.id);

    if (isAssigned) {
      const result = await removeTagFromGame(gameId, tag.id);
      if (result.success) {
        onTagsChanged(assignedTags.filter((t) => t.id !== tag.id));
      } else {
        toast.error(result.error);
      }
    } else {
      if (atMax) {
        toast.error("Máximo de 5 tags por jogo atingido");
        setLoading(null);
        return;
      }
      const result = await assignTagToGame(gameId, tag.id);
      if (result.success) {
        onTagsChanged([...assignedTags, tag]);
      } else {
        toast.error(result.error);
      }
    }

    setLoading(null);
  }

  if (allTags.length === 0) {
    return (
      <p className="text-sm text-[#71717A]">
        Nenhuma tag criada. Crie tags no menu do usuário.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const isAssigned = assignedIds.has(tag.id);
        const isDisabled = !isAssigned && atMax;
        const isLoading = loading === tag.id;

        return (
          <div key={tag.id} className="relative">
            <TagPill
              tag={tag}
              size="md"
              selected={isAssigned}
              disabled={isDisabled || isLoading}
              onClick={() => handleToggle(tag)}
            />
            {isAssigned && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#06E09B] rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
        );
      })}
      {atMax && (
        <p className="text-[10px] text-[#A1A1AA] w-full mt-1">
          Máximo de 5 tags atingido
        </p>
      )}
    </div>
  );
}
