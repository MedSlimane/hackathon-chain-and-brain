class CarbonCalculator:
    """
    Moteur de règles pour l'estimation de l'impact carbone.
    Basé sur les facteurs d'émission par défaut de l'IPCC (EFDB) pour les résidus agricoles.
    """
    
    # Facteurs d'émission (grammes par kg de matière sèche)
    # Source : IPCC EFDB (3.C.1.b)
    EMISSION_FACTORS = {
        'CO2': 1515,
        'CH4': 2.7,
        'N2O': 0.07,
        'NOx': 2.5
    }

    # Potentiel de Réchauffement Global (GWP) sur 100 ans pour équivalent CO2
    GWP = {
        'CO2': 1,
        'CH4': 28,  # IPCC AR5
        'N2O': 265  # IPCC AR5
    }

    @classmethod
    def calculate_emissions_from_burning(cls, dry_mass_kg):
        """
        Calcule les émissions si la biomasse est brûlée à l'air libre.
        Retourne l'équivalent CO2 total en kg.
        """
        co2_emitted = (dry_mass_kg * cls.EMISSION_FACTORS['CO2']) / 1000.0
        ch4_emitted = (dry_mass_kg * cls.EMISSION_FACTORS['CH4']) / 1000.0
        n2o_emitted = (dry_mass_kg * cls.EMISSION_FACTORS['N2O']) / 1000.0

        # Calcul de l'équivalent CO2 total
        co2_eq = (co2_emitted * cls.GWP['CO2'] + 
                  ch4_emitted * cls.GWP['CH4'] + 
                  n2o_emitted * cls.GWP['N2O'])
        
        return {
            'co2_kg': co2_emitted,
            'ch4_kg': ch4_emitted,
            'n2o_kg': n2o_emitted,
            'total_co2_eq_kg': co2_eq
        }

    @classmethod
    def calculate_avoided_emissions(cls, dry_mass_kg, valorization_type='sold'):
        """
        Estime les émissions évitées si la biomasse est valorisée (vendue, compostée)
        au lieu d'être brûlée.
        """
        # Pour le MVP, on considère que toute valorisation évite 100% du brûlage
        emissions_if_burned = cls.calculate_emissions_from_burning(dry_mass_kg)
        
        # On pourrait ajouter ici les émissions générées par le transport (valorisation)
        # pour obtenir un bilan net, mais pour le prototype, le brut suffit.
        return emissions_if_burned['total_co2_eq_kg']

if __name__ == "__main__":
    # Test
    mass_kg = 1000  # 1 tonne de résidu sec
    avoided_co2 = CarbonCalculator.calculate_avoided_emissions(mass_kg)
    print(f"Pour 1 tonne de résidu sec valorisé, vous évitez : {avoided_co2:.2f} kg d'équivalent CO2.")
