"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { deleteMemory } from "@/actions/memories"

interface DeleteMemoryButtonProps {
  memoryId: string
}

export function DeleteMemoryButton({ memoryId }: DeleteMemoryButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMemory(memoryId)
      if (result && "error" in result) {
        setError(result.error)
        setShowConfirm(false)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-red-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50"
      >
        <Trash2 size={14} />
        Supprimer
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full flex flex-col gap-4">
            <h2 className="text-lg font-medium text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>
              Supprimer ce souvenir ?
            </h2>
            <p className="text-sm text-[#888888]">
              Cette action est irréversible. Le souvenir et tous ses médias seront définitivement supprimés.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {isPending ? "Suppression…" : "Oui, supprimer"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm text-[#888888] hover:text-[#1A1A1A] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
