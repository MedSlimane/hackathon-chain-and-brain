import os
from datasets import load_dataset
import requests
import zipfile
import io

def setup_directories():
    os.makedirs('data/market/raw', exist_ok=True)
    os.makedirs('data/market/processed', exist_ok=True)
    print("Dossiers créés : data/market/")

def download_wfp_hf_data():
    print("Téléchargement du dataset WFP depuis Hugging Face...")
    try:
        wfp_malawi = load_dataset("electricsheepafrica/africa-wfp-food-prices-for-malawi")
        wfp_malawi.save_to_disk("data/market/raw/wfp_malawi")
        print("Téléchargement WFP terminé.")
    except Exception as e:
        print(f"Erreur téléchargement WFP : {e}")

def download_faostat_data():
    """
    Télécharge un extrait d'exemple depuis le service Bulk de la FAO.
    Note: L'URL exacte du bulk download peut varier, ceci est un exemple.
    """
    print("Téléchargement de l'exemple FAOSTAT Producer Prices...")
    # Pour un script robuste, il est souvent préférable de demander à l'utilisateur
    # de télécharger le CSV manuellement via l'interface FAO ou d'utiliser un lien direct stable.
    print("Veuillez noter que pour FAOSTAT, il est souvent plus stable de télécharger le .csv")
    print("manuellement depuis https://www.fao.org/faostat/en/#data/PP et de le placer dans data/market/raw/")

if __name__ == "__main__":
    print("=== Préparation des données Marché ===")
    setup_directories()
    download_wfp_hf_data()
    download_faostat_data()
    print("Terminé. Vous pouvez maintenant lancer train_market.py")
