package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
	"bridgedesk-backend/utils"
)

func GetPeople(c *gin.Context) {
	search := c.Query("search")
	var people []models.Person
	
	query := config.DB
	if search != "" {
		query = query.Where("name ILIKE ? OR id ILIKE ? OR area ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	query.Order("joined_at desc, created_at desc").Find(&people)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": people, "error": ""})
}

func CreatePerson(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email"`
		Phone    string `json:"phone" binding:"required"`
		Area     string `json:"area"`
		Aadhaar  string `json:"aadhaar"`
		JoinedAt string `json:"joined_at"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	id, err := utils.GeneratePersonID()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": "Could not generate ID"})
		return
	}

	person := models.Person{
		ID:      id,
		Name:    input.Name,
		Email:   input.Email,
		Phone:   input.Phone,
		Area:    input.Area,
		Aadhaar: input.Aadhaar,
		Status:  "active",
	}

	if err := config.DB.Create(&person).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": person, "error": ""})
}

func GetPerson(c *gin.Context) {
	id := c.Param("id")
	var person models.Person
	if err := config.DB.First(&person, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "Person not found"})
		return
	}

	var services []models.Service
	config.DB.Where("person_id = ?", id).Order("filed_at desc, updated_at desc").Find(&services)

	var cashflows []models.CashFlow
	config.DB.Where("person_id = ?", id).Order("date desc, created_at desc").Find(&cashflows)

	data := gin.H{
		"person":    person,
		"services":  services,
		"cashflows": cashflows,
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": data, "error": ""})
}

func UpdatePerson(c *gin.Context) {
	id := c.Param("id")
	var person models.Person
	if err := config.DB.First(&person, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "Person not found"})
		return
	}

	var input models.Person
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "error": err.Error()})
		return
	}

	config.DB.Model(&person).Updates(input)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": person, "error": ""})
}

func DeletePerson(c *gin.Context) {
	id := c.Param("id")
	var person models.Person
	if err := config.DB.First(&person, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "data": nil, "error": "Person not found"})
		return
	}

	config.DB.Model(&person).Update("status", "inactive")
	c.JSON(http.StatusOK, gin.H{"success": true, "data": nil, "error": ""})
}
