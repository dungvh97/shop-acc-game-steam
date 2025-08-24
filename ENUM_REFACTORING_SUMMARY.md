# Enum Refactoring Summary

## Overview
This document summarizes the changes made to move ENCRYPTION_KEY to environment variables and create common enums for AccountType and AccountStatus.

## Changes Made

### 1. Created Common Enum Classes

#### `backend/src/main/java/com/shopaccgame/entity/enums/AccountType.java`
- New common enum for account types
- Values: MULTI_GAMES, ONE_GAME, DISCOUNTED, OTHER_ACCOUNT

#### `backend/src/main/java/com/shopaccgame/entity/enums/AccountStatus.java`
- New common enum for account statuses
- Values: AVAILABLE, ORDERED, SOLD, PRE_ORDER, MAINTENANCE

### 2. Updated Environment Configuration

#### `backend/src/main/resources/application.yml`
- Added encryption key configuration under `app.encryption.key`
- Default value: `${ENCRYPTION_KEY:ShopAccGame2024!}`

#### `env.production.template`
- Added ENCRYPTION_KEY environment variable template
- Instructions for secure encryption key generation

### 3. Updated Entity Classes

#### `backend/src/main/java/com/shopaccgame/entity/SteamAccount.java`
- Removed internal enum definitions
- Added import for common enums
- Changed ENCRYPTION_KEY from static final to @Value injected field
- Updated encryption methods to use injected encryptionKey

#### `backend/src/main/java/com/shopaccgame/entity/SteamAccountOrder.java`
- Added import for AccountStatus enum
- Changed ENCRYPTION_KEY from static final to @Value injected field
- Updated encryption methods to use injected encryptionKey
- Updated status references to use common enum

### 4. Updated DTOs

#### `backend/src/main/java/com/shopaccgame/dto/SteamAccountDto.java`
- Changed field types from `SteamAccount.AccountType` to `AccountType`
- Changed field types from `SteamAccount.AccountStatus` to `AccountStatus`
- Updated getter/setter method signatures

#### `backend/src/main/java/com/shopaccgame/dto/SteamAccountAdminDto.java`
- Same changes as SteamAccountDto

#### `backend/src/main/java/com/shopaccgame/dto/SteamAccountRequestDto.java`
- Changed field type from `SteamAccount.AccountType` to `AccountType`
- Updated getter/setter method signatures

#### `backend/src/main/java/com/shopaccgame/dto/GameWithPriceDto.java`
- Added import for AccountStatus enum
- Updated status references to use common enum

### 5. Updated Services

#### `backend/src/main/java/com/shopaccgame/service/SteamAccountService.java`
- Added imports for common enums
- Updated all method signatures to use common enum types
- Updated all enum references throughout the service

#### `backend/src/main/java/com/shopaccgame/service/SteamAccountOrderService.java`
- Added import for AccountStatus enum
- Updated status references to use common enum

### 6. Updated Repository

#### `backend/src/main/java/com/shopaccgame/repository/SteamAccountRepository.java`
- Added imports for common enums
- Updated all method signatures to use common enum types

### 7. Updated Controllers

#### `backend/src/main/java/com/shopaccgame/controller/SteamAccountController.java`
- Added imports for common enums
- Updated all method signatures to use common enum types
- Updated all enum references in stats and other methods

#### `backend/src/main/java/com/shopaccgame/controller/SteamAccountPublicController.java`
- Added imports for common enums
- Updated all method signatures to use common enum types
- Updated all enum references throughout the controller

## Benefits of This Refactoring

1. **Security**: ENCRYPTION_KEY is now configurable via environment variables
2. **Maintainability**: Single source of truth for enum values
3. **Consistency**: All parts of the application use the same enum definitions
4. **Flexibility**: Easy to modify enum values in one place
5. **Best Practices**: Follows Spring Boot configuration patterns

## Environment Variables Required

- `ENCRYPTION_KEY`: Secure encryption key for password encryption/decryption
- Default value: `ShopAccGame2024!` (should be changed in production)

## Migration Notes

- All existing code using `SteamAccount.AccountType` and `SteamAccount.AccountStatus` has been updated
- No database schema changes required
- Existing encrypted passwords will continue to work with the new configuration
- Frontend code may need updates if it references the old enum paths

## Testing Recommendations

1. Test password encryption/decryption with new environment variable
2. Verify all enum values are correctly displayed in UI
3. Test account creation, updates, and status changes
4. Verify search and filtering by account type and status still work
5. Test admin functionality with new enum references
