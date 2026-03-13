package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
	"bridgedesk-backend/utils"
)

func GetServices(c *gin.Context) {
	status := c.Query("status")
	sType := c.Query("type")

	query := config.DB.Preload("Person")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if sType != "" {
		query = query.Where("type = ?", sType)
	}

	var services []models.Service
	query.Order("filed_at desc, updated_at desc").Find(&services)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": services, "error": ""})
}

func CreateService(c *gin.Context) {
	var input struct {
		PersonID string  `json:"person_id" binding:"required"`
		Type     string  `json:"type" binding:"required"`
		TotalFee float64 `json:"total_fee,string"`
		Agent    string  `json:"agent"`
		Notes    string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	// Validate Person exists
	var person models.Person
	if err := config.DB.First(&person, "id = ?", input.PersonID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": "Invalid person_id"})
		return
	}

	id, err := utils.GenerateServiceID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Could not generate ID"})
		return
	}

	service := models.Service{
		ID:       id,
		PersonID: input.PersonID,
		Type:     input.Type,
		TotalFee: input.TotalFee,
		Status:   "Work Initiated",
		Agent:    input.Agent,
		Notes:    input.Notes,
	}

	if err := config.DB.Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	// Always sync Person -> active when a new service is initiated
	config.DB.Model(&models.Person{}).Where("id = ?", input.PersonID).Update("status", "active")

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": service, "error": ""})
}

func GetService(c *gin.Context) {
	id := c.Param("id")
	var service models.Service
	if err := config.DB.Preload("Person").First(&service, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "Service not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": service, "error": ""})
}

func UpdateService(c *gin.Context) {
	id := c.Param("id")
	var service models.Service

	// Preload Person so we have email/name for the notification
	if err := config.DB.Preload("Person").First(&service, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "Service not found"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	// If attempting to close the service, verify payment is complete
	if newStatus, exists := input["status"]; exists && newStatus == "Closed" {
		var cashFlows []models.CashFlow
		config.DB.Where("service_id = ?", id).Find(&cashFlows)

		totalAdvance := 0.0
		for _, cf := range cashFlows {
			if cf.Type == "advance" {
				totalAdvance += cf.Amount
			}
		}

		totalComplete := 0.0
		for _, cf := range cashFlows {
			if cf.Type == "complete" {
				totalComplete += cf.Amount
			}
		}

		if len(cashFlows) == 0 || totalComplete == 0 || (totalAdvance+totalComplete == 0) {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": "Cannot close service: Payment not completed"})
			return
		}
	}

	// Capture old status before update
	oldStatus := service.Status

	// Set milestone timestamps based on status transitions
	now := time.Now()
	if newStatus, hasStatus := input["status"]; hasStatus {
		if newStatus == "Reviewing" && oldStatus != "Reviewing" {
			input["reviewed_at"] = now
		}
		if newStatus == "Closed" && oldStatus != "Closed" {
			input["closed_at"] = now
		}
	}

	config.DB.Model(&service).Updates(input)

	// ── Auto-sync Person Status ──────────────────────────────────────────────
	// If all services for this person are "Closed", mark the person as "closed".
	// Otherwise, keep the person "active".
	var activeCount int64
	config.DB.Model(&models.Service{}).Where("person_id = ? AND status != ?", service.PersonID, "Closed").Count(&activeCount)
	
	newPersonStatus := "active"
	if activeCount == 0 {
		newPersonStatus = "closed"
	}
	config.DB.Model(&models.Person{}).Where("id = ?", service.PersonID).Update("status", newPersonStatus)

	// ── Automated Email ──────────────────────────────────────────────────────
	// Send a notification email when the service transitions to "Reviewing"
	// for the first time. Runs in background so it never blocks the response.
	if newStatus, hasStatus := input["status"]; hasStatus && newStatus == "Reviewing" && oldStatus != "Reviewing" {
		person := service.Person
		if person.Email != "" {
			go func(email, name, svcType, svcID string) {
				if err := utils.SendReviewEmail(email, name, svcType, svcID); err != nil {
					fmt.Printf("[EMAIL ERROR] Failed to send review email to %s: %v\n", email, err)
				} else {
					fmt.Printf("[EMAIL] Review notification sent to %s for service %s\n", email, svcID)
				}
			}(person.Email, person.Name, service.Type, service.ID)
		} else {
			fmt.Printf("[EMAIL SKIP] No email for person %s — skipping notification for service %s\n", person.ID, service.ID)
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": service, "error": ""})
}

func DeleteService(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Service{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "error": ""})
}
