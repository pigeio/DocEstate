package utils

import (
	"bytes"
	"fmt"
	"net/smtp"
	"os"
)

// serviceDays maps service type to estimated duration string shown in the email
var serviceDays = map[string]string{
	"e-Khata":       "15-21 working days",
	"Khata Transfer": "45-60 working days",
	"Khata":         "60 working days",
	"EC":            "10 working days",
}

// SendReviewEmail sends a professional HTML email requesting advance payment.
func SendReviewEmail(toEmail, clientName, serviceType, serviceID string) error {
	from := os.Getenv("SMTP_FROM")
	password := os.Getenv("SMTP_PASSWORD")

	if from == "" || password == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	subject := "Action Required: Advance Payment for your Application"
	
	// UPI Details extracted from the user's G-Pay QR Code
	upiID := "rajanand3307-2@oksbi"
	payeeName := "Anand Raj"
	
	// Generate the exact same QR code via API
	qrCodeURL := fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=%s&pn=%s", upiID, "Anand%20Raj")

	// Fallback duration if service type is not mapped
	duration, ok := serviceDays[serviceType]
	if !ok {
		duration = "15-30 working days"
	}

	// Create the HTML payload
	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px; background-color: #fafafa; }
  .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
  .highlight { background-color: #e0e7ff; color: #4f46e5; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
  .qr-box { background: white; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px solid #eaeaec; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; color: #b91c1c; font-size: 14px; }
  .expect-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0; }
  .expect-box ul { padding-left: 20px; margin-bottom: 0; }
  .expect-box li { margin-bottom: 8px; color: #334155; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: #111827; margin: 0;">Doc Estate Solutions</h2>
    </div>
    
    <p>Dear <strong>%s</strong>,</p>
    
    <p>Thank you for choosing us for your <strong>%s</strong> requirements. Your service request has been initiated successfully.</p>
    
    <p>To commence the processing of your application (Reference ID: <span class="highlight">%s</span>), we kindly request you to complete the advance payment within the next <strong>36 hours</strong>.</p>
    
    <div class="qr-box">
      <h3 style="margin-top:0; color: #374151;">Scan to Pay via any UPI App</h3>
      <img src="%s" alt="G-Pay QR Code" width="200" height="200" style="margin: 10px 0;">
      <p style="margin-bottom:0; font-size: 15px; color: #4b5563;">UPI ID: <strong>%s</strong></p>
      <p style="margin-top:4px; font-size: 14px; color: #6b7280;">Name: %s</p>
    </div>
    
    <div class="warning">
      <strong>CRITICAL INSTRUCTION:</strong> Please ensure you mention your Reference ID (<strong>%s</strong>) in the payment remarks/notes. This helps us instantly match your payment to your application.
    </div>
    
    <p>Once the payment is made, our team will verify it and immediately begin processing your file.</p>

    <div class="expect-box">
      <h4 style="margin-top:0; color: #1e293b; margin-bottom: 12px;">Here's what you can expect next:</h4>
      <ul>
        <li>✅ <strong>Estimated Processing Time:</strong> %s</li>
        <li>✅ Our team will keep you updated at every key milestone.</li>
        <li>✅ If any additional documents are required, we will reach out to you promptly.</li>
      </ul>
    </div>
    
    <p>Should you have any questions or concerns in the meantime, please feel free to contact us directly:</p>
    <p style="font-size: 14px; color: #475569;">📧 Email: <strong>docestatesolutions@gmail.com</strong></p>

    <p>Thank you for trusting Doc Estate Solutions with your property documentation needs. We are committed to making this process smooth and hassle-free for you.</p>

    <p>Have a wonderful day!</p>
    
    <p>Warm regards,<br><strong>Doc Estate Solutions Team</strong></p>
  </div>
</body>
</html>
`, clientName, serviceType, serviceID, qrCodeURL, upiID, payeeName, serviceID, duration)

	// Build the multipart email
	var msg bytes.Buffer
	msg.WriteString(fmt.Sprintf("From: Doc Estate Solutions <%s>\r\n", from))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", toEmail))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	// Gmail SMTP
	auth := smtp.PlainAuth("", from, password, "smtp.gmail.com")
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, []string{toEmail}, msg.Bytes())
	if err != nil {
		return fmt.Errorf("failed to send html email: %w", err)
	}

	return nil
}

// SendPaymentReceiptEmail sends a professional HTML payment receipt email.
func SendPaymentReceiptEmail(toEmail, clientName, serviceType, serviceID, receiptID string, amount float64, payType string) error {
	from := os.Getenv("SMTP_FROM")
	password := os.Getenv("SMTP_PASSWORD")

	if from == "" || password == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	payLabel := "Advance"
	if payType == "complete" {
		payLabel = "Complete Clearance"
	}

	subject := fmt.Sprintf("Payment Receipt — %s (Ref: %s)", payLabel, serviceID)

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 10px; background-color: #fafafa; }
  .header { border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
  .receipt-box { background: white; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid #d1fae5; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .receipt-badge { display: inline-block; background-color: #d1fae5; color: #065f46; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
  .amount { font-size: 36px; font-weight: 700; color: #059669; margin: 10px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .detail-label { color: #64748b; }
  .detail-value { color: #1e293b; font-weight: 600; }
  .info-box { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #1e40af; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: #111827; margin: 0;">Doc Estate Solutions</h2>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Payment Receipt</p>
    </div>
    
    <p>Dear <strong>%s</strong>,</p>
    
    <p>We have successfully received your payment. Here are the details for your records:</p>
    
    <div class="receipt-box">
      <div class="receipt-badge">✅ Payment Confirmed</div>
      <div class="amount">₹%s</div>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">%s Payment</p>
    </div>

    <div style="background: white; border-radius: 10px; border: 1px solid #eaeaec; overflow: hidden; margin: 20px 0;">
      <div class="detail-row"><span class="detail-label">Receipt ID</span><span class="detail-value">%s</span></div>
      <div class="detail-row"><span class="detail-label">Service Ref</span><span class="detail-value">%s</span></div>
      <div class="detail-row"><span class="detail-label">Service Type</span><span class="detail-value">%s</span></div>
      <div class="detail-row" style="border-bottom: none;"><span class="detail-label">Payment Type</span><span class="detail-value">%s</span></div>
    </div>

    <div class="info-box">
      💡 Please save this email as your payment confirmation. You can reference your Receipt ID (<strong>%s</strong>) for any future queries.
    </div>

    <p>Should you have any questions, please feel free to contact us:</p>
    <p style="font-size: 14px; color: #475569;">📧 Email: <strong>docestatesolutions@gmail.com</strong></p>

    <p>Thank you for trusting Doc Estate Solutions!</p>
    
    <p>Warm regards,<br><strong>Doc Estate Solutions Team</strong></p>
  </div>
</body>
</html>
`, clientName, formatIndianAmount(amount), payLabel, receiptID, serviceID, serviceType, payLabel, receiptID)

	var msg bytes.Buffer
	msg.WriteString(fmt.Sprintf("From: Doc Estate Solutions <%s>\r\n", from))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", toEmail))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	auth := smtp.PlainAuth("", from, password, "smtp.gmail.com")
	err := smtp.SendMail("smtp.gmail.com:587", auth, from, []string{toEmail}, msg.Bytes())
	if err != nil {
		return fmt.Errorf("failed to send receipt email: %w", err)
	}

	return nil
}

// formatIndianAmount formats a float to Indian comma-separated string
func formatIndianAmount(amount float64) string {
	intPart := int64(amount)
	s := fmt.Sprintf("%d", intPart)
	if len(s) <= 3 {
		return s
	}
	// Indian formatting: last 3, then groups of 2
	result := s[len(s)-3:]
	s = s[:len(s)-3]
	for len(s) > 2 {
		result = s[len(s)-2:] + "," + result
		s = s[:len(s)-2]
	}
	if len(s) > 0 {
		result = s + "," + result
	}
	return result
}
