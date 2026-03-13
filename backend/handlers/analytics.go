package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
)

type AgentAnalytics struct {
	Agent        string  `json:"agent"`
	TotalIntakes int     `json:"total_intakes"`
	ActiveFiles  int     `json:"active_files"`
	TotalRevenue float64 `json:"total_revenue"`
}

func GetAgentAnalytics(c *gin.Context) {
	var services []models.Service
	if err := config.DB.Find(&services).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch services"})
		return
	}

	var cashflows []models.CashFlow
	if err := config.DB.Find(&cashflows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch cashflows"})
		return
	}

	// Calculate revenue per service
	revenueMap := make(map[string]float64)
	for _, cf := range cashflows {
		revenueMap[cf.ServiceID] += cf.Amount
	}

	// Aggregate metrics per agent
	agentMap := make(map[string]*AgentAnalytics)
	
	for _, s := range services {
		agentName := s.Agent
		if agentName == "" {
			agentName = "Unassigned"
		}

		if _, exists := agentMap[agentName]; !exists {
			agentMap[agentName] = &AgentAnalytics{Agent: agentName}
		}

		agent := agentMap[agentName]
		agent.TotalIntakes++

		if s.Status == "Work Initiated" || s.Status == "Reviewing" {
			agent.ActiveFiles++
		}

		agent.TotalRevenue += revenueMap[s.ID]
	}

	var result []AgentAnalytics
	for _, v := range agentMap {
		result = append(result, *v)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}
