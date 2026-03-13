package models

import (
	"time"
)

type Person struct {
	ID          string    `gorm:"primaryKey;type:varchar(20)" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Email       string    `json:"email"`
	Phone       string    `gorm:"not null" json:"phone"`
	SocietyName string    `json:"society_name"`
	FlatNumber  string    `json:"flat_number"`
	Area        string    `json:"area"`
	Aadhaar     string    `json:"aadhaar"`
	Status      string    `gorm:"default:'active'" json:"status"`
	SourceAgent string    `json:"source_agent"`
	JoinedAt    time.Time `json:"joined_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
