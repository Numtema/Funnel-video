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
import google.generativeai as genai

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

# Configurer Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

class AgentMorphius:
    """Agent Morphius - Optimisation IA des Funnels"""
    
    def __init__(self):
        self.models = GLOBAL_CONFIG["llm_model_configs"]
        self.memory = self._load_memory()
        self.reasoning_schema = {
            "mode": "RRLA",
            "available_modes": ["RRLA", "MORPHIUSVISION", "PILOTPROMPT", "STRATOS"],
            "wm": {"g": "", "sg": "", "ctx": "", "pr": {"completed": [], "current": {}}},
            "chain": {"steps": [], "reflect": "", "note": [], "warn": [], "err": []},
            "kg": {"tri": []},
            "logic": {"propos": [], "proofs": [], "crits": [], "doubts": [], "rules": []}
        }
    
    def _load_memory(self) -> Dict:
        """Charge la mémoire expérientielle de l'agent"""
        try:
            if os.path.exists(GLOBAL_CONFIG["memory_file"]):
                with open(GLOBAL_CONFIG["memory_file"], 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logging.error(f"Erreur chargement mémoire: {e}")
        return {"optimizations": [], "patterns": [], "best_practices": []}
    
    def _save_memory(self):
        """Sauvegarde la mémoire expérientielle"""
        try:
            os.makedirs(os.path.dirname(GLOBAL_CONFIG["memory_file"]), exist_ok=True)
            with open(GLOBAL_CONFIG["memory_file"], 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logging.error(f"Erreur sauvegarde mémoire: {e}")
    
    async def analyze_funnel(self, funnel_data: Dict) -> Dict:
        """Analyse complète d'un funnel avec Gemini 2.5 Pro"""
        
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
            "confidence_level": 0.0-1.0,
            "processing_time": "temps de traitement"
        }}
        """
        
        try:
            start_time = time.time()
            response = await model.generate_content_async(prompt)
            processing_time = time.time() - start_time
            
            # Parser la réponse JSON
            analysis_text = response.text
            # Nettoyer la réponse pour extraire le JSON
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
            logging.error(f"Erreur analyse funnel: {e}")
            return {
                "error": str(e),
                "overall_score": 0,
                "conversion_prediction": 0.0,
                "agent": "Morphius v2.1"
            }
    
    async def optimize_step(self, step_data: Dict, funnel_context: Dict) -> Dict:
        """Optimise une étape spécifique avec Gemini 2.5 Pro"""
        
        model = genai.GenerativeModel(self.models["optimization"])
        
        prompt = f"""
        🧠 AGENT MORPHIUS - OPTIMISATION ÉTAPE
        Framework: Nümtema AGENCY
        
        ÉTAPE À OPTIMISER:
        {json.dumps(step_data, ensure_ascii=False, indent=2)}
        
        CONTEXTE FUNNEL:
        {json.dumps(funnel_context, ensure_ascii=False, indent=2)}
        
        MÉMOIRE EXPÉRIENTIELLE:
        Optimisations précédentes: {len(self.memory.get("optimizations", []))}
        Patterns identifiés: {self.memory.get("patterns", [])}
        
        OPTIMISATION DEMANDÉE:
        1. Titre optimisé (plus engageant)
        2. Contenu amélioré (psychologie persuasive)
        3. Options de réponse optimisées
        4. Suggestions visuelles
        5. Micro-copy amélioré
        6. Analyse des biais cognitifs
        
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
            "microcopy_improvements": [
                {{
                    "original": "texte original",
                    "improved": "texte amélioré",
                    "reason": "raison de l'amélioration"
                }}
            ],
            "cognitive_biases_applied": [
                {{
                    "bias": "nom du biais",
                    "application": "comment il est appliqué",
                    "expected_impact": "impact attendu"
                }}
            ],
            "expected_improvement": "pourcentage d'amélioration attendu",
            "confidence": 0.0-1.0
        }}
        """
        
        try:
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
            logging.error(f"Erreur optimisation étape: {e}")
            return {"error": str(e), "agent": "Morphius v2.1"}
    
    async def generate_insights(self, user_data: Dict) -> List[Dict]:
        """Génère des insights personnalisés avec Gemini 2.5 Flash"""
        
        model = genai.GenerativeModel(self.models["fast_draft"])
        
        prompt = f"""
        🧠 AGENT MORPHIUS - INSIGHTS PERSONNALISÉS
        Framework: Nümtema AGENCY
        
        DONNÉES UTILISATEUR:
        {json.dumps(user_data, ensure_ascii=False, indent=2)}
        
        GÉNÉREZ 5 INSIGHTS PERSONNALISÉS:
        - Tendances détectées
        - Opportunités d'optimisation
        - Alertes de performance
        - Recommandations stratégiques
        - Prédictions de marché
        
        FORMAT JSON:
        [
            {{
                "type": "optimization|trend|alert|recommendation|prediction",
                "title": "Titre de l'insight",
                "message": "Message détaillé",
                "priority": "high|medium|low",
                "impact": "impact estimé",
                "action_required": "action recommandée",
                "confidence": 0.0-1.0
            }}
        ]
        """
        
        try:
            response = await model.generate_content_async(prompt)
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            
            if json_match:
                insights = json.loads(json_match.group())
                for insight in insights:
                    insight["agent"] = "Morphius v2.1"
                    insight["timestamp"] = datetime.now().isoformat()
                
                return insights
            else:
                return []
                
        except Exception as e:
            logging.error(f"Erreur génération insights: {e}")
            return []
    
    async def predict_conversion(self, funnel_data: Dict, historical_data: List[Dict]) -> Dict:
        """Prédit le taux de conversion avec Gemini 2.5 Pro"""
        
        model = genai.GenerativeModel(self.models["analysis"])
        
        prompt = f"""
        🧠 AGENT MORPHIUS - PRÉDICTION CONVERSION
        Framework: Nümtema AGENCY
        
        FUNNEL ACTUEL:
        {json.dumps(funnel_data, ensure_ascii=False, indent=2)}
        
        DONNÉES HISTORIQUES:
        {json.dumps(historical_data[-10:], ensure_ascii=False, indent=2)}  # 10 derniers
        
        PRÉDICTION DEMANDÉE:
        1. Taux de conversion prédit
        2. Intervalle de confiance
        3. Facteurs influençant la prédiction
        4. Scénarios optimiste/pessimiste
        5. Recommandations pour améliorer
        
        RÉPONDEZ EN JSON:
        {{
            "predicted_conversion_rate": 0.0-100.0,
            "confidence_interval": {{"min": 0.0, "max": 100.0}},
            "influencing_factors": [
                {{
                    "factor": "nom du facteur",
                    "impact": "positif|négatif|neutre",
                    "weight": 0.0-1.0
                }}
            ],
            "scenarios": {{
                "optimistic": {{"rate": 0.0, "conditions": "conditions optimales"}},
                "realistic": {{"rate": 0.0, "conditions": "conditions normales"}},
                "pessimistic": {{"rate": 0.0, "conditions": "conditions défavorables"}}
            }},
            "improvement_recommendations": [
                {{
                    "action": "action recommandée",
                    "expected_lift": "amélioration attendue en %",
                    "effort_required": "effort nécessaire"
                }}
            ],
            "model_confidence": 0.0-1.0
        }}
        """
        
        try:
            response = await model.generate_content_async(prompt)
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            
            if json_match:
                prediction = json.loads(json_match.group())
                prediction["agent"] = "Morphius v2.1"
                prediction["timestamp"] = datetime.now().isoformat()
                
                return prediction
            else:
                raise ValueError("Impossible de parser la prédiction")
                
        except Exception as e:
            logging.error(f"Erreur prédiction conversion: {e}")
            return {"error": str(e), "predicted_conversion_rate": 0.0}

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
