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