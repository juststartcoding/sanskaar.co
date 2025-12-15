// routes/familyTree.js - NEW FILE
const express = require("express");
const crypto = require("crypto");
const Family = require("../models/Family");
const FamilyMember = require("../models/FamilyMember");
const Relationship = require("../models/Relationship");
const FamilyInvitation = require("../models/FamilyInvitation");
const FamilyEvent = require("../models/FamilyEvent");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ============================================
// MIDDLEWARE - Auth Check (Compatible with your existing auth)
// ============================================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Your auth uses 'id' field
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Middleware to check if user is family member
const checkFamilyMember = async (req, res, next) => {
  try {
    const familyId = req.params.familyId || req.params.id;
    const family = await Family.findById(familyId);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    const isMember = family.members.some(
      (m) => m.userId && m.userId.toString() === req.userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not a family member.",
      });
    }

    req.family = family;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

// Middleware to check if user is family admin
const checkFamilyAdmin = async (req, res, next) => {
  try {
    const familyId = req.params.familyId || req.params.id;
    const family = await Family.findById(familyId);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    const member = family.members.find(
      (m) => m.userId && m.userId.toString() === req.userId.toString()
    );

    if (!member || member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    req.family = family;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

// Helper function
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// ============================================
// FAMILY ROUTES
// ============================================

// Create new family
router.post("/families", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Family name is required",
      });
    }

    const inviteCode = generateInviteCode();

    const family = new Family({
      name,
      description,
      ownerUserId: req.userId,
      inviteCode,
      members: [
        {
          userId: req.userId,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    await family.save();

    res.status(201).json({
      success: true,
      message: "Family created successfully",
      family: {
        id: family._id,
        name: family.name,
        inviteCode: family.inviteCode,
        role: "admin",
        memberCount: 1,
      },
    });
  } catch (error) {
    console.error("Create family error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create family",
    });
  }
});

// Get user's families
router.get("/families", authMiddleware, async (req, res) => {
  try {
    const families = await Family.find({
      "members.userId": req.userId,
    }).select("name description inviteCode members createdAt");

    const result = families.map((f) => {
      const member = f.members.find(
        (m) => m.userId.toString() === req.userId.toString()
      );
      return {
        id: f._id,
        name: f.name,
        description: f.description,
        inviteCode: f.inviteCode,
        role: member.role,
        memberCount: f.members.length,
        createdAt: f.createdAt,
      };
    });

    res.json({
      success: true,
      families: result,
    });
  } catch (error) {
    console.error("Get families error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch families",
    });
  }
});

// Get single family details
router.get(
  "/families/:id",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const family = req.family;
      const member = family.members.find(
        (m) => m.userId.toString() === req.userId.toString()
      );

      // Get member count
      const memberCount = await FamilyMember.countDocuments({
        familyId: family._id,
      });

      res.json({
        success: true,
        family: {
          id: family._id,
          name: family.name,
          description: family.description,
          inviteCode: family.inviteCode,
          role: member.role,
          memberCount: memberCount,
          settings: family.settings,
          createdAt: family.createdAt,
        },
      });
    } catch (error) {
      console.error("Get family error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch family",
      });
    }
  }
);

// Get family tree (MAIN ENDPOINT)
router.get(
  "/families/:id/tree",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const familyId = req.params.id;

      // Fetch all members and relationships
      const members = await FamilyMember.find({ familyId })
        .populate("userId", "name email profilePic")
        .lean();

      const relationships = await Relationship.find({ familyId }).lean();

      // Build adjacency maps
      const childrenMap = {};
      const parentMap = {};
      const spouseMap = {};

      members.forEach((m) => {
        childrenMap[m._id] = [];
        spouseMap[m._id] = [];
      });

      relationships.forEach((rel) => {
        if (rel.relationType === "parent") {
          if (!childrenMap[rel.fromMemberId])
            childrenMap[rel.fromMemberId] = [];
          childrenMap[rel.fromMemberId].push(rel.toMemberId.toString());
          parentMap[rel.toMemberId] = rel.fromMemberId.toString();
        } else if (rel.relationType === "child") {
          if (!childrenMap[rel.toMemberId]) childrenMap[rel.toMemberId] = [];
          childrenMap[rel.toMemberId].push(rel.fromMemberId.toString());
          parentMap[rel.fromMemberId] = rel.toMemberId.toString();
        } else if (rel.relationType === "spouse") {
          if (!spouseMap[rel.fromMemberId]) spouseMap[rel.fromMemberId] = [];
          if (!spouseMap[rel.toMemberId]) spouseMap[rel.toMemberId] = [];
          spouseMap[rel.fromMemberId].push(rel.toMemberId.toString());
          spouseMap[rel.toMemberId].push(rel.fromMemberId.toString());
        }
      });

      // Find root nodes (no parents)
      const roots = members.filter((m) => !parentMap[m._id]);

      // Build tree recursively
      const buildTree = (memberId) => {
        const member = members.find(
          (m) => m._id.toString() === memberId.toString()
        );
        if (!member) return null;

        const node = {
          id: member._id,
          displayName: member.displayName,
          birthdate: member.birthdate,
          deathdate: member.deathdate,
          birthPlace: member.birthPlace,
          gender: member.gender,
          photoUrl: member.photoUrl,
          occupation: member.occupation,
          isAlive: member.isAlive,
          relation: member.relation,
          userId: member.userId?._id,
          userProfile: member.userId
            ? {
                name: member.userId.name,
                email: member.userId.email,
                profilePic: member.userId.profilePic,
              }
            : null,
          children: [],
          spouses: [],
        };

        // Add spouses
        const spouseIds = spouseMap[memberId] || [];
        node.spouses = spouseIds
          .map((spouseId) => {
            const spouse = members.find((m) => m._id.toString() === spouseId);
            return spouse
              ? {
                  id: spouse._id,
                  displayName: spouse.displayName,
                  photoUrl: spouse.photoUrl,
                  gender: spouse.gender,
                }
              : null;
          })
          .filter(Boolean);

        // Add children recursively
        const children = childrenMap[memberId] || [];
        node.children = children
          .map((childId) => buildTree(childId))
          .filter(Boolean);

        return node;
      };

      const tree = roots.map((r) => buildTree(r._id));

      res.json({
        success: true,
        familyId,
        tree,
        stats: {
          totalMembers: members.length,
          totalRelationships: relationships.length,
          generations: calculateGenerations(tree),
        },
      });
    } catch (error) {
      console.error("Tree fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch family tree",
      });
    }
  }
);

// Helper function to calculate generations
function calculateGenerations(tree, depth = 0) {
  if (!tree || tree.length === 0) return depth;
  return Math.max(
    ...tree.map((node) => {
      if (node.children && node.children.length > 0) {
        return calculateGenerations(node.children, depth + 1);
      }
      return depth + 1;
    })
  );
}

// Create invitation
router.post(
  "/families/:id/invite",
  authMiddleware,
  checkFamilyAdmin,
  async (req, res) => {
    try {
      const { email, phone, message } = req.body;
      const familyId = req.params.id;

      const token = crypto.randomBytes(16).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = new FamilyInvitation({
        familyId,
        token,
        email: email || null,
        phone: phone || null,
        message,
        expiresAt,
        createdBy: req.userId,
      });

      await invitation.save();

      res.status(201).json({
        success: true,
        message: "Invitation created successfully",
        invitation: {
          token,
          inviteLink: `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/family/join/${token}`,
          expiresAt,
        },
      });
    } catch (error) {
      console.error("Create invitation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create invitation",
      });
    }
  }
);

// Join family
router.post("/families/join", authMiddleware, async (req, res) => {
  try {
    const { token, inviteCode } = req.body;

    let family;

    if (token) {
      const invitation = await FamilyInvitation.findOne({
        token,
        status: "pending",
        expiresAt: { $gt: new Date() },
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired invitation",
        });
      }

      family = await Family.findById(invitation.familyId);

      invitation.status = "accepted";
      invitation.acceptedBy = req.userId;
      invitation.acceptedAt = new Date();
      await invitation.save();
    } else if (inviteCode) {
      family = await Family.findOne({ inviteCode: inviteCode.toUpperCase() });
      if (!family) {
        return res.status(404).json({
          success: false,
          message: "Invalid invite code",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Token or invite code required",
      });
    }

    // Check if already member
    const isMember = family.members.some(
      (m) => m.userId && m.userId.toString() === req.userId.toString()
    );

    if (isMember) {
      return res.status(409).json({
        success: false,
        message: "Already a member of this family",
      });
    }

    family.members.push({
      userId: req.userId,
      role: "member",
      joinedAt: new Date(),
    });

    await family.save();

    res.json({
      success: true,
      message: "Successfully joined family",
      family: {
        id: family._id,
        name: family.name,
        role: "member",
      },
    });
  } catch (error) {
    console.error("Join family error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join family",
    });
  }
});

// ============================================
// MEMBER ROUTES
// ============================================

// Add family member
router.post(
  "/families/:familyId/members",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const {
        displayName,
        birthdate,
        deathdate,
        birthPlace,
        gender,
        photoUrl,
        occupation,
        education,
        notes,
        relation,
        userId,
        isAlive,
      } = req.body;

      if (!displayName) {
        return res.status(400).json({
          success: false,
          message: "Display name is required",
        });
      }

      const member = new FamilyMember({
        familyId: req.params.familyId,
        userId: userId || null,
        displayName,
        relation,
        birthdate: birthdate || null,
        deathdate: deathdate || null,
        birthPlace,
        gender: gender || "unspecified",
        photoUrl: photoUrl || null,
        occupation,
        education,
        notes: notes || null,
        isAlive: isAlive !== undefined ? isAlive : true,
        createdBy: req.userId,
      });

      await member.save();

      res.status(201).json({
        success: true,
        message: "Member added successfully",
        member,
      });
    } catch (error) {
      console.error("Add member error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add member",
      });
    }
  }
);

// Get all members in family
router.get(
  "/families/:familyId/members",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const members = await FamilyMember.find({ familyId: req.params.familyId })
        .populate("userId", "name email profilePic phone")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        members,
      });
    } catch (error) {
      console.error("Get members error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch members",
      });
    }
  }
);

// Update member
router.put(
  "/families/:familyId/members/:memberId",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const member = await FamilyMember.findOne({
        _id: req.params.memberId,
        familyId: req.params.familyId,
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: "Member not found",
        });
      }

      const allowedUpdates = [
        "displayName",
        "birthdate",
        "deathdate",
        "birthPlace",
        "gender",
        "photoUrl",
        "occupation",
        "education",
        "notes",
        "relation",
        "isAlive",
      ];

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          member[field] = req.body[field];
        }
      });

      await member.save();

      res.json({
        success: true,
        message: "Member updated successfully",
        member,
      });
    } catch (error) {
      console.error("Update member error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update member",
      });
    }
  }
);

// Delete member
router.delete(
  "/families/:familyId/members/:memberId",
  authMiddleware,
  checkFamilyAdmin,
  async (req, res) => {
    try {
      const member = await FamilyMember.findOneAndDelete({
        _id: req.params.memberId,
        familyId: req.params.familyId,
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: "Member not found",
        });
      }

      // Also delete all relationships involving this member
      await Relationship.deleteMany({
        $or: [
          { fromMemberId: req.params.memberId },
          { toMemberId: req.params.memberId },
        ],
      });

      res.json({
        success: true,
        message: "Member deleted successfully",
      });
    } catch (error) {
      console.error("Delete member error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete member",
      });
    }
  }
);

// ============================================
// RELATIONSHIP ROUTES
// ============================================

// Create relationship
router.post(
  "/families/:familyId/relationships",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const { fromMemberId, toMemberId, relationType, notes, startDate } =
        req.body;

      if (!fromMemberId || !toMemberId || !relationType) {
        return res.status(400).json({
          success: false,
          message: "All fields required",
        });
      }

      // Verify both members exist and belong to this family
      const fromMember = await FamilyMember.findOne({
        _id: fromMemberId,
        familyId: req.params.familyId,
      });
      const toMember = await FamilyMember.findOne({
        _id: toMemberId,
        familyId: req.params.familyId,
      });

      if (!fromMember || !toMember) {
        return res.status(404).json({
          success: false,
          message: "One or both members not found",
        });
      }

      const relationship = new Relationship({
        familyId: req.params.familyId,
        fromMemberId,
        toMemberId,
        relationType,
        notes,
        startDate,
        createdBy: req.userId,
      });

      await relationship.save();

      res.status(201).json({
        success: true,
        message: "Relationship created successfully",
        relationship,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This relationship already exists",
        });
      }
      console.error("Create relationship error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create relationship",
      });
    }
  }
);

// Get all relationships
router.get(
  "/families/:familyId/relationships",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const relationships = await Relationship.find({
        familyId: req.params.familyId,
      })
        .populate("fromMemberId", "displayName photoUrl")
        .populate("toMemberId", "displayName photoUrl");

      res.json({
        success: true,
        relationships,
      });
    } catch (error) {
      console.error("Get relationships error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch relationships",
      });
    }
  }
);

// Delete relationship
router.delete(
  "/families/:familyId/relationships/:relationshipId",
  authMiddleware,
  checkFamilyAdmin,
  async (req, res) => {
    try {
      const relationship = await Relationship.findOneAndDelete({
        _id: req.params.relationshipId,
        familyId: req.params.familyId,
      });

      if (!relationship) {
        return res.status(404).json({
          success: false,
          message: "Relationship not found",
        });
      }

      res.json({
        success: true,
        message: "Relationship deleted successfully",
      });
    } catch (error) {
      console.error("Delete relationship error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete relationship",
      });
    }
  }
);

// Export family tree as JSON
router.get(
  "/families/:id/export",
  authMiddleware,
  checkFamilyMember,
  async (req, res) => {
    try {
      const familyId = req.params.id;

      const family = await Family.findById(familyId);
      const members = await FamilyMember.find({ familyId });
      const relationships = await Relationship.find({ familyId });
      const events = await FamilyEvent.find({ familyId });

      const exportData = {
        family: {
          name: family.name,
          description: family.description,
          exportedAt: new Date(),
          exportedBy: req.userId,
        },
        members: members,
        relationships: relationships,
        events: events,
      };

      res.json({
        success: true,
        data: exportData,
      });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export family tree",
      });
    }
  }
);

module.exports = router;
