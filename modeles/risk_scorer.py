import requests

class RiskScorer:
    """
    Évalue le risque environnemental et sanitaire d'une région.
    Pour le MVP, interroge l'API OpenAQ pour obtenir la qualité de l'air récente.
    """
    
    BASE_URL = "https://api.openaq.org/v3/locations"

    @staticmethod
    def get_air_quality_score(country_id=788, limit=5):
        """
        Récupère les données de qualité de l'air pour un pays donné (ex: 788 pour la Tunisie/exemple).
        """
        # Note: OpenAQ API v3 nécessite souvent une clé API (API Key) pour de nombreuses requêtes.
        # Ce script est un stub démontrant la logique d'appel.
        params = {
            "countries_id": country_id,
            "limit": limit
        }
        
        try:
            print(f"Interrogation d'OpenAQ pour le pays {country_id}...")
            response = requests.get(RiskScorer.BASE_URL, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                # Logique simplifiée de calcul du risque (1 à 10)
                # Si on a des résultats, on fait une moyenne factice pour l'exemple
                if results:
                    return {
                        "risk_score_1_to_10": 4.5,
                        "description": "Qualité de l'air modérée selon OpenAQ",
                        "raw_data_locations_found": len(results)
                    }
                else:
                    return {"risk_score_1_to_10": 5, "description": "Données OpenAQ non disponibles, utilisation de la moyenne OMS"}
            else:
                print(f"Erreur OpenAQ: {response.status_code}")
                return {"risk_score_1_to_10": 5, "description": "Erreur API, risque moyen estimé."}
                
        except requests.exceptions.RequestException as e:
            print(f"Erreur de connexion OpenAQ: {e}")
            return {"risk_score_1_to_10": 5, "description": "Service indisponible."}

if __name__ == "__main__":
    # Test
    score = RiskScorer.get_air_quality_score()
    print(f"Score de risque calculé : {score}")
