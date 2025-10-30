"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
console.log('🔍 Vérification de la configuration Vercel...\n');
// Vérifier les fichiers requis
const requiredFiles = [
    'vercel.json',
    'index.ts',
    'package.json',
    '.env.example'
];
let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs_1.default.existsSync(file)) {
        console.log(`✅ ${file} existe`);
    }
    else {
        console.log(`❌ ${file} manquant`);
        allFilesExist = false;
    }
});
// Vérifier le contenu de vercel.json
try {
    const vercelConfig = JSON.parse(fs_1.default.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.builds && vercelConfig.builds[0].src === 'index.ts') {
        console.log('✅ Configuration vercel.json correcte');
    }
    else {
        console.log('❌ Configuration vercel.json incorrecte');
        allFilesExist = false;
    }
}
catch (error) {
    console.log('❌ Erreur lors de la lecture de vercel.json');
    allFilesExist = false;
}
// Vérifier l'export par défaut dans index.ts
try {
    const indexContent = fs_1.default.readFileSync('index.ts', 'utf8');
    if (indexContent.includes('export default app')) {
        console.log('✅ Export par défaut trouvé dans index.ts');
    }
    else {
        console.log('❌ Export par défaut manquant dans index.ts');
        allFilesExist = false;
    }
}
catch (error) {
    console.log('❌ Erreur lors de la lecture de index.ts');
    allFilesExist = false;
}
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
    console.log('🎉 Configuration Vercel prête pour le déploiement !');
    console.log('\nÉtapes suivantes :');
    console.log('1. Configurez vos variables d\'environnement sur Vercel');
    console.log('2. Exécutez : vercel --prod');
    console.log('3. Testez votre API avec : /api/health');
}
else {
    console.log('❌ Configuration incomplète. Corrigez les erreurs ci-dessus.');
    process.exit(1);
}
