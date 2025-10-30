import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

// Définition de l'interface utilisateur
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "Technicien" | "Commercial";
  active: boolean;
  startTime: Date | null;
  createdAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  firstName: {
    type: String,
    required: [true, "Veuillez fournir un prénom"],
  },
  lastName: {
    type: String,
    required: [true, "Veuillez fournir un nom"],
  },
  email: {
    type: String,
    required: [true, "Veuillez fournir un email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Veuillez fournir un email valide",
    ],
  },
  password: {
    type: String,
    required: [true, "Veuillez fournir un mot de passe"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "Technicien", "Commercial"],
    default: "Technicien",
  },
  active: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Hash du password avant sauvegarde
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Comparer le mot de passe entré avec le hashé
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Générer un token JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
