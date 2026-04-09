"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ColorPicker } from "@/components/tags/ColorPicker";
import { TagPill } from "@/components/tags/TagPill";
import { createPlatform, updatePlatform, deletePlatform } from "@/actions/platforms";
import { useAppStore } from "@/stores/useAppStore";
import toast from "react-hot-toast";
import type { Platform } from "@/schema/platforms";

interface PlatformManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformManager({ isOpen, onClose }: PlatformManagerProps) {
  const platformsList = useAppStore((s) => s.platforms);
  const addPlatformStore = useAppStore((s) => s.addPlatform);
  const updatePlatformStore = useAppStore((s) => s.updatePlatform);
  const removePlatformStore = useAppStore((s) => s.removePlatform);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
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

    const result = await createPlatform(formData);

    if (result.success) {
      addPlatformStore(result.data);
      setNewName("");
      setNewColor("#3B82F6");
      toast.success("Plataforma criada!");
    } else {
      setCreateError(result.fieldErrors?.name?.[0] || result.error);
    }

    setIsCreating(false);
  }

  function startEdit(platform: Platform) {
    setEditingId(platform.id);
    setEditName(platform.name);
    setEditColor(platform.color);
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    setIsSaving(true);

    const formData = new FormData();
    formData.set("name", editName.trim());
    formData.set("color", editColor);

    const result = await updatePlatform(editingId, formData);

    if (result.success) {
      updatePlatformStore(editingId, result.data);
      setEditingId(null);
      toast.success("Plataforma atualizada!");
    } else {
      toast.error(result.error);
    }

    setIsSaving(false);
  }

  async function handleDelete(platformId: string) {
    setIsDeleting(true);

    const result = await deletePlatform(platformId);

    if (result.success) {
      removePlatformStore(platformId);
      setDeletingId(null);
      toast.success("Plataforma removida!");
    } else {
      toast.error(result.error);
    }

    setIsDeleting(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Plataformas">
      <div className="space-y-6">
        {/* Create section */}
        <div className="space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da plataforma..."
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
            + Criar Plataforma
          </Button>
        </div>

        {/* Existing platforms */}
        <div className="border-t border-[#E4E4E7] pt-4">
          {platformsList.length === 0 ? (
            <p className="text-sm text-[#71717A] text-center py-4">
              Nenhuma plataforma criada. Crie plataformas para organizar seus jogos.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
              {platformsList.map((platform) => (
                <li
                  key={platform.id}
                  className="flex items-center gap-3 p-2 rounded-[12px] hover:bg-[#F4F4F5] transition-colors"
                >
                  {editingId === platform.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={isSaving}
                      />
                      <ColorPicker value={editColor} onChange={setEditColor} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} isLoading={isSaving}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : deletingId === platform.id ? (
                    <div className="flex-1">
                      <p className="text-sm text-[#FF453A] mb-2">
                        Remover esta plataforma?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(platform.id)}
                          isLoading={isDeleting}
                        >
                          Confirmar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <TagPill tag={platform} size="md" />
                      <div className="ml-auto flex gap-1">
                        <button
                          onClick={() => startEdit(platform)}
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#E4E4E7] transition-colors cursor-pointer"
                          aria-label="Editar plataforma"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingId(platform.id)}
                          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer"
                          aria-label="Deletar plataforma"
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
