package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

type ResendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

// BuildCustomEmailHTML creates a professional, clean, emoji-free HTML email template
func BuildCustomEmailHTML(title, content, otpCode, verifyLink string) string {
	if title == "" {
		title = "ยืนยันที่อยู่อีเมลของคุณ"
	}
	if content == "" {
		content = "ขอบคุณสำหรับการสมัครใช้งาน NgaanBaan (งานบาน) กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันตัวตนของคุณ:"
	}

	otpSection := ""
	if otpCode != "" {
		otpSection = fmt.Sprintf(`
			<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
				<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #475569; margin-bottom: 8px;">
					รหัสยืนยันตัวตน (OTP)
				</div>
				<div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #0f172a; text-indent: 10px;">
					%s
				</div>
				<div style="font-size: 12px; color: #64748b; margin-top: 8px;">
					รหัสนี้มีอายุการใช้งาน 15 นาที
				</div>
			</div>
		`, otpCode)
	}

	linkSection := ""
	if verifyLink != "" {
		linkSection = fmt.Sprintf(`
			<div style="text-align: center; margin-top: 24px;">
				<a href="%s" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 32px; border-radius: 8px; transition: background-color 0.2s ease;">
					ยืนยันอีเมลของคุณ
				</a>
			</div>
		`, verifyLink)
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
    <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0;">
                    <!-- Top Clean Header Banner -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 32px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                                NgaanBaan <span style="font-size: 18px; font-weight: 700; color: #ffffff; margin-left: 4px;">| งานบาน</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px 32px 32px;">
                            <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; text-align: center;">
                                %s
                            </h1>
                            <div style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0; text-align: center;">
                                %s
                            </div>

                            %s

                            %s
                        </td>
                    </tr>

                    <!-- Clean Professional Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center;">
                            <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">
                                หากคุณไม่ได้เป็นผู้ร้องขออีเมลนี้ กรุณาข้ามอีเมลนี้ไป
                            </p>
                            <p style="font-size: 11px; font-weight: 600; color: #94a3b8; margin: 0;">
                                NgaanBaan Team &bull; Project Management
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`, title, title, content, otpSection, linkSection)
}

// SendCustomEmail dispatches any email with specified title, content, recipient, otpCode, verifyLink
func SendCustomEmail(recipientEmail, subject, title, content, otpCode, verifyLink string) error {
	if subject == "" {
		subject = "รหัสยืนยันตัวตนอีเมลของคุณ - NgaanBaan"
	}
	htmlBody := BuildCustomEmailHTML(title, content, otpCode, verifyLink)

	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	if smtpUser != "" && smtpPass != "" {
		return sendViaSMTPCustom(recipientEmail, subject, htmlBody, smtpUser, smtpPass)
	}

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey != "" {
		return sendViaResendCustom(recipientEmail, subject, htmlBody, apiKey)
	}

	log.Printf("[Mailer Local Dev] Recipient: %s | Subject: %s | OTP: %s", recipientEmail, subject, otpCode)
	return nil
}

// SendVerificationEmail sends default verification email
func SendVerificationEmail(recipientEmail, otpCode, verificationToken string) error {
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}
	verifyLink := fmt.Sprintf("%s/login?token=%s", appURL, verificationToken)
	subject := "รหัสยืนยันตัวตนอีเมลของคุณ - NgaanBaan"
	title := "ยืนยันที่อยู่อีเมลของคุณ"
	content := "ขอบคุณสำหรับการสมัครใช้งาน NgaanBaan (งานบาน) กรุณาใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันตัวตนของคุณ:"

	return SendCustomEmail(recipientEmail, subject, title, content, otpCode, verifyLink)
}

// SendPasswordResetEmail sends password reset link email
func SendPasswordResetEmail(recipientEmail, resetToken string) error {
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", appURL, resetToken)
	subject := "คำขอรีเซ็ตรหัสผ่านของคุณ - NgaanBaan"
	title := "รีเซ็ตรหัสผ่านของคุณ"
	content := "เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์นี้มีอายุ 1 ชั่วโมง):"

	return SendCustomEmail(recipientEmail, subject, title, content, "", resetLink)
}

func sendViaSMTPCustom(recipientEmail, subject, htmlBody, smtpUser, smtpPass string) error {
	cleanUser := strings.TrimSpace(smtpUser)
	cleanPass := strings.ReplaceAll(smtpPass, " ", "")

	smtpHost := os.Getenv("SMTP_HOST")
	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	smtpPort := os.Getenv("SMTP_PORT")
	if smtpPort == "" {
		smtpPort = "587"
	}

	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "NgaanBaan"
	}
	headerFrom := fmt.Sprintf("From: %s <%s>\n", fromName, cleanUser)
	headerSubject := fmt.Sprintf("Subject: %s\n", subject)
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	msg := []byte(headerFrom + headerSubject + mime + htmlBody)
	auth := smtp.PlainAuth("", cleanUser, cleanPass, smtpHost)

	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	err := smtp.SendMail(addr, auth, cleanUser, []string{recipientEmail}, msg)
	if err != nil {
		log.Printf("[SMTP Error] Failed to send email to %s: %v", recipientEmail, err)
		return err
	}

	log.Printf("[SMTP Success] Email dispatched to %s via SMTP (%s)", recipientEmail, smtpHost)
	return nil
}

func sendViaResendCustom(recipientEmail, subject, htmlBody, apiKey string) error {
	sender := os.Getenv("RESEND_FROM_EMAIL")
	if sender == "" {
		sender = "NgaanBaan <onboarding@resend.dev>"
	}

	payload := ResendEmailPayload{
		From:    sender,
		To:      []string{recipientEmail},
		Subject: subject,
		HTML:    htmlBody,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[Resend Error] Failed to dispatch email: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		log.Printf("[Resend Warning] Status %d: %v", resp.StatusCode, errResp)
		return fmt.Errorf("resend API error status %d", resp.StatusCode)
	}

	log.Printf("[Resend Success] Email dispatched to %s", recipientEmail)
	return nil
}
