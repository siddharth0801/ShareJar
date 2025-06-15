package member

import (
	"github.com/gofiber/fiber/v2"
	"github.com/siddharth0801/ShareJar/internal/db"
)

func GetMember(c *fiber.Ctx) error {
	groupID := c.Params("groupID")
	memberID := c.Params("memberID")
	var member Member
	if err := db.DB.Where("group_id = ?", groupID).Where("id = ?", memberID).Find(&member).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not fetch member"})
	}

	return c.JSON(member)
}
