// Script de nettoyage des positions
import mongoose from "mongoose";
import Position from "../models/Position";
import { config } from "../config/config";

interface CleanupOptions {
  olderThanDays?: number;
  dryRun?: boolean;
  batchSize?: number;
}

async function cleanupPositions(options: CleanupOptions = {}) {
  const {
    olderThanDays = 7,
    dryRun = false,
    batchSize = 1000
  } = options;

  try {
    // Connexion à la base de données
    await mongoose.connect(config.MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Calculer la date limite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    console.log(`🗓️  Suppression des positions antérieures au: ${cutoffDate.toISOString()}`);

    // Compter les positions à supprimer
    const countToDelete = await Position.countDocuments({
      createdAt: { $lt: cutoffDate }
    });

    console.log(`📊 Positions à supprimer: ${countToDelete}`);

    if (countToDelete === 0) {
      console.log("✨ Aucune position à supprimer");
      return;
    }

    if (dryRun) {
      console.log("🔍 Mode dry-run activé - aucune suppression effectuée");
      
      // Afficher quelques statistiques
      const stats = await Position.aggregate([
        {
          $match: { createdAt: { $lt: cutoffDate } }
        },
        {
          $group: {
            _id: "$technician",
            count: { $sum: 1 },
            oldestPosition: { $min: "$createdAt" },
            newestPosition: { $max: "$createdAt" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            technicianName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
            count: 1,
            oldestPosition: 1,
            newestPosition: 1
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      console.log("\n📈 Statistiques par technicien:");
      stats.forEach(stat => {
        console.log(`  ${stat.technicianName}: ${stat.count} positions`);
      });

      return;
    }

    // Suppression par batch pour éviter les timeouts
    let deletedTotal = 0;
    let batch = 0;

    while (deletedTotal < countToDelete) {
      batch++;
      console.log(`🔄 Traitement du batch ${batch}...`);

      const result = await Position.deleteMany(
        { createdAt: { $lt: cutoffDate } },
        { limit: batchSize }
      );

      deletedTotal += result.deletedCount;
      console.log(`   Supprimées: ${result.deletedCount} (Total: ${deletedTotal}/${countToDelete})`);

      if (result.deletedCount === 0) {
        break; // Plus rien à supprimer
      }

      // Petite pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Nettoyage terminé: ${deletedTotal} positions supprimées`);

    // Statistiques finales
    const remainingCount = await Position.countDocuments();
    console.log(`📊 Positions restantes: ${remainingCount}`);

  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Déconnecté de MongoDB");
  }
}

// Fonction pour obtenir des statistiques sur les positions
async function getPositionStats() {
  try {
    await mongoose.connect(config.MONGO_URI);
    
    const stats = await Position.aggregate([
      {
        $group: {
          _id: null,
          totalPositions: { $sum: 1 },
          oldestPosition: { $min: "$createdAt" },
          newestPosition: { $max: "$createdAt" },
          avgSpeed: { $avg: "$speed" }
        }
      }
    ]);

    const technicianStats = await Position.aggregate([
      {
        $group: {
          _id: "$technician",
          count: { $sum: 1 },
          avgSpeed: { $avg: "$speed" },
          lastPosition: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          technicianName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          count: 1,
          avgSpeed: { $round: ["$avgSpeed", 2] },
          lastPosition: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log("📊 Statistiques globales:");
    if (stats[0]) {
      console.log(`  Total positions: ${stats[0].totalPositions}`);
      console.log(`  Plus ancienne: ${stats[0].oldestPosition}`);
      console.log(`  Plus récente: ${stats[0].newestPosition}`);
      console.log(`  Vitesse moyenne: ${stats[0].avgSpeed?.toFixed(2)} km/h`);
    }

    console.log("\n👥 Statistiques par technicien:");
    technicianStats.forEach(stat => {
      console.log(`  ${stat.technicianName}: ${stat.count} positions, vitesse moy: ${stat.avgSpeed} km/h`);
    });

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Export des fonctions
export { cleanupPositions, getPositionStats };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'cleanup':
      const days = parseInt(args[1]) || 7;
      const dryRun = args.includes('--dry-run');
      cleanupPositions({ olderThanDays: days, dryRun }).catch(console.error);
      break;
    
    case 'stats':
      getPositionStats().catch(console.error);
      break;
    
    default:
      console.log(`
Usage:
  npm run cleanup-positions cleanup [days] [--dry-run]
  npm run cleanup-positions stats

Examples:
  npm run cleanup-positions cleanup 7 --dry-run    # Voir ce qui serait supprimé (7 jours)
  npm run cleanup-positions cleanup 30             # Supprimer positions > 30 jours
  npm run cleanup-positions stats                  # Afficher statistiques
      `);
  }
}