package com.shopaccgame.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class SepayWebhookDto {
    
    @JsonProperty("id")
    private Long id;                              // ID giao dịch trên SePay
    
    @JsonProperty("gateway")
    private String gateway;                       // Brand name của ngân hàng
    
    @JsonProperty("transactionDate")
    private String transactionDate;               // Thời gian xảy ra giao dịch phía ngân hàng
    
    @JsonProperty("accountNumber")
    private String accountNumber;                 // Số tài khoản ngân hàng
    
    @JsonProperty("code")
    private String code;                          // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình)
    
    @JsonProperty("content")
    private String content;                       // Nội dung chuyển khoản
    
    @JsonProperty("transferType")
    private String transferType;                  // Loại giao dịch. in là tiền vào, out là tiền ra
    
    @JsonProperty("transferAmount")
    private BigDecimal transferAmount;            // Số tiền giao dịch
    
    @JsonProperty("accumulated")
    private BigDecimal accumulated;               // Số dư tài khoản (lũy kế)
    
    @JsonProperty("subAccount")
    private String subAccount;                    // Tài khoản ngân hàng phụ (tài khoản định danh)
    
    @JsonProperty("referenceCode")
    private String referenceCode;                 // Mã tham chiếu của tin nhắn sms
    
    @JsonProperty("description")
    private String description;                   // Toàn bộ nội dung tin nhắn sms
    
    // Constructors
    public SepayWebhookDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getGateway() {
        return gateway;
    }
    
    public void setGateway(String gateway) {
        this.gateway = gateway;
    }
    
    public String getTransactionDate() {
        return transactionDate;
    }
    
    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }
    
    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getTransferType() {
        return transferType;
    }
    
    public void setTransferType(String transferType) {
        this.transferType = transferType;
    }
    
    public BigDecimal getTransferAmount() {
        return transferAmount;
    }
    
    public void setTransferAmount(BigDecimal transferAmount) {
        this.transferAmount = transferAmount;
    }
    
    public BigDecimal getAccumulated() {
        return accumulated;
    }
    
    public void setAccumulated(BigDecimal accumulated) {
        this.accumulated = accumulated;
    }
    
    public String getSubAccount() {
        return subAccount;
    }
    
    public void setSubAccount(String subAccount) {
        this.subAccount = subAccount;
    }
    
    public String getReferenceCode() {
        return referenceCode;
    }
    
    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    @Override
    public String toString() {
        return "SepayWebhookDto{" +
                "id=" + id +
                ", gateway='" + gateway + '\'' +
                ", transactionDate='" + transactionDate + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", code='" + code + '\'' +
                ", content='" + content + '\'' +
                ", transferType='" + transferType + '\'' +
                ", transferAmount=" + transferAmount +
                ", accumulated=" + accumulated +
                ", subAccount='" + subAccount + '\'' +
                ", referenceCode='" + referenceCode + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
