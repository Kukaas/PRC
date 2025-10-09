import { Skill, Service } from "../models/maintenance.model.js";

// Skills Management
export const createSkill = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: name.trim() });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists",
      });
    }

    const skill = await Skill.create({
      name: name.trim(),
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Create skill error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllSkills = async (req, res) => {
  try {
    const { active } = req.query;

    let skills;
    if (active === "true") {
      skills = await Skill.getActiveSkills();
    } else {
      skills = await Skill.getAllSkills();
    }

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name.trim() !== skill.name) {
      const existingSkill = await Skill.findOne({ name: name.trim() });
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: "Skill name already exists",
        });
      }
    }

    const updateData = { updatedBy: req.user.userId };
    if (name !== undefined) updateData.name = name.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSkill = await Skill.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: updatedSkill,
    });
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    await Skill.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Services Management
export const createService = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service name is required",
      });
    }

    // Check if service already exists
    const existingService = await Service.findOne({ name: name.trim() });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists",
      });
    }

    const service = await Service.create({
      name: name.trim(),
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const { active } = req.query;

    let services;
    if (active === "true") {
      services = await Service.getActiveServices();
    } else {
      services = await Service.getAllServices();
    }

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name.trim() !== service.name) {
      const existingService = await Service.findOne({ name: name.trim() });
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: "Service name already exists",
        });
      }
    }

    const updateData = { updatedBy: req.user.userId };
    if (name !== undefined) updateData.name = name.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getActiveSkills = async (req, res) => {
  try {
    const skills = await Skill.getActiveSkills();
    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error("Get active skills error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getActiveServices = async (req, res) => {
  try {
    const services = await Service.getActiveServices();
    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Get active services error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
