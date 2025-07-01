#!/bin/bash

echo "🚀 Configuration FACEÀFACE Ultimate - Agent Morphius"
echo "Inspiré des funnels de conversion premium"
echo "Nümtema AGENCY - Framework Exclusif"

# Créer la structure de dossiers
echo "📁 Création de la structure..."
mkdir -p logs
mkdir -p scripts
mkdir -p public/uploads
mkdir -p public/media

# Exécuter l'auto-installer
echo "🔧 Installation automatique des dépendances..."
python scripts/auto_installer.py

# Vérifier l'installation
echo "✅ Vérification de l'installation..."
python -c "
try:
    from scripts.agent_morphius_ultimate import agent_morphius
    print('🧠 Agent Morphius Ultimate: OK')
except Exception as e:
    print(f'⚠️ Agent Morphius: {e}')

try:
    import google.generativeai
    print('🤖 Gemini AI: OK')
except ImportError:
    print('⚠️ Gemini AI: Non configuré (mode démo disponible)')
"

# Configuration des variables d'environnement
echo "🔑 Configuration des variables d'environnement..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Agent Morphius Ultimate - Configuration
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/faceaface

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Mode de développement
NODE_ENV=development
ENVIRONMENT=development

# Nümtema AGENCY
AGENCY_NAME="Nümtema AGENCY"
AGENCY_WEBSITE="https://www.numtemaagency.com"
AGENCY_PHONE="07 45 43 42 40"
EOF
    echo "📝 Fichier .env créé avec les templates"
else
    echo "📝 Fichier .env existant conservé"
fi

# Test de l'agent
echo "🧪 Test de l'Agent Morphius Ultimate..."
python scripts/agent_morphius_ultimate.py

echo ""
echo "🎉 Configuration terminée !"
echo "📋 Prochaines étapes :"
echo "   1. Configurez vos clés API dans le fichier .env"
echo "   2. Lancez le serveur: npm run dev"
echo "   3. Testez l'analyse: /api/ai/analyze-ultimate"
echo ""
echo "🌟 Fonctionnalités disponibles :"
echo "   • Analyse de funnels inspirée des captures d'écran"
echo "   • Support vidéo/audio/image complet"
echo "   • Optimisation automatique du flow"
echo "   • Fallbacks robustes en cas d'erreur"
echo "   • Interface premium avec urgence et preuve sociale"
echo ""
echo "🧠 Agent Morphius Ultimate v3.0 - Prêt !"
echo "Nümtema AGENCY - Framework Exclusif"
