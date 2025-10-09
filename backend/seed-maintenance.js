#!/usr/bin/env node

import { seedSkillsAndServices } from "./src/seeder/maintenance.seeder.js";
import { connectDB } from "./src/connections/db.js";

async function runSeeder() {
    try {
        console.log("Connecting to database...");
        await connectDB();

        console.log("Running skills and services seeder...");
        await seedSkillsAndServices();

        console.log("Seeder completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeder failed:", error);
        process.exit(1);
    }
}

runSeeder();
