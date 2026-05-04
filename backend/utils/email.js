import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // optional: verify once
    await transporter.verify();
    console.log("SMTP ready");
  }
  return transporter;
};

export const sendEmailOTP = async (email, otp,type) => {
  let subject = "";
  if(type === "login"){
    subject = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
          <tr>
            <td align="center">
      
              <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <h2 style="margin:0;color:#111;">ShopNow</h2>
                  </td>
                </tr>
      
                <tr>
                  <td align="center">
                    <h3 style="margin:0;color:#333;">Verify your login</h3>
                  </td>
                </tr>
      
                <tr>
                  <td align="center" style="padding:10px 0;color:#555;font-size:14px;">
                    Use the code below to continue logging in.
                  </td>
                </tr>
      
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <div style="
                      display:inline-block;
                      padding:15px 25px;
                      font-size:28px;
                      letter-spacing:6px;
                      font-weight:bold;
                      background:#f1f5f9;
                      border-radius:8px;
                      color:#111;
                    ">
                      ${otp}
                    </div>
                  </td>
                </tr>
      
                <tr>
                  <td align="center" style="color:#888;font-size:13px;">
                    This code expires in <strong>2 minutes</strong>.
                  </td>
                </tr>
      
                <tr>
                  <td style="padding:20px 0;">
                    <hr style="border:none;border-top:1px solid #eee;" />
                  </td>
                </tr>
      
                <tr>
                  <td align="center" style="color:#777;font-size:12px;line-height:1.5;">
                    Do not share this code with anyone. If you didn’t request this, you can ignore this email.
                  </td>
                </tr>
      
                <tr>
                  <td align="center" style="padding-top:20px;color:#aaa;font-size:12px;">
                    © ${new Date().getFullYear()} ShopNow
                  </td>
                </tr>
      
              </table>
      
            </td>
          </tr>
        </table>
      
      </body>
      </html>
      `;
  }else if(type === "forgot-password"){
    subject = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
        <tr>
          <td align="center">
    
            <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="margin:0;color:#111;">ShopNow</h2>
                </td>
              </tr>
    
              <!-- Title -->
              <tr>
                <td align="center">
                  <h3 style="margin:0;color:#333;">Reset your password</h3>
                </td>
              </tr>
    
              <!-- Message -->
              <tr>
                <td align="center" style="padding:10px 0;color:#555;font-size:14px;">
                  We received a request to reset your password. Use the code below to continue.
                </td>
              </tr>
    
              <!-- OTP -->
              <tr>
                <td align="center" style="padding:20px 0;">
                  <div style="
                    display:inline-block;
                    padding:15px 25px;
                    font-size:28px;
                    letter-spacing:6px;
                    font-weight:bold;
                    background:#f1f5f9;
                    border-radius:8px;
                    color:#111;
                  ">
                    ${otp}
                  </div>
                </td>
              </tr>
    
              <!-- Expiry -->
              <tr>
                <td align="center" style="color:#888;font-size:13px;">
                  This code expires in <strong>2 minutes</strong>.
                </td>
              </tr>
    
              <!-- Divider -->
              <tr>
                <td style="padding:20px 0;">
                  <hr style="border:none;border-top:1px solid #eee;" />
                </td>
              </tr>
    
              <!-- Security note -->
              <tr>
                <td align="center" style="color:#777;font-size:12px;line-height:1.5;">
                  If you didn’t request a password reset, you can safely ignore this email. Your account will remain secure.
                </td>
              </tr>
    
              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top:20px;color:#aaa;font-size:12px;">
                  © ${new Date().getFullYear()} ShopNow
                </td>
              </tr>
    
            </table>
    
          </td>
        </tr>
      </table>
    
    </body>
    </html>
    `;
  }else if(type === "signup"){
    subject =`
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
        <tr>
          <td align="center">
    
            <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="margin:0;color:#111;">ShopNow</h2>
                </td>
              </tr>
    
              <!-- Title -->
              <tr>
                <td align="center">
                  <h3 style="margin:0;color:#333;">Welcome to ShopNow 🎉</h3>
                </td>
              </tr>
    
              <!-- Message -->
              <tr>
                <td align="center" style="padding:10px 0;color:#555;font-size:14px;">
                  Hi ${name || "there"}, your account has been successfully created.
                </td>
              </tr>
    
              <!-- Highlight box -->
              <tr>
                <td align="center" style="padding:15px 0;">
                  <div style="
                    background:#f1f5f9;
                    padding:15px;
                    border-radius:8px;
                    font-size:14px;
                    color:#333;
                  ">
                    You can now explore products, manage your orders, and enjoy a seamless shopping experience.
                  </div>
                </td>
              </tr>
    
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding:20px 0;">
                  <a href="http://localhost:5173"
                     style="
                      display:inline-block;
                      padding:12px 22px;
                      background:linear-gradient(90deg,#6366f1,#8b5cf6);
                      color:#fff;
                      text-decoration:none;
                      border-radius:8px;
                      font-weight:600;
                     ">
                    Start Shopping
                  </a>
                </td>
              </tr>
    
              <!-- Divider -->
              <tr>
                <td style="padding:20px 0;">
                  <hr style="border:none;border-top:1px solid #eee;" />
                </td>
              </tr>
    
              <!-- Security -->
              <tr>
                <td align="center" style="color:#777;font-size:12px;line-height:1.5;">
                  If you did not create this account, please contact our support immediately.
                </td>
              </tr>
    
              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top:20px;color:#aaa;font-size:12px;">
                  © ${new Date().getFullYear()} ShopNow. All rights reserved.
                </td>
              </tr>
    
            </table>
    
          </td>
        </tr>
      </table>
    
    </body>
    </html>
    `
  }
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials missing");
    }

    const transporter = await getTransporter();

    await transporter.sendMail({
      from: `"ShopNow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: subject
    });
  } catch (err) {
    console.error("Email send error:", err);
    throw new Error("Failed to send OTP email");
  }
};