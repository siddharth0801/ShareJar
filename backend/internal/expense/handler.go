package expense

import (
	"math"
	"sort"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/siddharth0801/ShareJar/internal/db"
	"github.com/siddharth0801/ShareJar/internal/group"
	"github.com/siddharth0801/ShareJar/internal/member"
)

type createExpenseRequest struct {
	Amount     float64  `json:"amount"`
	Desc       string   `json:"desc"`
	GroupSlug  string   `json:"group_slug"`
	PaidByID   string   `json:"paid_by_id"`
	PaidForIDs []string `json:"paid_for_ids"`
}

type Balance struct {
	From   string  `json:"from"`
	To     string  `json:"to"`
	Amount float64 `json:"amount"`
}

func CreateExpense(c *fiber.Ctx) error {
	var body createExpenseRequest
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	var group group.Group
	if err := db.DB.Where("slug = ?", body.GroupSlug).First(&group).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "group not found"})
	}

	paidByID, err := uuid.Parse(body.PaidByID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid paid_by_id"})
	}

	var paidBy member.Member
	if err := db.DB.Where("id = ? AND group_id = ?", paidByID, group.ID).First(&paidBy).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "paid_by member not found"})
	}

	var paidForMembers []member.Member
	if len(body.PaidForIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no paid_for members provided"})
	}
	for _, idStr := range body.PaidForIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid member ID in paid_for_ids"})
		}
		var m member.Member
		if err := db.DB.Where("id = ? AND group_id = ?", id, group.ID).First(&m).Error; err == nil {
			paidForMembers = append(paidForMembers, m)
		}
	}
	if len(paidForMembers) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no valid paid_for members found"})
	}

	expense := Expense{
		ID:       uuid.New(),
		GroupID:  group.ID,
		PaidByID: paidBy.ID,
		Amount:   body.Amount,
		Desc:     body.Desc,
	}
	if err := db.DB.Create(&expense).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save expense"})
	}

	splitAmount := body.Amount / float64(len(paidForMembers))
	for _, m := range paidForMembers {
		s := ExpenseSplit{
			ID:        uuid.New(),
			ExpenseID: expense.ID,
			MemberID:  m.ID,
			Amount:    splitAmount,
		}
		db.DB.Create(&s)
	}

	return c.JSON(fiber.Map{"message": "expense added"})
}

func GetExpensesByGroup(c *fiber.Ctx) error {
	groupSlug := c.Params("slug")
	var group group.Group
	if err := db.DB.Where("slug = ?", groupSlug).First(&group).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "group not found"})
	}

	var expenses []Expense
	if err := db.DB.Where("group_id = ?", group.ID).Find(&expenses).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not fetch expenses"})
	}

	for i, expense := range expenses {
		var splits []ExpenseSplit
		if err := db.DB.Where("expense_id = ?", expense.ID).Find(&splits).Error; err == nil {
			expenses[i].Splits = splits
		}
	}

	return c.JSON(expenses)
}

func GetGroupBalances(c *fiber.Ctx) error {
	slug := c.Params("slug")

	var grp group.Group
	if err := db.DB.Where("slug = ?", slug).First(&grp).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "group not found"})
	}

	var members []member.Member
	if err := db.DB.Where("group_id = ?", grp.ID).Find(&members).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not fetch members"})
	}

	idToName := make(map[uuid.UUID]string)
	for _, m := range members {
		idToName[m.ID] = m.Name
	}

	balance := make(map[uuid.UUID]float64)

	var expenses []Expense
	if err := db.DB.Where("group_id = ?", grp.ID).Find(&expenses).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not fetch expenses"})
	}

	for _, exp := range expenses {
		var splits []ExpenseSplit
		db.DB.Where("expense_id = ?", exp.ID).Find(&splits)

		for _, split := range splits {
			balance[split.MemberID] -= split.Amount
			balance[exp.PaidByID] += split.Amount
		}
	}

	type entry struct {
		ID     uuid.UUID
		Name   string
		Amount float64
	}
	var debtors []entry
	var creditors []entry

	for id, amt := range balance {
		amt = math.Round(amt*100) / 100
		if amt < 0 {
			debtors = append(debtors, entry{ID: id, Name: idToName[id], Amount: amt})
		} else if amt > 0 {
			creditors = append(creditors, entry{ID: id, Name: idToName[id], Amount: amt})
		}
	}

	sort.Slice(debtors, func(i, j int) bool { return debtors[i].Amount < debtors[j].Amount })
	sort.Slice(creditors, func(i, j int) bool { return creditors[i].Amount > creditors[j].Amount })

	var result []Balance
	i, j := 0, 0

	for i < len(debtors) && j < len(creditors) {
		debtor := &debtors[i]
		creditor := &creditors[j]

		minAmount := math.Min(-debtor.Amount, creditor.Amount)
		minAmount = math.Round(minAmount*100) / 100

		if minAmount > 0 {
			result = append(result, Balance{
				From:   debtor.Name,
				To:     creditor.Name,
				Amount: minAmount,
			})

			debtor.Amount += minAmount
			creditor.Amount -= minAmount
		}

		if math.Abs(debtor.Amount) < 0.01 {
			i++
		}
		if math.Abs(creditor.Amount) < 0.01 {
			j++
		}
	}

	if len(result) == 0 {
		return c.JSON([]Balance{})
	}
	return c.JSON(result)
}
