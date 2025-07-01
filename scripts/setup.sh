#!/bin/bash

echo "🔧 Configuration Agent Morphius - Nümtema AGENCY"

# Créer les dossiers nécessaires
mkdir -p logs
mkdir -p scripts

# Installation des dépendances Python
echo "📦 Installation des dépendances..."
pip install google-generativeai==0.8.3
pip install python-dotenv==1.0.0
pip install asyncio
pip install aiofiles
pip install requests

# Vérification de l'installation
echo "✅ Vérification des installations..."
python -c "import google.generativeai; print('✅ google-generativeai OK')"
python -c "import dotenv; print('✅ python-dotenv OK')"

# Configuration des variables d'environnement
echo "🔑 Configuration des variables d'environnement..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Fichier .env créé. Veuillez configurer votre GEMINI_API_KEY"
fi

echo "🎉 Configuration terminée !"
echo "📋 Prochaines étapes :"
echo "   1. Configurez votre GEMINI_API_KEY dans le fichier .env"
echo "   2. Testez l'agent avec: python scripts/agent_morphius_fixed.py"
