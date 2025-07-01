"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, LinkIcon, X } from "lucide-react"

interface MediaUploadProps {
  onMediaSelect: (media: { type: "video" | "audio" | "image"; url: string }) => void
  currentMedia?: { type: "video" | "audio" | "image"; url: string }
}

export function MediaUpload({ onMediaSelect, currentMedia }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [mediaUrl, setMediaUrl] = useState(currentMedia?.url || "")
  const [mediaType, setMediaType] = useState<"video" | "audio" | "image">(currentMedia?.type || "image")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        const fileType = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "image"

        onMediaSelect({ type: fileType, url: result.url })
        setMediaUrl(result.url)
        setMediaType(fileType)
      }
    } catch (error) {
      console.error("Erreur upload:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (mediaUrl.trim()) {
      onMediaSelect({ type: mediaType, url: mediaUrl.trim() })
    }
  }

  const handleRemoveMedia = () => {
    setMediaUrl("")
    onMediaSelect({ type: "image", url: "" })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Type de Média</Label>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as "video" | "audio" | "image")}
          className="w-full mt-2 p-2 border rounded-md"
        >
          <option value="image">Image</option>
          <option value="video">Vidéo</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      <div>
        <Label>URL du Média</Label>
        <div className="flex space-x-2 mt-2">
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/media.jpg"
            className="flex-1"
          />
          <Button onClick={handleUrlSubmit} variant="outline">
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="text-center text-gray-500">ou</div>

      <div>
        <Label>Upload de Fichier</Label>
        <div className="mt-2">
          <input
            type="file"
            accept={mediaType === "video" ? "video/*" : mediaType === "audio" ? "audio/*" : "image/*"}
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="w-full cursor-pointer bg-transparent" disabled={isUploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Upload en cours..." : "Choisir un fichier"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {currentMedia?.url && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Média actuel</p>
              <p className="text-xs text-gray-600 truncate">{currentMedia.url}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveMedia}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
