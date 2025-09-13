package com.shopaccgame.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.shopaccgame.entity.SteamAccount;
import com.shopaccgame.entity.enums.AccountStatus;
import com.shopaccgame.repository.SteamAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class SteamCheckerService {

    private static final Logger logger = LoggerFactory.getLogger(SteamCheckerService.class);
    private static final String CHECKER_URL = "http://localhost:4000/check";

    @Autowired
    private SteamAccountRepository steamAccountRepository;

    @Autowired
    private EncryptionService encryptionService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ValidationResult validateAccountAndUpdate(Long accountId) {
        logger.info("[Checker] Starting validation for accountId={}", accountId);
        Optional<SteamAccount> accountOpt = steamAccountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            logger.error("[Checker] Steam account not found with id={}", accountId);
            throw new RuntimeException("Steam account not found with ID: " + accountId);
        }
        SteamAccount account = accountOpt.get();
        logger.info("[Checker] Found account username={} status={}", account.getUsername(), account.getStatus());

        String decryptedPassword = encryptionService.decryptPassword(account.getPassword());
        logger.info("[Checker] Decrypted password for validation (length={})", decryptedPassword != null ? decryptedPassword.length() : -1);

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("username", account.getUsername());
            payload.put("password", decryptedPassword);
            // steamGuard code intentionally omitted; checker handles requirement

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(payload.toString(), headers);

            long start = System.currentTimeMillis();
            logger.info("[Checker] Calling steam-checker service {} with username={}", CHECKER_URL, account.getUsername());
            ResponseEntity<String> response = restTemplate.postForEntity(CHECKER_URL, entity, String.class);
            long duration = System.currentTimeMillis() - start;
            logger.info("[Checker] steam-checker responded status={} in {} ms body={}", response.getStatusCode(), duration, response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode node = objectMapper.readTree(response.getBody());
                boolean valid = node.path("valid").asBoolean(false);
                String error = node.path("error").asText("");
                logger.info("[Checker] Parsed response valid={} error={}", valid, error);

                if (valid) {
                    // Account is valid and can be used
                    account.setVerifyDate(LocalDateTime.now());
                    steamAccountRepository.save(account);
                    logger.info("[Checker] Result VALID for accountId={}", accountId);
                    return ValidationResult.VALID;
                }
                if (!valid && "SteamGuardRequired".equals(error)) {
                    account.setVerifyDate(LocalDateTime.now());
                    steamAccountRepository.save(account);
                    logger.info("[Checker] Result VALID_GUARDED for accountId={}", accountId);
                    return ValidationResult.VALID_GUARDED;
                }
                if (!valid && "InvalidPassword".equals(error)) {
                    account.setStatus(AccountStatus.MAINTENANCE);
                    account.setVerifyDate(LocalDateTime.now());
                    steamAccountRepository.save(account);
                    logger.info("[Checker] Result INVALID_PASSWORD for accountId={}, account moved to MAINTENANCE", accountId);
                    return ValidationResult.INVALID_PASSWORD;
                }

                // Any other result: treat as unknown failure, do not change status but stamp verify date
                account.setVerifyDate(LocalDateTime.now());
                steamAccountRepository.save(account);
                logger.warn("[Checker] Result UNKNOWN for accountId={}, response body did not match expected patterns", accountId);
                return ValidationResult.UNKNOWN;
            }

            logger.error("[Checker] Non-2xx response or empty body from steam-checker for accountId={}", accountId);
            return ValidationResult.ERROR;
        } catch (Exception ex) {
            logger.error("[Checker] Error validating accountId={} message={}", accountId, ex.getMessage(), ex);
            return ValidationResult.ERROR;
        }
    }

    public enum ValidationResult {
        VALID,
        VALID_GUARDED,
        INVALID_PASSWORD,
        UNKNOWN,
        ERROR
    }

    // Removed string-builder helper in favor of Jackson's ObjectNode
}


