package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
)

func AddActivityLog(c *gin.Context) {
	serviceID := c.Param("id")
	var input struct {
		Message   string `json:"message" binding:"required"`
		CreatedBy string `json:"created_by"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	activity := models.ActivityLog{
		ServiceID: serviceID,
		Message:   input.Message,
		CreatedBy: input.CreatedBy,
		CreatedAt: time.Now(),
	}

	if err := config.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to add activity log"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": activity})
}

func GetActivityLogs(c *gin.Context) {
	serviceID := c.Param("id")
	var logs []models.ActivityLog

	if err := config.DB.Where("service_id = ?", serviceID).Order("created_at desc").Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to fetch activity logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": logs})
}
