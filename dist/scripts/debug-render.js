"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
console.log('🔍 Debug Render - Vérification de la configuration\n');
// Vérifier que TypeScript est installé
console.log('📦 Vérification de TypeScript...');
try {
    const tscVersion = (0, child_process_1.execSync)('npx tsc --version', { encoding: 'utf8' });
    console.log(`✅ TypeScript installé: ${tscVersion.trim()}`);
}
catch (error) {
    console.log('❌ TypeScript non trouvé');
    console.log('💡 Solution: npm install typescript --save-dev');
}
// Vérifier tsconfig.json
console.log('\n📋 Vérification de tsconfig.json...');
if (fs_1.default.existsSync('tsconfig.json')) {
    try {
        const tsconfig = JSON.parse(fs_1.default.readFileSync('tsconfig.json', 'utf8'));
        console.log('✅ tsconfig.json valide');
        console.log(`   - Target: ${tsconfig.compilerOptions?.target || 'non défini'}`);
        console.log(`   - Module: ${tsconfig.compilerOptions?.module || 'non défini'}`);
        console.log(`   - OutDir: ${tsconfig.compilerOptions?.outDir || 'non défini'}`);
    }
    catch (error) {
        console.log('❌ tsconfig.json invalide');
    }
}
else {
    console.log('❌ tsconfig.json manquant');
}
// Test de compilation
console.log('\n🔨 Test de compilation...');
try {
    (0, child_process_1.execSync)('npm run build', { stdio: 'inherit' });
    console.log('✅ Compilation réussie');
}
catch (error) {
    console.log('❌ Erreur de compilation');
    console.log('💡 Vérifiez les erreurs TypeScript ci-dessus');
}
// Vérifier les fichiers de sortie
console.log('\n📁 Vérification des fichiers compilés...');
const expectedFiles = ['dist/server.js', 'dist/index.js'];
expectedFiles.forEach(file => {
    if (fs_1.default.existsSync(file)) {
        console.log(`✅ ${file} généré`);
    }
    else {
        console.log(`❌ ${file} manquant`);
    }
});
// Recommandations pour Render
console.log('\n' + '='.repeat(50));
console.log('🎯 Recommandations pour Render:');
console.log('\n1. 🚫 ÉVITEZ Docker si possible');
console.log('   Build Command: npm install && npm run build');
console.log('   Start Command: npm run start:render');
console.log('\n2. 🐳 Si vous utilisez Docker:');
console.log('   - Utilisez le Dockerfile corrigé');
console.log('   - Ou renommez Dockerfile.alternative');
console.log('\n3. 🔧 Variables d\'environnement requises:');
console.log('   - MONGODB_URI');
console.log('   - JWT_SECRET');
console.log('   - FRONTEND_URL');
console.log('   - NODE_ENV=production');
console.log('\n💡 En cas de problème, utilisez Railway (plus simple) !');
