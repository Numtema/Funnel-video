"""
Agent Morphius - Auto-Installer avec Gestion d'Erreurs Avancée
Nümtema AGENCY - Framework Exclusif
"""

import subprocess
import sys
import os
import json
import time
import logging
from typing import Dict, List, Optional
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/installer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DependencyInstaller:
    """Installateur automatique de dépendances avec retry et fallback"""
    
    def __init__(self):
        self.required_packages = {
            "google-generativeai": "0.8.3",
            "python-dotenv": "1.0.0",
            "asyncio": None,  # Built-in
            "aiofiles": "23.2.1",
            "requests": "2.31.0",
            "openai": "1.3.0",  # Fallback pour l'IA
            "anthropic": "0.7.0",  # Autre fallback
        }
        self.installation_log = []
        self.failed_packages = []
        
    def check_package(self, package_name: str) -> bool:
        """Vérifie si un package est installé"""
        try:
            __import__(package_name.replace('-', '_'))
            return True
        except ImportError:
            return False
    
    def install_package(self, package: str, version: Optional[str] = None, retry_count: int = 3) -> bool:
        """Installe un package avec retry automatique"""
        package_spec = f"{package}=={version}" if version else package
        
        for attempt in range(retry_count):
            try:
                logger.info(f"📦 Installation de {package_spec} (tentative {attempt + 1}/{retry_count})")
                
                result = subprocess.run(
                    [sys.executable, "-m", "pip", "install", package_spec, "--upgrade"],
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutes timeout
                )
                
                if result.returncode == 0:
                    logger.info(f"✅ {package} installé avec succès")
                    self.installation_log.append({
                        "package": package,
                        "version": version,
                        "status": "success",
                        "attempt": attempt + 1
                    })
                    return True
                else:
                    logger.warning(f"⚠️ Échec installation {package}: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                logger.error(f"⏰ Timeout lors de l'installation de {package}")
            except Exception as e:
                logger.error(f"❌ Erreur installation {package}: {e}")
                
            if attempt < retry_count - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                logger.info(f"⏳ Attente {wait_time}s avant nouvelle tentative...")
                time.sleep(wait_time)
        
        self.failed_packages.append(package)
        self.installation_log.append({
            "package": package,
            "version": version,
            "status": "failed",
            "attempts": retry_count
        })
        return False
    
    def install_all(self) -> Dict[str, bool]:
        """Installe tous les packages requis"""
        logger.info("🔧 Début de l'installation des dépendances Agent Morphius...")
        
        results = {}
        for package, version in self.required_packages.items():
            if package == "asyncio":  # Skip built-in modules
                results[package] = True
                continue
                
            if self.check_package(package):
                logger.info(f"✅ {package} déjà installé")
                results[package] = True
            else:
                results[package] = self.install_package(package, version)
        
        return results
    
    def generate_report(self) -> Dict:
        """Génère un rapport d'installation"""
        successful = len([log for log in self.installation_log if log["status"] == "success"])
        failed = len(self.failed_packages)
        total = len(self.required_packages)
        
        return {
            "timestamp": time.time(),
            "total_packages": total,
            "successful": successful,
            "failed": failed,
            "success_rate": (successful / total) * 100,
            "failed_packages": self.failed_packages,
            "installation_log": self.installation_log,
            "recommendations": self.get_recommendations()
        }
    
    def get_recommendations(self) -> List[str]:
        """Génère des recommandations basées sur les échecs"""
        recommendations = []
        
        if "google-generativeai" in self.failed_packages:
            recommendations.append("Configurez GEMINI_API_KEY ou utilisez le mode démo")
            recommendations.append("Vérifiez votre connexion internet")
        
        if len(self.failed_packages) > 0:
            recommendations.append("Exécutez 'pip install --upgrade pip' et réessayez")
            recommendations.append("Vérifiez les permissions d'écriture")
        
        return recommendations

def main():
    """Point d'entrée principal"""
    # Créer les dossiers nécessaires
    os.makedirs("logs", exist_ok=True)
    
    installer = DependencyInstaller()
    results = installer.install_all()
    report = installer.generate_report()
    
    # Sauvegarder le rapport
    with open("logs/installation_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # Afficher le résumé
    print("\n" + "="*60)
    print("📊 RAPPORT D'INSTALLATION - AGENT MORPHIUS")
    print("="*60)
    print(f"✅ Packages installés: {report['successful']}/{report['total_packages']}")
    print(f"📈 Taux de succès: {report['success_rate']:.1f}%")
    
    if report['failed_packages']:
        print(f"❌ Échecs: {', '.join(report['failed_packages'])}")
        print("\n🔧 Recommandations:")
        for rec in report['recommendations']:
            print(f"  • {rec}")
    
    print("\n🧠 Agent Morphius prêt à démarrer !")
    print("🌐 Nümtema AGENCY - https://www.numtemaagency.com")
    print("📞 Contact: 07 45 43 42 40")
    
    return report['success_rate'] > 80  # Succès si > 80%

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
