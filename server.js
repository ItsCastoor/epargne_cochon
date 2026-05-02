const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(express.static('dist', {
  index: false, // Désactiver l'index par défaut
  fallthrough: true, // Continuer vers la prochaine handler si fichier non trouvé
}));

// Route pour tous les fichiers (SPA fallback)
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.path);

  // Vérifier si c'est un fichier existant
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  // Sinon, servir index.html (pour les routes React)
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Épargne Cochon] 🐷 Serveur lancé sur port ${PORT}`);
  console.log(`[Épargne Cochon] Accédez à: http://localhost:${PORT}`);
});

