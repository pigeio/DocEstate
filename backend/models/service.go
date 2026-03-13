package models

import (
	"time"
)

type Service struct {
	ID         string     `gorm:"primaryKey;type:varchar(20)" json:"id"`
	PersonID   string     `gorm:"not null;index" json:"person_id"`
	Type       string     `gorm:"not null" json:"type"` // Khata, e-Khata, Khata Transfer, EC
	Status     string     `gorm:"default:'Work Initiated'" json:"status"`
	TotalFee   float64    `gorm:"not null;default:0" json:"total_fee"`
	Agent      string     `json:"agent"`
	Notes      string     `json:"notes"`
	FiledAt    time.Time  `json:"filed_at"`
	ReviewedAt *time.Time `json:"reviewed_at"`
	ClosedAt   *time.Time `json:"closed_at"`
	UpdatedAt  time.Time  `json:"updated_at"`

	Person     Person        `gorm:"foreignKey:PersonID" json:"-"`
	ActivityLogs []ActivityLog `gorm:"foreignKey:ServiceID" json:"activity_logs,omitempty"`
}
