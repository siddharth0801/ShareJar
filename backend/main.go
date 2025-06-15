package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/siddharth0801/ShareJar/internal/db"
	"github.com/siddharth0801/ShareJar/internal/expense"
	"github.com/siddharth0801/ShareJar/internal/group"
	"github.com/siddharth0801/ShareJar/internal/member"
)

func main() {
	db.Connect()
	db.DB.AutoMigrate(
		&group.Group{},
		&member.Member{},
		&expense.Expense{},
		&expense.ExpenseSplit{},
	)

	app := fiber.New()
	app.Use(cors.New())

	app.Post("/group", group.CreateGroup)
	app.Get("/group/:slug", group.GetGroup)
	app.Get("/group/:slug/balance", expense.GetGroupBalances)

	app.Get("/member/:groupID/:memberID", member.GetMember)

	app.Post("/expense", expense.CreateExpense)
	app.Get("/expense/:slug", expense.GetExpensesByGroup)

	app.Listen(":8080")
}
