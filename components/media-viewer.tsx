"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaViewerProps {
  media: {
    type: "video" | "audio" | "image"
    url: string
  }
  isWelcomeScreen?: boolean
  className?: string
}

export function MediaViewer({ media, isWelcomeScreen = false, className = "" }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  if (media.type === "image") {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={media.url || "/placeholder.svg"}
          alt="Media content"
          fill
          className={`object-cover ${isWelcomeScreen ? "brightness-75" : ""}`}
          priority={isWelcomeScreen}
        />
        {isWelcomeScreen && <div className="absolute inset-0 bg-black/30" />}
      </div>
    )
  }

  if (media.type === "video") {
    return (
      <div className={`relative ${className}`}>
        <video
          src={media.url}
          className={`w-full h-full object-cover ${isWelcomeScreen ? "brightness-75" : ""}`}
          autoPlay={isWelcomeScreen}
          loop
          muted={isMuted}
          playsInline
        />
        {isWelcomeScreen && <div className="absolute inset-0 bg-black/30" />}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    )
  }

  if (media.type === "audio") {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-gray-900`}>
        <audio src={media.url} controls className="w-full max-w-md" />
        {isWelcomeScreen && <div className="absolute inset-0 bg-black/30" />}
      </div>
    )
  }

  return null
}
