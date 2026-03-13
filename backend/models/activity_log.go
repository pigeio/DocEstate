package models

import "time"

type ActivityLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ServiceID string    `gorm:"not null;index;type:varchar(20)" json:"service_id"`
	Message   string    `gorm:"not null" json:"message"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`

	Service Service `gorm:"foreignKey:ServiceID" json:"-"`
}
