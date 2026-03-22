"""Email notification service"""
import logging
from typing import List
from ..config import SENDGRID_API_KEY, EMAIL_FROM, ADMIN_EMAIL

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email alerts"""
    
    @staticmethod
    def send_alert(instance_name: str, alert_type: str, alert_message: str, recipient: str = None) -> bool:
        """
        Send email alert to admin
        
        Args:
            instance_name: Name of the instance
            alert_type: Type of alert (down, high_cpu, high_ram, high_storage)
            alert_message: Alert message details
            recipient: Email recipient (default: ADMIN_EMAIL)
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if recipient is None:
            recipient = ADMIN_EMAIL
        
        try:
            # Check if SendGrid API key is configured
            if SENDGRID_API_KEY == "your-sendgrid-api-key-here":
                logger.warning("SendGrid API key not configured. Skipping email.")
                return False
            
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            # Alert type icons and titles
            alert_titles = {
                "down": "🚨 SERVER DOWN",
                "high_cpu": "⚠️ HIGH CPU USAGE",
                "high_ram": "⚠️ HIGH RAM USAGE",
                "high_storage": "⚠️ HIGH STORAGE USAGE"
            }
            
            subject = f"{alert_titles.get(alert_type, 'Alert')} - {instance_name}"
            
            # Create email body
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px;">
                        <h2 style="color: #d32f2f; margin-bottom: 15px;">{subject}</h2>
                        
                        <p><strong>Instance:</strong> {instance_name}</p>
                        <p><strong>Alert Type:</strong> {alert_type}</p>
                        <p><strong>Details:</strong></p>
                        <p>{alert_message}</p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This is an automated alert from Cloud Cost Optimization Dashboard.<br>
                            Click <a href="http://localhost:3000">here</a> to view the dashboard.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            message = Mail(
                from_email=EMAIL_FROM,
                to_emails=recipient,
                subject=subject,
                html_content=html_content
            )
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            
            logger.info(f"Email sent for {instance_name}: {alert_type}")
            return response.status_code in [200, 202]
            
        except ImportError:
            logger.error("SendGrid library not installed. Install with: pip install sendgrid")
            return False
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
    
    @staticmethod
    def send_weekly_summary(instances_data: List[dict], recipient: str = None) -> bool:
        """
        Send weekly summary email
        
        Args:
            instances_data: List of instance data dicts
            recipient: Email recipient
            
        Returns:
            True if email sent successfully
        """
        if recipient is None:
            recipient = ADMIN_EMAIL
        
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            # Calculate summary stats
            total_instances = len(instances_data)
            total_cost = sum(d.get('monthly_cost', 0) for d in instances_data)
            total_waste = sum(d.get('monthly_waste', 0) for d in instances_data)
            
            instances_list_html = "".join([
                f"<li>{d['name']}: ${d['monthly_cost']} (Waste: ${d.get('monthly_waste', 0)})</li>"
                for d in instances_data
            ])
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px;">
                        <h2 style="color: #1976d2;">Weekly Cloud Cost Summary</h2>
                        
                        <div style="background-color: #f0f4f8; padding: 15px; border-radius: 4px; margin: 15px 0;">
                            <p><strong>📊 Summary:</strong></p>
                            <ul style="list-style: none; padding: 0;">
                                <li>✓ Total Instances: {total_instances}</li>
                                <li>💰 Total Monthly Cost: ${total_cost:.2f}</li>
                                <li>🚀 Total Potential Savings: ${total_waste:.2f}</li>
                            </ul>
                        </div>
                        
                        <h3>Instances:</h3>
                        <ul>{instances_list_html}</ul>
                        
                        <p style="margin-top: 20px;">
                            <a href="http://localhost:3000" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                                View Full Dashboard
                            </a>
                        </p>
                    </div>
                </body>
            </html>
            """
            
            message = Mail(
                from_email=EMAIL_FROM,
                to_emails=recipient,
                subject="📊 Weekly Cloud Cost Summary",
                html_content=html_content
            )
            
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            
            logger.info(f"Weekly summary sent to {recipient}")
            return response.status_code in [200, 202]
            
        except Exception as e:
            logger.error(f"Error sending summary email: {str(e)}")
            return False


# Fallback: Simple email logging service (when SendGrid not available)
class EmailServiceFallback:
    """Fallback email service that logs alerts instead of sending emails"""
    
    @staticmethod
    def send_alert(instance_name: str, alert_type: str, alert_message: str, recipient: str = None) -> bool:
        """Log alert instead of sending email"""
        logger.warning(f"[EMAIL ALERT] {instance_name} - {alert_type}: {alert_message}")
        return True
    
    @staticmethod
    def send_weekly_summary(instances_data: List[dict], recipient: str = None) -> bool:
        """Log weekly summary instead of sending email"""
        logger.warning(f"[WEEKLY SUMMARY] Generated for {len(instances_data)} instances")
        return True
