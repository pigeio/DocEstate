package models

import (
	"time"
)

type CashFlow struct {
	ID        string    `gorm:"primaryKey;type:varchar(20)" json:"id"`
	PersonID  string    `gorm:"not null;index" json:"person_id"`
	ServiceID string    `gorm:"not null;index" json:"service_id"`
	Type      string    `gorm:"not null" json:"type"` // advance, complete
	Amount    float64   `gorm:"not null" json:"amount"`
	Note      string    `json:"note"`
	Date      time.Time `json:"date"`
	CreatedAt time.Time `json:"created_at"`
	
	Person    Person    `gorm:"foreignKey:PersonID" json:"-"`
	Service   Service   `gorm:"foreignKey:ServiceID" json:"-"`
}
