package routes

import (
	"github.com/gin-gonic/gin"
	"bridgedesk-backend/handlers"
	"bridgedesk-backend/middleware"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")

	// Public Auth Routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Protected Routes
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired())
	{
		// Dashboard
		protected.GET("/dashboard", handlers.GetDashboardMetrics)
		
		// Intake
		protected.POST("/intake", handlers.CreateIntake)
		
		// People
		protected.GET("/people", handlers.GetPeople)
		protected.POST("/people", handlers.CreatePerson)
		protected.GET("/people/:id", handlers.GetPerson)
		protected.PUT("/people/:id", handlers.UpdatePerson)
		protected.DELETE("/people/:id", handlers.DeletePerson)
		
		// Services
		protected.GET("/services", handlers.GetServices)
		protected.POST("/services", handlers.CreateService)
		protected.GET("/services/:id", handlers.GetService)
		protected.PUT("/services/:id", handlers.UpdateService)
		protected.DELETE("/services/:id", handlers.DeleteService)
		
		// Activity Logs
		protected.GET("/services/:id/activity", handlers.GetActivityLogs)
		protected.POST("/services/:id/activity", handlers.AddActivityLog)
		
		// Analytics
		protected.GET("/analytics/agents", handlers.GetAgentAnalytics)
		
		// Cash Flow
		protected.GET("/cashflows", handlers.GetCashFlows)
		protected.POST("/cashflows", handlers.CreateCashFlow)
		protected.GET("/cashflows/:id", handlers.GetCashFlow)
		protected.PUT("/cashflows/:id", handlers.UpdateCashFlow)
		protected.DELETE("/cashflows/:id", handlers.DeleteCashFlow)
	}
}
