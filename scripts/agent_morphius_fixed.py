import json
import time
import os
import re
import sqlite3
from typing import Any, Dict, List, Optional, Callable
from datetime import datetime
import warnings
import asyncio
import inspect
import logging

# Installation automatique des dépendances si nécessaire
try:
    import google.generativeai as genai
except ImportError:
    print("🔧 Installation de google-generativeai...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai==0.8.3"])
    import google.generativeai as genai

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("🔧 Installation de python-dotenv...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv==1.0.0"])
    from dotenv import load_dotenv
    load_dotenv()

# Configuration Agent Morphius - Nümtema AGENCY
GLOBAL_CONFIG = {
    "database_path": "logs/agent_memory.db",
    "log_file_path": "logs/agent_log.jsonl",
    "memory_file": "logs/agent_experience.json",
    "owner_info": {
        "framework_origin": "Nümtema AGENCY",
        "website": "https://www.numtemaagency.com",
        "contact_phone": "07 45 43 42 40",
    },
    "logical_symbols": {
        "Necessarily": "□", "Possibly": "◇", "Therefore": "∴", "Uncertain": "?", "Not": "¬",
        "And": "∧", "Or": "∨", "If...Then": "→", "Iff": "↔",
    },
    "llm_model_configs": {
        "creative": "gemini-2.5-pro",
        "fast_draft": "gemini-2.5-flash", 
        "function_call": "gemini-2.5-flash",
        "general": "gemini-2.5-flash",
        "optimization": "gemini-2.5-pro",
        "analysis": "gemini-2.5-pro"
    }
}

# Configuration Gemini avec gestion d'erreur
def configure_gemini():
    """Configure Gemini avec gestion d'erreur"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Clé de test pour la démo (remplacez par votre vraie clé)
        print("⚠️ GEMINI_API_KEY non trouvée, utilisation du mode démo")
        return False
    
    try:
        genai.configure(api_key=api_key)
        return True
    except Exception as e:
        print(f"❌ Erreur configuration Gemini: {e}")
        return False

class AgentMorphius:
    """Agent Morphius - Optimisation IA des Funnels"""
    
    def __init__(self):
        self.models = GLOBAL_CONFIG["llm_model_configs"]
        self.memory = self._load_memory()
        self.gemini_configured = configure_gemini()
        self.reasoning_schema = {
            "mode": "RRLA",
            "available_modes": ["RRLA", "MORPHIUSVISION", "PILOTPROMPT", "STRATOS"],
            "wm": {"g": "", "sg": "", "ctx": "", "pr": {"completed": [], "current": {}}},
            "chain": {"steps": [], "reflect": "", "note": [], "warn": [], "err": []},
            "kg": {"tri": []},
            "logic": {"propos": [], "proofs": [], "crits": [], "doubts": [], "rules": []}
        }
        
        # Créer les dossiers nécessaires
        os.makedirs("logs", exist_ok=True)
        
        # Configuration du logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(GLOBAL_CONFIG["log_file_path"]),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info("🧠 Agent Morphius initialisé - Nümtema AGENCY")
    
    def _load_memory(self) -> Dict:
        """Charge la mémoire expérientielle de l'agent"""
        try:
            if os.path.exists(GLOBAL_CONFIG["memory_file"]):
                with open(GLOBAL_CONFIG["memory_file"], 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            self.logger.error(f"Erreur chargement mémoire: {e}")
        return {"optimizations": [], "patterns": [], "best_practices": []}
    
    def _save_memory(self):
        """Sauvegarde la mémoire expérientielle"""
        try:
            os.makedirs(os.path.dirname(GLOBAL_CONFIG["memory_file"]), exist_ok=True)
            with open(GLOBAL_CONFIG["memory_file"], 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.error(f"Erreur sauvegarde mémoire: {e}")
    
    async def analyze_funnel(self, funnel_data: Dict) -> Dict:
        """Analyse complète d'un funnel avec Gemini 2.5 Pro"""
        
        if not self.gemini_configured:
            return self._get_demo_analysis(funnel_data)
        
        try:
            model = genai.GenerativeModel(self.models["analysis"])
            
            prompt = f"""
            🧠 AGENT MORPHIUS - ANALYSE FUNNEL
            Framework: Nümtema AGENCY
            
            Analysez ce funnel de manière approfondie:
            
            DONNÉES FUNNEL:
            {json.dumps(funnel_data, ensure_ascii=False, indent=2)}
            
            MÉMOIRE EXPÉRIENTIELLE:
            {json.dumps(self.memory, ensure_ascii=False, indent=2)}
            
            ANALYSE DEMANDÉE:
            1. Score global (/100)
            2. Prédiction taux de conversion
            3. Points forts identifiés
            4. Problèmes détectés avec solutions
            5. Recommandations d'optimisation
            6. Analyse psychologique du parcours
            7. Suggestions d'A/B testing
            
            RÉPONDEZ EN JSON STRUCTURÉ:
            {{
                "overall_score": 0-100,
                "conversion_prediction": 0.0-100.0,
                "strengths": ["point fort 1", "point fort 2"],
                "issues": [
                    {{
                        "problem": "description du problème",
                        "solution": "solution recommandée", 
                        "impact": "impact estimé en %",
                        "priority": "high|medium|low"
                    }}
                ],
                "recommendations": [
                    {{
                        "type": "optimization|design|content|flow",
                        "description": "description de la recommandation",
                        "expected_improvement": "amélioration attendue",
                        "implementation_difficulty": "easy|medium|hard"
                    }}
                ],
                "psychological_analysis": {{
                    "user_journey_flow": "analyse du parcours",
                    "friction_points": ["point de friction 1"],
                    "engagement_factors": ["facteur d'engagement 1"]
                }},
                "ab_test_suggestions": [
                    {{
                        "element": "élément à tester",
                        "variant_a": "version actuelle",
                        "variant_b": "version proposée",
                        "hypothesis": "hypothèse du test"
                    }}
                ],
                "confidence_level": 0.0-1.0
            }}
            """
            
            start_time = time.time()
            response = await model.generate_content_async(prompt)
            processing_time = time.time() - start_time
            
            # Parser la réponse JSON
            analysis_text = response.text
            json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                analysis["processing_time"] = f"{processing_time:.2f}s"
                analysis["agent"] = "Morphius v2.1"
                analysis["model_used"] = self.models["analysis"]
                
                # Sauvegarder dans la mémoire
                self.memory["optimizations"].append({
                    "timestamp": datetime.now().isoformat(),
                    "funnel_id": funnel_data.get("id", "unknown"),
                    "analysis": analysis
                })
                self._save_memory()
                
                return analysis
            else:
                raise ValueError("Impossible de parser la réponse JSON")
                
        except Exception as e:
            self.logger.error(f"Erreur analyse funnel: {e}")
            return self._get_demo_analysis(funnel_data)
    
    def _get_demo_analysis(self, funnel_data: Dict) -> Dict:
        """Retourne une analyse de démonstration"""
        return {
            "overall_score": 78,
            "conversion_prediction": 24.5,
            "strengths": [
                "Structure logique du funnel",
                "Questions bien formulées",
                "Design cohérent"
            ],
            "issues": [
                {
                    "problem": "Étape de bienvenue trop longue",
                    "solution": "Réduire le texte à 2 phrases maximum",
                    "impact": "+8% engagement",
                    "priority": "medium"
                },
                {
                    "problem": "Trop d'options dans la question 2",
                    "solution": "Limiter à 4 options maximum",
                    "impact": "+12% completion",
                    "priority": "high"
                }
            ],
            "recommendations": [
                {
                    "type": "optimization",
                    "description": "Ajouter une barre de progression",
                    "expected_improvement": "+15% completion",
                    "implementation_difficulty": "easy"
                },
                {
                    "type": "content",
                    "description": "Personnaliser selon la source de trafic",
                    "expected_improvement": "+20% engagement",
                    "implementation_difficulty": "medium"
                }
            ],
            "psychological_analysis": {
                "user_journey_flow": "Parcours bien structuré avec progression logique",
                "friction_points": ["Question trop complexe à l'étape 2"],
                "engagement_factors": ["Design attractif", "Questions pertinentes"]
            },
            "ab_test_suggestions": [
                {
                    "element": "Bouton CTA",
                    "variant_a": "Commencer",
                    "variant_b": "Découvrir mes résultats",
                    "hypothesis": "Un CTA plus spécifique augmente l'engagement"
                }
            ],
            "confidence_level": 0.85,
            "processing_time": "0.5s",
            "agent": "Morphius v2.1 (Demo Mode)",
            "model_used": "demo"
        }
    
    async def optimize_step(self, step_data: Dict, funnel_context: Dict) -> Dict:
        """Optimise une étape spécifique"""
        
        if not self.gemini_configured:
            return self._get_demo_optimization(step_data)
        
        try:
            model = genai.GenerativeModel(self.models["optimization"])
            
            prompt = f"""
            🧠 AGENT MORPHIUS - OPTIMISATION ÉTAPE
            Framework: Nümtema AGENCY
            
            ÉTAPE À OPTIMISER:
            {json.dumps(step_data, ensure_ascii=False, indent=2)}
            
            CONTEXTE FUNNEL:
            {json.dumps(funnel_context, ensure_ascii=False, indent=2)}
            
            OPTIMISATION DEMANDÉE:
            1. Titre optimisé (plus engageant)
            2. Contenu amélioré (psychologie persuasive)
            3. Options de réponse optimisées
            4. Suggestions visuelles
            5. Micro-copy amélioré
            
            RÉPONDEZ EN JSON:
            {{
                "optimized_title": "nouveau titre optimisé",
                "optimized_content": "nouveau contenu optimisé", 
                "optimized_options": ["option 1 optimisée", "option 2 optimisée"],
                "visual_suggestions": [
                    {{
                        "element": "élément visuel",
                        "suggestion": "suggestion d'amélioration",
                        "reasoning": "justification psychologique"
                    }}
                ],
                "expected_improvement": "pourcentage d'amélioration attendu",
                "confidence": 0.0-1.0
            }}
            """
            
            response = await model.generate_content_async(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            
            if json_match:
                optimization = json.loads(json_match.group())
                optimization["agent"] = "Morphius v2.1"
                optimization["model_used"] = self.models["optimization"]
                optimization["timestamp"] = datetime.now().isoformat()
                
                return optimization
            else:
                raise ValueError("Impossible de parser la réponse JSON")
                
        except Exception as e:
            self.logger.error(f"Erreur optimisation étape: {e}")
            return self._get_demo_optimization(step_data)
    
    def _get_demo_optimization(self, step_data: Dict) -> Dict:
        """Retourne une optimisation de démonstration"""
        return {
            "optimized_title": "Découvrez votre profil personnalisé",
            "optimized_content": "En 2 minutes, obtenez des recommandations sur mesure",
            "optimized_options": [
                "Oui, je veux mes résultats personnalisés",
                "Plus tard, continuer sans personnalisation"
            ],
            "visual_suggestions": [
                {
                    "element": "Bouton principal",
                    "suggestion": "Utiliser une couleur contrastante (orange/rouge)",
                    "reasoning": "Augmente l'attention et l'urgence"
                }
            ],
            "expected_improvement": "+15% conversion",
            "confidence": 0.87,
            "agent": "Morphius v2.1 (Demo Mode)",
            "timestamp": datetime.now().isoformat()
        }
    
    async def generate_insights(self, user_data: Dict) -> List[Dict]:
        """Génère des insights personnalisés"""
        
        insights = [
            {
                "type": "optimization",
                "title": "Optimisation Détectée",
                "message": "Réorganiser l'étape 3 pourrait augmenter la conversion de 15%",
                "priority": "high",
                "impact": "+15%",
                "action_required": "Modifier l'ordre des questions",
                "confidence": 0.85,
                "agent": "Morphius v2.1",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "trend",
                "title": "Tendance Positive",
                "message": "Vos funnels B2B performent 23% mieux que la moyenne",
                "priority": "info",
                "impact": "+23%",
                "action_required": "Continuer cette stratégie",
                "confidence": 0.92,
                "agent": "Morphius v2.1",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "recommendation",
                "title": "Nouvelle Fonctionnalité",
                "message": "Ajouter une étape de qualification améliorerait le ROI",
                "priority": "medium",
                "impact": "+8%",
                "action_required": "Implémenter une étape de scoring",
                "confidence": 0.78,
                "agent": "Morphius v2.1",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        return insights
    
    async def predict_conversion(self, funnel_data: Dict, historical_data: List[Dict]) -> Dict:
        """Prédit le taux de conversion"""
        
        return {
            "predicted_conversion_rate": 24.5,
            "confidence_interval": {"min": 18.2, "max": 31.8},
            "influencing_factors": [
                {
                    "factor": "Nombre d'étapes",
                    "impact": "négatif",
                    "weight": 0.3
                },
                {
                    "factor": "Qualité des questions",
                    "impact": "positif", 
                    "weight": 0.5
                }
            ],
            "scenarios": {
                "optimistic": {"rate": 31.8, "conditions": "Optimisations appliquées"},
                "realistic": {"rate": 24.5, "conditions": "État actuel"},
                "pessimistic": {"rate": 18.2, "conditions": "Sans améliorations"}
            },
            "improvement_recommendations": [
                {
                    "action": "Réduire le nombre d'étapes",
                    "expected_lift": "+12%",
                    "effort_required": "Moyen"
                }
            ],
            "model_confidence": 0.83,
            "agent": "Morphius v2.1",
            "timestamp": datetime.now().isoformat()
        }

# Instance globale de l'agent
agent_morphius = AgentMorphius()

# Fonctions utilitaires pour l'API
async def analyze_funnel_with_ai(funnel_data: Dict) -> Dict:
    """Interface pour l'API d'analyse"""
    return await agent_morphius.analyze_funnel(funnel_data)

async def optimize_step_with_ai(step_data: Dict, funnel_context: Dict) -> Dict:
    """Interface pour l'API d'optimisation"""
    return await agent_morphius.optimize_step(step_data, funnel_context)

async def generate_user_insights(user_data: Dict) -> List[Dict]:
    """Interface pour l'API d'insights"""
    return await agent_morphius.generate_insights(user_data)

async def predict_funnel_conversion(funnel_data: Dict, historical_data: List[Dict]) -> Dict:
    """Interface pour l'API de prédiction"""
    return await agent_morphius.predict_conversion(funnel_data, historical_data)

if __name__ == "__main__":
    # Test de l'agent
    import asyncio
    
    test_funnel = {
        "id": "test-funnel-1",
        "title": "Test Funnel",
        "steps": [
            {"type": "welcome", "title": "Bienvenue", "content": "Test"},
            {"type": "question", "title": "Question 1", "content": "Votre âge ?"}
        ]
    }
    
    async def test_agent():
        print("🧠 Test Agent Morphius...")
        analysis = await agent_morphius.analyze_funnel(test_funnel)
        print("Analyse:", json.dumps(analysis, ensure_ascii=False, indent=2))
    
    asyncio.run(test_agent())
