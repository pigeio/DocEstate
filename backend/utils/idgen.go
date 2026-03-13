package utils

import (
	"fmt"
	"strconv"
	"strings"

	"gorm.io/gorm"
	"bridgedesk-backend/config"
	"bridgedesk-backend/models"
)

func GeneratePersonID() (string, error) {
	var lastPerson models.Person
	result := config.DB.Order("id desc").First(&lastPerson)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return "", result.Error
	}
	
	if result.Error == gorm.ErrRecordNotFound {
		return "BPS-001", nil
	}

	parts := strings.Split(lastPerson.ID, "-")
	if len(parts) != 2 {
		return "BPS-001", nil // fallback
	}

	num, err := strconv.Atoi(parts[1])
	if err != nil {
		return "BPS-001", nil
	}

	return fmt.Sprintf("BPS-%03d", num+1), nil
}

func GenerateServiceID() (string, error) {
	var lastService models.Service
	result := config.DB.Order("id desc").First(&lastService)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return "", result.Error
	}
	
	if result.Error == gorm.ErrRecordNotFound {
		return "SVC-001", nil
	}

	parts := strings.Split(lastService.ID, "-")
	if len(parts) != 2 {
		return "SVC-001", nil
	}

	num, err := strconv.Atoi(parts[1])
	if err != nil {
		return "SVC-001", nil
	}

	return fmt.Sprintf("SVC-%03d", num+1), nil
}

func GenerateCashFlowID() (string, error) {
	var lastCF models.CashFlow
	result := config.DB.Order("id desc").First(&lastCF)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return "", result.Error
	}
	
	if result.Error == gorm.ErrRecordNotFound {
		return "CF-001", nil
	}

	parts := strings.Split(lastCF.ID, "-")
	if len(parts) != 2 {
		return "CF-001", nil
	}

	num, err := strconv.Atoi(parts[1])
	if err != nil {
		return "CF-001", nil
	}

	return fmt.Sprintf("CF-%03d", num+1), nil
}
