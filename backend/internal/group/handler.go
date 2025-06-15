package group

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/siddharth0801/ShareJar/internal/db"
	"github.com/siddharth0801/ShareJar/internal/member"
)

type createGroupRequest struct {
	Name    string   `json:"name"`
	Members []string `json:"members"`
}

func CreateGroup(c *fiber.Ctx) error {
	var body createGroupRequest
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	slug := generateSlug(body.Name)

	group := Group{
		ID:   uuid.New(),
		Name: body.Name,
		Slug: slug,
	}
	if err := db.DB.Create(&group).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not create group"})
	}

	// Add members
	for _, name := range body.Members {
		m := member.Member{
			ID:      uuid.New(),
			Name:    name,
			GroupID: group.ID,
		}
		db.DB.Create(&m)
	}

	return c.JSON(fiber.Map{"slug": slug})
}

func GetGroup(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var group Group
	if err := db.DB.Where("slug = ?", slug).First(&group).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "group not found"})
	}

	var members []member.Member
	if err := db.DB.Where("group_id = ?", group.ID).Find(&members).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not fetch members"})
	}

	return c.JSON(fiber.Map{
		"group":   group,
		"members": members,
	})
}
