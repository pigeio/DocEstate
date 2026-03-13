package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
	"bridgedesk-backend/utils"
)

func CreateIntake(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Email       string `json:"email" binding:"required"`
		Phone       string `json:"phone" binding:"required"`
		SocietyName string `json:"society_name" binding:"required"`
		FlatNumber  string `json:"flat_number" binding:"required"`
		ServiceType string  `json:"type" binding:"required"`
		TotalFee    float64 `json:"total_fee,string"`
		AddSociety  string  `json:"area" binding:"required"` // mapped to area
		Notes       string `json:"notes"`
		Agent       string `json:"source_agent" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	tx := config.DB.Begin()

	personID, err := utils.GeneratePersonID()
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Could not generate Person ID"})
		return
	}

	person := models.Person{
		ID:          personID,
		Name:        input.Name,
		Email:       input.Email,
		Phone:       input.Phone,
		SocietyName: input.SocietyName,
		FlatNumber:  input.FlatNumber,
		Area:        input.AddSociety,
		Status:      "active",
		SourceAgent: input.Agent,
	}

	if err := tx.Create(&person).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Failed to create person"})
		return
	}

	serviceID, err := utils.GenerateServiceID()
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Could not generate Service ID"})
		return
	}

	service := models.Service{
		ID:       serviceID,
		PersonID: person.ID,
		Type:     input.ServiceType,
		TotalFee: input.TotalFee,
		Status:   "Work Initiated",
		Agent:    input.Agent,
		Notes:    input.Notes,
		FiledAt:  time.Now(),
	}

	if err := tx.Create(&service).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Failed to create service"})
		return
	}

	tx.Commit()

	response := gin.H{
		"person_id":    person.ID,
		"service_id":   service.ID,
		"name":         person.Name,
		"service_type": service.Type,
		"agent":        service.Agent,
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": response, "error": ""})
}
