import { Skill, Service } from "../models/maintenance.model.js";
import User from "../models/user.model.js";

const initialSkills = [
  "Strong Communication skills",
  "First Aid and CPR/BLS Certification",
  "Swimming and Lifesaving Skills",
  "Fire Safety Knowledge",
  "Disaster Preparedness Training",
  "Public Speaking and Teaching Skills",
  "Physical Fitness",
  "Leadership and Organizing",
  "First Aid and Disaster Preparedness",
  "Communication and Advocacy",
  "Creativity and Event Planning",
];

const initialServices = [
  "Welfare Services",
  "Safety Services",
  "Health Services",
  "Youth Services",
  "Blood Services",
  "Wash Services",
];

export const seedSkillsAndServices = async () => {
  try {
    console.log("Starting skills and services seeding...");

    // Find an admin user to use as creator
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("No admin user found. Please create an admin user first.");
      return;
    }

    // Seed Skills
    const existingSkills = await Skill.find();
    if (existingSkills.length === 0) {
      console.log("Seeding skills...");
      const skillsToCreate = initialSkills.map(skillName => ({
        name: skillName,
        createdBy: adminUser._id,
        isActive: true
      }));

      await Skill.insertMany(skillsToCreate);
      console.log(`Created ${initialSkills.length} skills`);
    } else {
      console.log(`${existingSkills.length} skills already exist`);
    }

    // Seed Services
    const existingServices = await Service.find();
    if (existingServices.length === 0) {
      console.log("Seeding services...");
      const servicesToCreate = initialServices.map(serviceName => ({
        name: serviceName,
        createdBy: adminUser._id,
        isActive: true
      }));

      await Service.insertMany(servicesToCreate);
      console.log(`Created ${initialServices.length} services`);
    } else {
      console.log(`${existingServices.length} services already exist`);
    }

    console.log("Skills and services seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding skills and services:", error);
  }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import("../connections/db.js").then(({ connectDB }) => {
    connectDB().then(() => {
      seedSkillsAndServices().then(() => {
        process.exit(0);
      });
    });
  });
}
