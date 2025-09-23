import nodemailer from 'nodemailer';
import { config } from '../config';

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: SendEmailParams) => {
  try {
    // Skip email sending in development if SMTP credentials are not properly configured
    if (config.nodeEnv === 'development' &&
      (config.smtp.user === 'your-email@gmail.com' || !config.smtp.user || !config.smtp.pass)) {
      console.log('📧 Email sending skipped in development (SMTP not configured)');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text || html}`);
      return { messageId: 'dev-mode-skipped' };
    }

    const info = await transporter.sendMail({
      from: `"SynergyHub" <${config.smtp.user}>`,
      to,
      subject,
      text,
      html
    });

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // In development, don't fail the request if email fails
    if (config.nodeEnv === 'development') {
      console.log('📧 Email sending failed in development mode - continuing anyway');
      return { messageId: 'dev-mode-failed' };
    }
    throw error;
  }
};

// Template for task assignment notification
export const sendTaskAssignmentEmail = async (
  to: string,
  taskTitle: string,
  projectName: string,
  assignerName: string
) => {
  const subject = `New Task Assignment: ${taskTitle}`;
  const html = `
    <h2>You have been assigned a new task</h2>
    <p>Hello,</p>
    <p>You have been assigned a new task by ${assignerName}:</p>
    <div style="margin: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
      <h3>${taskTitle}</h3>
      <p>Project: ${projectName}</p>
    </div>
    <p>Please log in to SynergyHub to view the task details and get started.</p>
    <p>Best regards,<br>SynergyHub Team</p>
  `;

  return sendEmail({ to, subject, html });
};

export const sendInvitationEmail = async (
  to: string,
  inviteUrl: string,
  role: 'Admin' | 'Member' | 'Client',
  businessName?: string,
  inviterName?: string
) => {
  const subject = businessName
    ? `Invitation to join ${businessName} as ${role} on SynergyHub`
    : `Invitation to join SynergyHub as ${role}`;

  // Role-specific access descriptions
  const accessDescriptions = {
    Admin: [
      'Full access to manage team and settings',
      'Create and manage projects',
      'Invite team members',
      'View and manage billing',
      'Access to all system features'
    ],
    Member: [
      'Access to assigned projects and tasks',
      'Team chat and collaboration',
      'Client communication',
      'Project updates and tracking',
      'Task management features'
    ],
    Client: [
      'View assigned projects',
      'Communicate with team members',
      'Track project progress',
      'Submit feedback and requests',
      'Access shared documents'
    ]
  };

  const roleColors = {
    Admin: '#8B5CF6', // Purple for admin
    Member: '#0070f3', // Blue for member
    Client: '#10B981'  // Green for client
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .role-badge { 
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          color: white;
          background-color: ${roleColors[role]};
        }
        .features {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .features ul { padding-left: 20px; }
        .features li { margin-bottom: 8px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${roleColors[role]};
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to SynergyHub!</h2>
          <div class="role-badge">${role}</div>
        </div>
        
        <p>Hello,</p>
        <p>${inviterName || 'Your team'} has invited you to join ${businessName || 'SynergyHub'} as a <strong>${role}</strong>.</p>
        
        <div class="features">
          <p><strong>As a ${role}, you'll have access to:</strong></p>
          <ul>
            ${accessDescriptions[role].map(desc => `<li>${desc}</li>`).join('')}
          </ul>
        </div>

        <p>To accept this invitation and get started, click the button below:</p>
        
        <div style="text-align: center;">
          <a href="${inviteUrl}" class="button">
            Accept Invitation
          </a>
        </div>

        <div class="footer">
          <p>This invitation will expire in 7 days.</p>
          <p>If you have any questions, please contact support@synergyhub.com</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,<br>SynergyHub Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
};

interface WelcomeEmailParams {
  to: string;
  name: string;
  businessName?: string;
}

export const sendWelcomeEmail = async ({ to, name, businessName }: WelcomeEmailParams) => {
  const subject = 'Welcome to SynergyHub!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to SynergyHub</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer { color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SynergyHub!</h1>
          <p>Your account has been successfully created</p>
        </div>
        
        <p>Hello ${name},</p>
        <p>Welcome to SynergyHub! Your account has been successfully created${businessName ? ` and you've been added to ${businessName}` : ''}.</p>
        
        <p>You can now start collaborating with your team, managing projects, and tracking tasks efficiently.</p>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
            Go to Dashboard
          </a>
        </div>

        <div class="footer">
          <p>If you have any questions, please contact support@synergyhub.com</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,<br>SynergyHub Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
};

interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
}

export const sendPasswordResetEmail = async ({ to, name, resetUrl }: PasswordResetEmailParams) => {
  const subject = 'Reset your SynergyHub password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset your password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #dc3545;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .warning { 
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Reset Your Password</h2>
        </div>
        
        <p>Hello ${name},</p>
        <p>We received a request to reset your SynergyHub password. If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">
            Reset Password
          </a>
        </div>

        <div class="warning">
          <strong>Security Notice:</strong>
          <ul>
            <li>This link will expire in 1 hour for security purposes</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Never share this link with anyone</li>
          </ul>
        </div>

        <div class="footer">
          <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,<br>SynergyHub Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
};

// Export as emailService object
export const emailService = {
  sendEmail,
  sendInvitationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};