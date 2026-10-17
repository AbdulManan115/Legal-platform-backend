import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

const EMAIL = "admin@legalplatform.com";
const PASSWORD = "Admin@12345";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");

  const existing = await User.findOne({ email: EMAIL });

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  if (existing) {
    existing.name = "System Admin";
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    existing.status = "active";

    await existing.save();

    console.log("✅ Existing admin account updated");
  } else {
    await User.create({
      name: "System Admin",
      email: EMAIL,
      passwordHash,
      role: "admin",
      status: "active",
    });

    console.log("✅ Admin account created");
  }

  console.log("");
  console.log("========== ADMIN LOGIN ==========");
  console.log("Email:    admin@legalplatform.com");
  console.log("Password: Admin@12345");
  console.log("Role:     admin");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
