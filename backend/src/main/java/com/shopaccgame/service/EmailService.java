package com.shopaccgame.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
        public void sendVerificationEmail(String to, String verificationCode) {
        try {
            // Try MimeMessage first for better encoding support
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Xác thực email - Shop Account Game");
            helper.setText("Mã xác thực của bạn là: " + verificationCode + "\n\n" +
                          "Mã này có hiệu lực trong 10 phút.\n" +
                          "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.", false);
            
            mailSender.send(message);
        } catch (Exception e) {
            // Fallback to SimpleMailMessage if MimeMessage fails
            try {
                SimpleMailMessage simpleMessage = new SimpleMailMessage();
                simpleMessage.setTo(to);
                simpleMessage.setSubject("Xac thuc email - Shop Account Game");
                simpleMessage.setText("Ma xac thuc cua ban la: " + verificationCode + "\n\n" +
                                    "Ma nay co hieu luc trong 10 phut.\n" +
                                    "Neu ban khong yeu cau ma nay, vui long bo qua email nay.");
                
                mailSender.send(simpleMessage);
            } catch (Exception fallbackException) {
                throw new RuntimeException("Failed to send email with both methods", fallbackException);
            }
        }
    }
}
