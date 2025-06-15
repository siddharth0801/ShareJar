package group

import "github.com/google/uuid"

func generateSlug(s string) string {
	return s + "-" + uuid.New().String()[:6]
}
