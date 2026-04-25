# AgriConnect Smart - Entrainement des modeles

Ce dossier entraine les trois modeles pratiques du MVP avec PyTorch sur GPU:

1. `biomass_type_classifier.pt` - classification visuelle du type dominant de biomasse.
2. `biomass_quality_regressor.pt` - estimation visuelle de qualite: biomasse seche totale et fraction de matiere seche.
3. `price_model.pt` - regression tabulaire du prix marche.

Le calcul carbone reste volontairement un moteur de regles dans `carbon_calculator.py`, conforme au rapport: pour le MVP, les facteurs IPCC sont plus defendables qu'un modele ML sans donnees locales.

## GPU Apple Silicon

Les scripts utilisent automatiquement:

- `mps` sur Mac Apple Silicon avec PyTorch MPS;
- `cuda` si lance sur une machine NVIDIA;
- erreur claire si aucun backend GPU PyTorch n'est disponible.

Installez les dependances:

```bash
cd modeles
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Donnees

Les donnees vision deja supportees sont GrassClover sous:

```text
modeles/data/vision/raw/grassclover/biomass_data/
```

Pour les donnees marche, `train_market.py` cherche d'abord des CSV sous:

```text
modeles/data/market/raw/
```

ou le dataset Hugging Face WFP sauvegarde dans:

```text
modeles/data/market/raw/wfp_malawi/
```

S'il ne trouve rien, il entraine un jeu synthetique de demonstration pour valider le pipeline.

## Commandes

Entrainer la vision:

```bash
python train_vision.py --epochs 8 --batch-size 32 --image-size 128
```

Entrainer le prix:

```bash
python train_market.py --epochs 80 --batch-size 128
```

Tout entrainer:

```bash
python train_all.py --vision-epochs 8 --market-epochs 80
```

Les artefacts sont sauvegardes dans:

```text
modeles/models/
```

Chaque modele a aussi un fichier JSON de metadata avec les normalisations, labels et metriques.

## API des modeles

Installer les dependances API:

```bash
cd /Users/slimane/hackathon-chain-and-brain
source modeles/venv/bin/activate
pip install -r modeles/requirements.txt
```

Lancer le serveur:

```bash
uvicorn modeles.api:app --reload --host 127.0.0.1 --port 8000
```

Endpoints:

```text
GET  /health
POST /predict/image   multipart form-data: file=<image>
POST /predict/price   JSON: market_id, latitude, longitude, commodity_id, year, month, day_of_year
POST /predict/carbon  JSON: dry_mass_kg
POST /predict/lot     multipart form-data: file + market fields + optional dry_mass_kg
```

Exemples:

```bash
curl http://127.0.0.1:8000/health
```

```bash
curl -X POST http://127.0.0.1:8000/predict/price \
  -H "Content-Type: application/json" \
  -d '{"market_id":1600,"latitude":-14.2,"longitude":34.4,"commodity_id":450,"year":2026,"month":4,"day_of_year":115}'
```

```bash
curl -X POST http://127.0.0.1:8000/predict/image \
  -F "file=@modeles/data/vision/raw/grassclover/biomass_data/train/images/biomass_image_train_0000.jpg"
```
