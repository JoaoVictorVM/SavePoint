"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ColorPicker } from "./ColorPicker";
import { TagPill } from "./TagPill";
import { createTag, updateTag, deleteTag } from "@/actions/tags";
import { useAppStore } from "@/stores/useAppStore";
import toast from "react-hot-toast";
import type { Tag } from "@/schema/tags";

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagManager({ isOpen, onClose }: TagManagerProps) {
  const tags = useAppStore((s) => s.tags);
  const addTagStore = useAppStore((s) => s.addTag);
  const updateTagStore = useAppStore((s) => s.updateTag);
  const removeTagStore = useAppStore((s) => s.removeTag);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#2FE0AE");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) return;
    setIsCreating(true);
    setCreateError("");

    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("color", newColor);

    const result = await createTag(formData);

    if (result.success) {
      addTagStore(result.data);
      setNewName("");
      setNewColor("#2FE0AE");
      toast.success("Tag criada!");
    } else {
      setCreateError(result.fieldErrors?.name?.[0] || result.error);
    }

    setIsCreating(false);
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    setIsSaving(true);

    const formData = new FormData();
    formData.set("name", editName.trim());
    formData.set("color", editColor);

    const result = await updateTag(editingId, formData);

    if (result.success) {
      updateTagStore(editingId, result.data);
      setEditingId(null);
      toast.success("Tag atualizada!");
    } else {
      toast.error(result.error);
    }

    setIsSaving(false);
  }

  async function handleDelete(tagId: string) {
    setIsDeleting(true);

    const result = await deleteTag(tagId);

    if (result.success) {
      removeTagStore(tagId);
      setDeletingId(null);
      toast.success("Tag removida!");
    } else {
      toast.error(result.error);
    }

    setIsDeleting(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Tags">
      <div className="space-y-6">
        {/* Create section */}
        <div className="space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da tag..."
            error={createError}
            disabled={isCreating}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <Button
            onClick={handleCreate}
            isLoading={isCreating}
            disabled={!newName.trim()}
            size="sm"
          >
            + Criar Tag
          </Button>
        </div>

        {/* Existing tags */}
        <div className="border-t border-[var(--color-border)] pt-4">
          {tags.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
              Nenhuma tag criada. Crie tags para organizar seus jogos.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center gap-3 p-2 rounded-[12px] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  {editingId === tag.id ? (
                    /* Edit mode */
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={isSaving}
                      />
                      <ColorPicker value={editColor} onChange={setEditColor} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          isLoading={isSaving}
                        >
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : deletingId === tag.id ? (
                    /* Delete confirmation */
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-error)] mb-2">
                        Remover esta tag de todos os jogos?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(tag.id)}
                          isLoading={isDeleting}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <TagPill tag={tag} size="md" />
                      <div className="ml-auto flex gap-1">
                        <button
                          onClick={() => startEdit(tag)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                          aria-label="Editar tag"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingId(tag.id)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/5 transition-colors cursor-pointer"
                          aria-label="Deletar tag"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
