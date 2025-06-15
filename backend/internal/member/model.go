package member

import "github.com/google/uuid"

type Member struct {
	ID      uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name    string
	GroupID uuid.UUID `gorm:"index"`
}
