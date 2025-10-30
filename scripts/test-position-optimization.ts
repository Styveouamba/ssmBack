// Script de test pour l'optimisation des positions
import { PositionOptimizer } from "../utils/positionOptimizer";

async function testPositionOptimization() {
  console.log("🧪 Test de l'optimisation des positions\n");

  const userId = "test-user-123";
  let savedCount = 0;
  let filteredCount = 0;

  // Test 1: Première position (doit être sauvegardée)
  console.log("Test 1: Première position");
  const shouldSave1 = PositionOptimizer.shouldSavePosition(userId, 48.8566, 2.3522, 0);
  console.log(`Résultat: ${shouldSave1 ? "✅ Sauvegardée" : "❌ Filtrée"}`);
  if (shouldSave1) {
    PositionOptimizer.updateCache(userId, 48.8566, 2.3522, 0, new Date());
    savedCount++;
  } else {
    filteredCount++;
  }

  // Test 2: Position identique 10 secondes plus tard (doit être filtrée)
  console.log("\nTest 2: Position identique 10s plus tard");
  const shouldSave2 = PositionOptimizer.shouldSavePosition(
    userId, 
    48.8566, 
    2.3522, 
    0, 
    new Date(Date.now() + 10000)
  );
  console.log(`Résultat: ${shouldSave2 ? "✅ Sauvegardée" : "❌ Filtrée"}`);
  if (shouldSave2) {
    savedCount++;
  } else {
    filteredCount++;
  }

  // Test 3: Mouvement de 5 mètres (doit être filtrée car < 10m)
  console.log("\nTest 3: Mouvement de ~5 mètres");
  const shouldSave3 = PositionOptimizer.shouldSavePosition(
    userId, 
    48.8567, // ~11m de différence
    2.3522, 
    5, 
    new Date(Date.now() + 15000)
  );
  console.log(`Résultat: ${shouldSave3 ? "✅ Sauvegardée" : "❌ Filtrée"}`);
  if (shouldSave3) {
    savedCount++;
  } else {
    filteredCount++;
  }

  // Test 4: Mouvement de 50 mètres (doit être sauvegardée)
  console.log("\nTest 4: Mouvement de ~50 mètres");
  const shouldSave4 = PositionOptimizer.shouldSavePosition(
    userId, 
    48.8571, // ~50m de différence
    2.3522, 
    15, 
    new Date(Date.now() + 20000)
  );
  console.log(`Résultat: ${shouldSave4 ? "✅ Sauvegardée" : "❌ Filtrée"}`);
  if (shouldSave4) {
    PositionOptimizer.updateCache(userId, 48.8571, 2.3522, 15, new Date(Date.now() + 20000));
    savedCount++;
  } else {
    filteredCount++;
  }

  // Test 5: Changement de vitesse significatif (doit être sauvegardée)
  console.log("\nTest 5: Changement de vitesse significatif");
  const shouldSave5 = PositionOptimizer.shouldSavePosition(
    userId, 
    48.8571, 
    2.3522, 
    30, // +15 km/h de différence
    new Date(Date.now() + 25000)
  );
  console.log(`Résultat: ${shouldSave5 ? "✅ Sauvegardée" : "❌ Filtrée"}`);
  if (shouldSave5) {
    savedCount++;
  } else {
    filteredCount++;
  }

  // Test 6: Temps minimum écoulé (35 secondes)
  console.log("\nTest 6: Temps minimum écoulé (35s)");
  const shouldSave6 = PositionOptimizer.shouldSavePosition(
    userId, 
    48.8571, 
    2.3522, 
    30, 
    new Date(Date.now() + 35000)
  );
  console.log(`Résultat: ${shouldSave6 ? "✅ Sauvegardée" : "❌ Filtrée"}`);
  if (shouldSave6) {
    savedCount++;
  } else {
    filteredCount++;
  }

  console.log("\n📊 Résultats du test:");
  console.log(`Positions sauvegardées: ${savedCount}`);
  console.log(`Positions filtrées: ${filteredCount}`);
  console.log(`Taux de réduction: ${Math.round((filteredCount / (savedCount + filteredCount)) * 100)}%`);

  // Simulation sur 1 heure avec position toutes les 10 secondes
  console.log("\n🕐 Simulation sur 1 heure (position toutes les 10s):");
  
  let simSaved = 0;
  let simFiltered = 0;
  const simUserId = "sim-user";
  let currentLat = 48.8566;
  let currentLng = 2.3522;
  let currentSpeed = 0;

  for (let i = 0; i < 360; i++) { // 360 positions en 1 heure
    // Simuler un mouvement aléatoire
    const deltaLat = (Math.random() - 0.5) * 0.0001; // ~5-10m de variation
    const deltaLng = (Math.random() - 0.5) * 0.0001;
    const deltaSpeed = (Math.random() - 0.5) * 5; // ±2.5 km/h
    
    currentLat += deltaLat;
    currentLng += deltaLng;
    currentSpeed = Math.max(0, currentSpeed + deltaSpeed);
    
    const timestamp = new Date(Date.now() + i * 10000); // +10s à chaque fois
    
    const shouldSave = PositionOptimizer.shouldSavePosition(
      simUserId, 
      currentLat, 
      currentLng, 
      currentSpeed, 
      timestamp
    );
    
    if (shouldSave) {
      PositionOptimizer.updateCache(simUserId, currentLat, currentLng, currentSpeed, timestamp);
      simSaved++;
    } else {
      simFiltered++;
    }
  }

  console.log(`Sans optimisation: 360 positions`);
  console.log(`Avec optimisation: ${simSaved} positions sauvegardées`);
  console.log(`Réduction: ${Math.round((simFiltered / 360) * 100)}%`);
  console.log(`Économie d'espace: ${360 - simSaved} positions évitées`);
}

// Exporter pour utilisation
export { testPositionOptimization };

// Exécuter si appelé directement
if (require.main === module) {
  testPositionOptimization().catch(console.error);
}