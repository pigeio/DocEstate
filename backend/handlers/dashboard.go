package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
)

func GetDashboardMetrics(c *gin.Context) {
	var totalPeople int64
	var activeServices int64
	var closedServices int64
	var cashFlows []models.CashFlow

	config.DB.Model(&models.Person{}).Count(&totalPeople)
	config.DB.Model(&models.Service{}).Where("status != ?", "Closed").Count(&activeServices)
	config.DB.Model(&models.Service{}).Where("status = ?", "Closed").Count(&closedServices)
	config.DB.Find(&cashFlows)

	var totalAdvance float64 = 0
	var totalComplete float64 = 0

	for _, cf := range cashFlows {
		if cf.Type == "advance" {
			totalAdvance += cf.Amount
		} else if cf.Type == "complete" {
			totalComplete += cf.Amount
		}
	}

	var recentServices []models.Service
	config.DB.Preload("Person").Order("filed_at desc").Limit(5).Find(&recentServices)

	var recentCashFlows []models.CashFlow
	config.DB.Preload("Person").Preload("Service").Order("created_at desc").Limit(5).Find(&recentCashFlows)

	data := gin.H{
		"total_people":     totalPeople,
		"active_services":  activeServices,
		"closed_services":  closedServices,
		"total_advance":    totalAdvance,
		"total_complete":   totalComplete,
		"total_receipts":   totalAdvance + totalComplete,
		"recent_services":  recentServices,
		"recent_cashflows": recentCashFlows,
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": data, "error": ""})
}
