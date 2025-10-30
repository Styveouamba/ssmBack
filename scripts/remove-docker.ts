import fs from 'fs';

console.log('🧹 Suppression des fichiers Docker pour éviter les conflits\n');

const dockerFiles = [
  'Dockerfile',
  'Dockerfile.alternative',
  '.dockerignore'
];

dockerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ ${file} supprimé`);
    } catch (error) {
      console.log(`❌ Erreur lors de la suppression de ${file}`);
    }
  } else {
    console.log(`ℹ️ ${file} n'existe pas`);
  }
});

console.log('\n🎯 Fichiers Docker supprimés !');
console.log('Render utilisera maintenant la méthode native Node.js');
console.log('\n📋 Configuration Render recommandée :');
console.log('Runtime: Node');
console.log('Build Command: npm install && npm run build');
console.log('Start Command: npm run start:render');
console.log('\n💡 Cette méthode évite tous les problèmes de permissions Docker !');