package group

import (
	"github.com/google/uuid"
)

type Group struct {
	ID   uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name string
	Slug string `gorm:"uniqueIndex"`
}
