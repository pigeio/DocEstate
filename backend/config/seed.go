package config

import (
	"log"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"bridgedesk-backend/models"
)

func SeedAdmin() {
	var adminUser models.User
	
	// Check if admin already exists
	if err := DB.Where("email = ?", "admin@bridgedesk.com").First(&adminUser).Error; err == nil {
		// Admin already exists, skip seeding
		return
	}

	log.Println("Seeding initial admin user...")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("adminpassword"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash admin password:", err)
	}

	adminUser = models.User{
		ID:       uuid.New().String(),
		Name:     "Admin Staff",
		Email:    "admin@bridgedesk.com",
		Password: string(hashedPassword),
		Role:     "admin",
	}

	if err := DB.Create(&adminUser).Error; err != nil {
		log.Fatal("Failed to seed admin user:", err)
	}

	log.Println("Successfully seeded admin user: admin@bridgedesk.com / adminpassword")
}
