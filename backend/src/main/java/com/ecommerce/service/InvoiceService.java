package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.exception.NotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final OrderRepository orderRepository;

    public byte[] generateInvoice(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("INVOICE").setBold().setFontSize(20));
            document.add(new Paragraph("Order #" + order.getOrderNumber()));
            document.add(new Paragraph("Date: " + order.getCreatedAt().toLocalDate().toString()));
            document.add(new Paragraph("Customer: " + order.getUser().getName()));
            document.add(new Paragraph("Email: " + order.getUser().getEmail()));
            document.add(new Paragraph("Shipping: " + order.getShippingAddress()));
            document.add(new Paragraph(" "));

            Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1}));
            table.addHeaderCell("Product");
            table.addHeaderCell("Qty");
            table.addHeaderCell("Price");
            table.addHeaderCell("Total");

            for (OrderItem item : order.getOrderItems()) {
                table.addCell(item.getProduct().getName());
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell("$" + item.getPrice());
                table.addCell("$" + item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            document.add(table);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total: $" + order.getTotalAmount()).setBold());

            if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                document.add(new Paragraph("Discount: -$" + order.getDiscountAmount()));
                if (order.getCouponCode() != null) {
                    document.add(new Paragraph("Coupon: " + order.getCouponCode()));
                }
            }

            document.add(new Paragraph("Status: " + order.getStatus()));
            document.add(new Paragraph("Payment: " + order.getPaymentMethod()));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice", e);
        }

        return out.toByteArray();
    }
}
