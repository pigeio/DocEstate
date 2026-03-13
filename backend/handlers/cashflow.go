package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
	"bridgedesk-backend/utils"
)

func GetCashFlows(c *gin.Context) {
	queryType := c.Query("type")
	
	query := config.DB.Preload("Person").Preload("Service")
	if queryType != "" {
		query = query.Where("type = ?", queryType)
	}
	
	var cashflows []models.CashFlow
	query.Order("date desc, created_at desc").Find(&cashflows)
	
	c.JSON(http.StatusOK, gin.H{"success": true, "data": cashflows, "error": ""})
}

func CreateCashFlow(c *gin.Context) {
	var input struct {
		PersonID  string  `json:"person_id" binding:"required"`
		ServiceID string  `json:"service_id" binding:"required"`
		Type      string  `json:"type" binding:"required"` // advance or complete
		Amount    float64 `json:"amount" binding:"required"`
		Note      string  `json:"note"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	// Validate Person and Service exist
	var person models.Person
	if err := config.DB.First(&person, "id = ?", input.PersonID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": "Invalid person_id"})
		return
	}

	var service models.Service
	if err := config.DB.First(&service, "id = ?", input.ServiceID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": "Invalid service_id"})
		return
	}

	id, err := utils.GenerateCashFlowID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Could not generate ID"})
		return
	}

	cf := models.CashFlow{
		ID:        id,
		PersonID:  input.PersonID,
		ServiceID: input.ServiceID,
		Type:      input.Type,
		Amount:    input.Amount,
		Note:      input.Note,
	}

	if err := config.DB.Create(&cf).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	// Send payment receipt email asynchronously
	if person.Email != "" {
		go func(email, name, svcType, svcID, receiptID string, amount float64, payType string) {
			if err := utils.SendPaymentReceiptEmail(email, name, svcType, svcID, receiptID, amount, payType); err != nil {
				fmt.Printf("[EMAIL ERROR] Failed to send receipt to %s: %v\n", email, err)
			} else {
				fmt.Printf("[EMAIL] Payment receipt %s sent to %s\n", receiptID, email)
			}
		}(person.Email, person.Name, service.Type, service.ID, cf.ID, cf.Amount, cf.Type)
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": cf, "error": ""})
}

func GetCashFlow(c *gin.Context) {
	id := c.Param("id")
	var cf models.CashFlow
	if err := config.DB.Preload("Person").Preload("Service").First(&cf, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "CashFlow not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": cf, "error": ""})
}

func UpdateCashFlow(c *gin.Context) {
	id := c.Param("id")
	var cf models.CashFlow
	if err := config.DB.First(&cf, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "CashFlow not found"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	config.DB.Model(&cf).Updates(input)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": cf, "error": ""})
}

func DeleteCashFlow(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.CashFlow{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "error": ""})
}
