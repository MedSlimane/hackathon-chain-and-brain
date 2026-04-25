import os
from datasets import load_dataset

def setup_directories():
    os.makedirs('data/vision/raw', exist_ok=True)
    os.makedirs('data/vision/processed', exist_ok=True)
    print("Dossiers créés : data/vision/")

def download_huggingface_data():
    print("Téléchargement du dataset Hugging Face : Shreeyut/biomass_vlm_dataset...")
    try:
        biomass = load_dataset("Shreeyut/biomass_vlm_dataset")
        biomass.save_to_disk("data/vision/raw/biomass_vlm")
        print("Téléchargement terminé avec succès.")
    except Exception as e:
        print(f"Erreur lors du téléchargement Hugging Face : {e}")

def download_kaggle_data():
    print("Téléchargement du dataset Kaggle : GrassClover...")
    print("Assurez-vous que votre fichier kaggle.json est bien configuré (~/.kaggle/kaggle.json).")
    try:
        # Import kaggle here to avoid crashing if kaggle.json is not present when just importing
        import kaggle
        kaggle.api.authenticate()
        kaggle.api.dataset_download_files(
            'usharengaraju/grassclover-dataset', 
            path='data/vision/raw/grassclover', 
            unzip=True
        )
        print("Téléchargement Kaggle terminé avec succès.")
    except Exception as e:
        print(f"Erreur lors du téléchargement Kaggle : {e}")

if __name__ == "__main__":
    print("=== Préparation des données Vision ===")
    setup_directories()
    download_huggingface_data()
    download_kaggle_data()
    print("Terminé. Vous pouvez maintenant lancer train_vision.py")
