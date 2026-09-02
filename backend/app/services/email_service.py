import logging
import os
from email.message import EmailMessage
from typing import Optional

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        100% Environment-driven pluggable email dispatch based on settings.EMAIL_PROVIDER.
        Supported providers: 'smtp', 'resend', 'console'
        """
        provider = (settings.EMAIL_PROVIDER or "console").lower()

        if provider == "smtp":
            return await EmailService._send_via_smtp(to_email, subject, html_content, text_content)
        elif provider == "resend":
            return await EmailService._send_via_resend(to_email, subject, html_content, text_content)
        else:
            return EmailService._send_via_console(to_email, subject, html_content, text_content)

    @staticmethod
    async def _send_via_smtp(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email asynchronously via SMTP server (e.g. Gmail SMTP) using aiosmtplib."""
        try:
            msg = EmailMessage()
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = to_email
            msg["Subject"] = subject

            plain_text = text_content or "Please use an HTML-compatible email client to view this message."
            msg.set_content(plain_text)
            msg.add_alternative(html_content, subtype="html")

            smtp_kwargs = {
                "hostname": settings.SMTP_HOST,
                "port": settings.SMTP_PORT,
                "use_tls": settings.SMTP_SSL,
                "start_tls": settings.SMTP_TLS,
            }

            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp_kwargs["username"] = settings.SMTP_USER
                smtp_kwargs["password"] = settings.SMTP_PASSWORD

            logger.info(f"Connecting to SMTP server at {settings.SMTP_HOST}:{settings.SMTP_PORT} for {to_email}...")
            await aiosmtplib.send(msg, **smtp_kwargs)
            logger.info(f"Email successfully sent via SMTP to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    async def _send_via_resend(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email via Resend API (Production mode)."""
        try:
            import resend
            if not settings.RESEND_API_KEY:
                logger.warning("RESEND_API_KEY is missing. Falling back to console log.")
                return EmailService._send_via_console(to_email, subject, html_content, text_content)

            resend.api_key = settings.RESEND_API_KEY
            params = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            if text_content:
                params["text"] = text_content

            res = resend.Emails.send(params)
            logger.info(f"Email sent via Resend API to {to_email}: {res}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via Resend to {to_email}: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def _send_via_console(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Fallback console logger for dev/testing."""
        print("=" * 60)
        print(f"[CONSOLE EMAIL] To: {to_email} | Subject: {subject}")
        print(f"[FROM]: {settings.EMAIL_FROM}")
        print("-" * 60)
        print(text_content or html_content)
        print("=" * 60)
        logger.info(f"[CONSOLE EMAIL] Logged email to {to_email}")
        return True

    @staticmethod
    async def send_password_reset_email(to_email: str, reset_token: str, full_name: Optional[str] = None) -> bool:
        """Helper to compose and send password reset email using environment-configured settings."""
        name = full_name or to_email.split("@")[0]
        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={reset_token}"
        subject = "Reset Your FinTrack Password"

        template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "email", "password_reset.html")
        
        try:
            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()

            html_content = html_template.replace("{{ name }}", name).replace("{{ reset_url }}", reset_url)
        except Exception as e:
            logger.warning(f"Could not load HTML template at {template_path}: {e}. Using fallback HTML.")
            html_content = f"""
                <h2>Password Reset Request</h2>
                <p>Hello {name},</p>
                <p>Click the link below to reset your FinTrack password:</p>
                <p><a href="{reset_url}">{reset_url}</a></p>
            """

        text_content = f"Hello {name},\n\nClick the link to reset your FinTrack password:\n{reset_url}\n\nThis link expires in 1 hour."
        return await EmailService.send_email(to_email, subject, html_content, text_content)

    @staticmethod
    async def send_welcome_email(to_email: str, full_name: Optional[str] = None) -> bool:
        """Helper to compose and send welcome email upon new user registration."""
        name = full_name or to_email.split("@")[0]
        login_url = f"{settings.FRONTEND_URL.rstrip('/')}/login"
        subject = "Welcome to FinTrack — Your Personal Expense Tracker!"

        template_path = os.path.join(os.path.dirname(__file__), "..", "templates", "email", "welcome.html")

        try:
            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()

            html_content = html_template.replace("{{ name }}", name).replace("{{ login_url }}", login_url)
        except Exception as e:
            logger.warning(f"Could not load HTML template at {template_path}: {e}. Using fallback HTML.")
            html_content = f"""
                <h2>Welcome to FinTrack!</h2>
                <p>Hello {name},</p>
                <p>Your account has been successfully created. You can now log in and start tracking your expenses, managing budgets, and monitoring financial health.</p>
                <p><a href="{login_url}">Log in to FinTrack</a></p>
            """

        text_content = f"Hello {name},\n\nWelcome to FinTrack! Your account has been successfully created.\n\nLog in here: {login_url}"
        return await EmailService.send_email(to_email, subject, html_content, text_content)

