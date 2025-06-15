package expense

import (
	"time"

	"github.com/google/uuid"
)

type Expense struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	GroupID   uuid.UUID
	PaidByID  uuid.UUID
	Amount    float64
	Desc      string
	CreatedAt time.Time
	Splits    []ExpenseSplit `gorm:"foreignKey:ExpenseID"`
}

type ExpenseSplit struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	ExpenseID uuid.UUID
	MemberID  uuid.UUID
	Amount    float64
}
