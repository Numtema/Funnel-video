import subprocess
import sys
import os

def install_package(package):
    """Installe un package Python"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installé avec succès")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur installation {package}: {e}")
        return False

def main():
    """Installation des dépendances Agent Morphius"""
    print("🔧 Installation des dépendances Agent Morphius...")
    
    # Liste des packages requis
    packages = [
        "google-generativeai==0.8.3",
        "python-dotenv==1.0.0",
        "asyncio",
        "aiofiles",
        "requests"
    ]
    
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print(f"\n📊 Résultat: {success_count}/{len(packages)} packages installés")
    
    if success_count == len(packages):
        print("🎉 Toutes les dépendances sont installées !")
        return True
    else:
        print("⚠️ Certaines dépendances ont échoué")
        return False

if __name__ == "__main__":
    main()
