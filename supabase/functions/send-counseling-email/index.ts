import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CounselingEmailRequest {
  sessionName: string;
  sessionDate: string;
  sessionTime: string;
  location?: string;
  description?: string;
  mentorName: string;
  studentEmails: string[];
  studentNames: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sessionName,
      sessionDate,
      sessionTime,
      location,
      description,
      mentorName,
      studentEmails,
      studentNames
    }: CounselingEmailRequest = await req.json();

    console.log('Sending counseling emails to:', studentEmails);

    // Format the date and time nicely
    const formattedDate = new Date(sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = new Date(`2000-01-01T${sessionTime}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Send email to each student
    const emailPromises = studentEmails.map(async (email, index) => {
      const studentName = studentNames[index] || 'Student';
      
      return resend.emails.send({
        from: "Counseling Center <counseling@resend.dev>",
        to: [email],
        subject: `Counseling Session Scheduled: ${sessionName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">Counseling Session Invitation</h1>
              <div style="width: 50px; height: 3px; background-color: #2563eb; margin: 0 auto;"></div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 20px;">Dear ${studentName},</h2>
              
              <p style="margin-bottom: 20px; line-height: 1.6;">
                You have been scheduled for a counseling session. Please find the details below:
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb;">
                <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">${sessionName}</h3>
                
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">📅 Date:</strong> 
                  <span style="color: #6b7280;">${formattedDate}</span>
                </div>
                
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">🕐 Time:</strong> 
                  <span style="color: #6b7280;">${formattedTime}</span>
                </div>
                
                ${location ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151;">📍 Location:</strong> 
                  <span style="color: #6b7280;">${location}</span>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151;">👨‍🏫 Mentor:</strong> 
                  <span style="color: #6b7280;">${mentorName}</span>
                </div>
                
                ${description ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <strong style="color: #374151;">📝 Session Description:</strong>
                  <p style="color: #6b7280; margin: 5px 0 0 0; line-height: 1.5;">${description}</p>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h4 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">📋 Please Prepare:</h4>
              <ul style="color: #78350f; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Any questions or concerns you'd like to discuss</li>
                <li>Your academic progress reports or documents</li>
                <li>Goals you want to work on</li>
                <li>Previous action items or commitments</li>
              </ul>
            </div>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #16a34a;">
              <h4 style="color: #166534; margin-top: 0; margin-bottom: 10px;">✅ Important Reminders:</h4>
              <ul style="color: #14532d; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Please arrive 5 minutes early</li>
                <li>Bring a notebook for action items</li>
                <li>Inform your mentor if you need to reschedule</li>
                <li>Come prepared to engage in open discussion</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin-bottom: 10px;">
                If you have any questions or need to reschedule, please contact your mentor directly.
              </p>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This is an automated message from the Counseling Management System.
              </p>
            </div>
          </div>
        `,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    // Check for any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures);
    }

    const successCount = results.filter(result => result.status === 'fulfilled').length;
    
    console.log(`Successfully sent ${successCount} out of ${studentEmails.length} emails`);

    return new Response(JSON.stringify({ 
      success: true,
      emailsSent: successCount,
      totalEmails: studentEmails.length,
      message: `Successfully sent ${successCount} counseling session emails`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-counseling-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);