"""
Agent Morphius avec Intégration Settings UI
Nümtema AGENCY - Framework Exclusif
"""

import asyncio
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime

from settings_manager import get_settings_manager, AIProviderConfig

# Imports conditionnels des IA
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

class AgentMorphiusWithSettings:
    """Agent Morphius avec configuration UI dynamique"""
    
    def __init__(self):
        self.settings = get_settings_manager()
        self.logger = self._setup_logging()
        
    def _setup_logging(self):
        import logging
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger("AgentMorphius")
    
    async def analyze_funnel_with_ui_settings(self, funnel_data: Dict) -> Dict:
        """Analyse de funnel avec paramètres UI"""
        
        # Vérifier le mode démo
        if self.settings.is_demo_mode():
            return self._get_demo_analysis(funnel_data)
        
        # Obtenir le provider actif
        active_provider = self.settings.get_active_provider()
        if not active_provider:
            self.logger.warning("Aucun provider IA configuré, utilisation du mode démo")
            return self._get_demo_analysis(funnel_data)
        
        # Essayer avec le provider principal
        try:
            return await self._analyze_with_provider(funnel_data, active_provider)
        except Exception as e:
            self.logger.error(f"Erreur avec {active_provider.name}: {e}")
            
            # Essayer les fallbacks si activés
            if self.settings.general_settings.auto_fallback:
                fallback_providers = self.settings.get_fallback_providers()
                
                for provider in fallback_providers[1:]:  # Skip le premier (déjà essayé)
                    try:
                        self.logger.info(f"Tentative avec fallback: {provider.name}")
                        return await self._analyze_with_provider(funnel_data, provider)
                    except Exception as fallback_error:
                        self.logger.error(f"Fallback {provider.name} échoué: {fallback_error}")
                        continue
            
            # Tous les providers ont échoué, utiliser le mode démo
            self.logger.warning("Tous les providers ont échoué, utilisation du mode démo")
            return self._get_demo_analysis(funnel_data)
    
    async def _analyze_with_provider(self, funnel_data: Dict, provider: AIProviderConfig) -> Dict:
        """Analyse avec un provider spécifique"""
        
        if provider.id == "gemini" and GEMINI_AVAILABLE:
            return await self._analyze_with_gemini(funnel_data, provider)
        elif provider.id == "openai" and OPENAI_AVAILABLE:
            return await self._analyze_with_openai(funnel_data, provider)
        elif provider.id == "anthropic" and ANTHROPIC_AVAILABLE:
            return await self._analyze_with_anthropic(funnel_data, provider)
        else:
            raise Exception(f"Provider {provider.id} non disponible")
    
    async def _analyze_with_gemini(self, funnel_data: Dict, provider: AIProviderConfig) -> Dict:
        """Analyse avec Gemini"""
        genai.configure(api_key=provider.api_key)
        model = genai.GenerativeModel(provider.model)
        
        prompt = f"""
        🧠 AGENT MORPHIUS - ANALYSE FUNNEL PREMIUM
        
        Analysez ce funnel: {json.dumps(funnel_data, ensure_ascii=False)}
        
        Répondez en JSON avec:
        - overall_score (0-100)
        - conversion_prediction (0-100)
        - recommendations (liste)
        - confidence_level (0-1)
        """
        
        response = await model.generate_content_async(prompt)
        
        # Parser la réponse JSON
        import re
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result["provider_used"] = provider.name
            result["model_used"] = provider.model
            return result
        else:
            raise Exception("Impossible de parser la réponse Gemini")
    
    async def _analyze_with_openai(self, funnel_data: Dict, provider: AIProviderConfig) -> Dict:
        """Analyse avec OpenAI"""
        client = openai.OpenAI(api_key=provider.api_key)
        
        response = await client.chat.completions.acreate(
            model=provider.model,
            messages=[
                {
                    "role": "system",
                    "content": "Tu es l'Agent Morphius, expert en analyse de funnels. Réponds toujours en JSON valide."
                },
                {
                    "role": "user", 
                    "content": f"Analyse ce funnel: {json.dumps(funnel_data)}"
                }
            ]
        )
        
        result = json.loads(response.choices[0].message.content)
        result["provider_used"] = provider.name
        result["model_used"] = provider.model
        return result
    
    async def _analyze_with_anthropic(self, funnel_data: Dict, provider: AIProviderConfig) -> Dict:
        """Analyse avec Anthropic"""
        client = anthropic.Anthropic(api_key=provider.api_key)
        
        response = await client.messages.acreate(
            model=provider.model,
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": f"Analyse ce funnel en JSON: {json.dumps(funnel_data)}"
                }
            ]
        )
        
        result = json.loads(response.content[0].text)
        result["provider_used"] = provider.name
        result["model_used"] = provider.model
        return result
    
    def _get_demo_analysis(self, funnel_data: Dict) -> Dict:
        """Analyse de démonstration"""
        return {
            "overall_score": 78.5,
            "conversion_prediction": 24.2,
            "engagement_factors": [
                "Design professionnel",
                "Questions pertinentes",
                "Call-to-action clair"
            ],
            "friction_points": [
                "Formulaire potentiellement trop long",
                "Manque de preuve sociale"
            ],
            "recommendations": [
                {
                    "type": "urgency",
                    "description": "Ajouter un timer d'urgence",
                    "expected_improvement": "+25% conversion"
                },
                {
                    "type": "social_proof",
                    "description": "Intégrer des témoignages",
                    "expected_improvement": "+18% crédibilité"
                }
            ],
            "confidence_level": 0.85,
            "provider_used": "Mode Démo",
            "model_used": "simulation",
            "timestamp": datetime.now().isoformat(),
            "agent": "Morphius Ultimate v3.0"
        }

# Instance globale
agent_morphius_ui = AgentMorphiusWithSettings()

# Interface pour l'API
async def analyze_funnel_with_ui_config(funnel_data: Dict) -> Dict:
    """Interface d'analyse avec configuration UI"""
    return await agent_morphius_ui.analyze_funnel_with_ui_settings(funnel_data)

if __name__ == "__main__":
    # Test
    async def test():
        test_funnel = {
            "title": "Test Funnel",
            "type": "health_quiz"
        }
        
        result = await agent_morphius_ui.analyze_funnel_with_ui_settings(test_funnel)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    asyncio.run(test())
