package com.ecommerce.service;

import com.ecommerce.entity.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendOrderConfirmation(Order order) {
        if (fromEmail.isEmpty()) {
            log.info("Mail not configured — skipping order confirmation email for {}", order.getOrderNumber());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Confirmed — " + order.getOrderNumber());

            String html = "<h2>Thank you for your order!</h2>"
                    + "<p>Order Number: <strong>" + order.getOrderNumber() + "</strong></p>"
                    + "<p>Total: $" + order.getTotalAmount() + "</p>"
                    + "<p>Shipping to: " + order.getShippingAddress() + "</p>"
                    + "<p>Status: " + order.getStatus() + "</p>"
                    + "<br/><p>ShopHub Team</p>";

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Order confirmation email sent to {}", order.getUser().getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email", e);
        }
    }
}
