import { Request, Response } from "express";
import User, { IUser } from "../models/users";

// Route POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Log des données reçues lors du login
  console.log("=== LOGIN ATTEMPT ===");
  console.log("Email reçu:", email);
  console.log("Password fourni:", password ? "***masqué***" : "non fourni");
  console.log("Body complet:", {
    ...req.body,
    password: password ? "***masqué***" : undefined,
  });

  if (!email || !password) {
    console.log("❌ Login échoué: Email ou mot de passe manquant");
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    // On récupère l'utilisateur avec le mot de passe (select +)
    const user = await User.findOne({ email }).select("+password");

    console.log("Recherche utilisateur pour email:", email);
    console.log("Utilisateur trouvé:", user ? "✅ Oui" : "❌ Non");

    if (!user) {
      console.log("❌ Login échoué: Utilisateur non trouvé");
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Log des données utilisateur récupérées
    console.log("=== DONNÉES UTILISATEUR RÉCUPÉRÉES ===");
    console.log("ID:", user._id);
    console.log("Nom:", user.firstName, user.lastName);
    console.log("Email:", user.email);
    console.log("Rôle:", user.role);
    console.log("Actif:", user.active);
    console.log("Heure de début:", user.startTime);

    const isMatch = await user.matchPassword(password);
    console.log(
      "Vérification mot de passe:",
      isMatch ? "✅ Correct" : "❌ Incorrect"
    );

    if (!isMatch) {
      console.log("❌ Login échoué: Mot de passe incorrect");
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Générer le JWT
    const token = user.getSignedJwtToken();
    console.log("Token JWT généré:", token ? "✅ Succès" : "❌ Échec");

    // Préparer la réponse avec user info et éventuellement dernière position
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      active: user.active,
      startTime: user.startTime,
    };

    console.log("=== DONNÉES ENVOYÉES AU CLIENT ===");
    console.log("UserData:", userData);
    console.log("✅ Login réussi pour:", user.email);

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: userData,
    });
  } catch (err: unknown) {
    console.error("❌ Erreur lors du login:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
