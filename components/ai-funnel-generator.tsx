"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AIFunnelGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIFunnelGenerator({ open, onOpenChange }: AIFunnelGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    objective: "",
    targetAudience: "",
    industry: "",
    funnelType: "lead-generation",
    additionalInfo: "",
  })

  const handleGenerate = async () => {
    if (!formData.objective.trim() || !formData.targetAudience.trim()) {
      toast.error("Veuillez remplir au minimum l'objectif et l'audience cible")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/generate-funnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la génération")
      }

      // Créer le funnel
      const createResponse = await fetch("/api/funnels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          config: result.config,
          ai_insights: result.ai_insights,
        }),
      })

      if (!createResponse.ok) {
        const createResult = await createResponse.json()
        throw new Error(createResult.error || "Erreur lors de la création du funnel")
      }

      toast.success("Funnel généré avec succès!")
      onOpenChange(false)

      // Reset form
      setFormData({
        objective: "",
        targetAudience: "",
        industry: "",
        funnelType: "lead-generation",
        additionalInfo: "",
      })

      // Refresh page to show new funnel
      window.location.reload()
    } catch (error) {
      console.error("Error generating funnel:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Générateur de Funnel IA
          </DialogTitle>
          <DialogDescription>
            Décrivez votre objectif et votre audience, l'IA créera un funnel de conversion optimisé.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Assurez-vous d'avoir configuré votre clé API Gemini dans les{" "}
              <a href="/settings" className="underline font-medium">
                paramètres
              </a>{" "}
              pour utiliser cette fonctionnalité.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="objective">Objectif du funnel *</Label>
            <Input
              id="objective"
              placeholder="Ex: Générer des leads pour mon coaching, Vendre ma formation en ligne..."
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Audience cible *</Label>
            <Input
              id="targetAudience"
              placeholder="Ex: Entrepreneurs débutants, Femmes de 25-45 ans..."
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Secteur d'activité</Label>
              <Input
                id="industry"
                placeholder="Ex: Coaching, E-commerce, SaaS..."
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funnelType">Type de funnel</Label>
              <Select
                value={formData.funnelType}
                onValueChange={(value) => setFormData({ ...formData, funnelType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead-generation">Génération de leads</SelectItem>
                  <SelectItem value="sales">Vente directe</SelectItem>
                  <SelectItem value="webinar">Webinaire</SelectItem>
                  <SelectItem value="consultation">Prise de rendez-vous</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Informations additionnelles</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Ajoutez des détails sur votre offre, vos points de douleur, votre proposition de valeur..."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.objective.trim() || !formData.targetAudience.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer le Funnel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
