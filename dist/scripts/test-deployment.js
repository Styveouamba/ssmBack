"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
console.log('🧪 Test de préparation pour déploiement\n');
// Test de compilation TypeScript
console.log('📦 Test de compilation TypeScript...');
try {
    (0, child_process_1.execSync)('npm run build', { stdio: 'inherit' });
    console.log('✅ Compilation TypeScript réussie\n');
}
catch (error) {
    console.log('❌ Erreur de compilation TypeScript');
    process.exit(1);
}
// Vérifier que les fichiers de build existent
const buildFiles = [
    'dist/server.js',
    'dist/index.js',
    'dist/config/db.js'
];
console.log('🔍 Vérification des fichiers compilés...');
let allBuildFilesExist = true;
buildFiles.forEach(file => {
    if (fs_1.default.existsSync(file)) {
        console.log(`✅ ${file} généré`);
    }
    else {
        console.log(`❌ ${file} manquant`);
        allBuildFilesExist = false;
    }
});
if (!allBuildFilesExist) {
    console.log('\n❌ Certains fichiers de build sont manquants');
    process.exit(1);
}
// Vérifier les fichiers de configuration des plateformes
console.log('\n🔧 Vérification des configurations de déploiement...');
const platformConfigs = [
    { file: 'railway.json', platform: 'Railway' },
    { file: 'render.yaml', platform: 'Render' },
    { file: 'Dockerfile', platform: 'Render (Docker)' },
    { file: 'vercel.json', platform: 'Vercel' }
];
platformConfigs.forEach(({ file, platform }) => {
    if (fs_1.default.existsSync(file)) {
        console.log(`✅ ${platform}: ${file} configuré`);
    }
    else {
        console.log(`⚠️ ${platform}: ${file} manquant`);
    }
});
// Vérifier les scripts npm
console.log('\n📜 Vérification des scripts npm...');
const packageJson = JSON.parse(fs_1.default.readFileSync('package.json', 'utf8'));
const requiredScripts = [
    'start:railway',
    'start:render',
    'build'
];
requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
        console.log(`✅ Script "${script}" configuré`);
    }
    else {
        console.log(`❌ Script "${script}" manquant`);
    }
});
console.log('\n' + '='.repeat(60));
console.log('🎉 Tests de déploiement terminés !');
console.log('\n📋 Plateformes prêtes pour le déploiement :');
console.log('• Railway : npm run start:railway');
console.log('• Render : npm run start:render + Dockerfile');
console.log('• Vercel : export default app (API REST seulement)');
console.log('\n💡 Consultez les guides de déploiement :');
console.log('• RAILWAY_DEPLOYMENT.md');
console.log('• RENDER_DEPLOYMENT.md');
console.log('• PLATFORM_COMPARISON.md');
