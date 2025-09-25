## Payment flow (Steam account purchase)

This document explains what happens when a user pays for a Steam account, for both Balance and QR flows, and when `steam_accounts.status` changes to `SOLD`.

### Key points
- **Status to SOLD**: The backend sets the linked `steam_accounts` record to `SOLD` inside order `markAsPaid()`. This happens immediately for Balance payments, and upon webhook confirmation for QR payments.
- **onPaymentSuccess (frontend)**: After successful payment, the UI navigates to the Profile page with a success message. No further status change is needed on the frontend; the backend has already updated the account status and order data.

---

### Balance payment flow
1) User chooses Balance and confirms in `PaymentConfirmationDialog`.

```61:98:frontend/src/components/PaymentConfirmationDialog.jsx
  const handleProceed = async () => {
    // ...
    if (selectedOption === 'balance') {
      setProcessing(true);
      try {
        // Call API to create and pay order using user balance
        const order = await createAndPaySteamAccountOrderWithBalance(account.id);

        // Close dialog and notify parent
        onClose();
        onPaymentSuccess(order);
      } catch (error) {
        // ...
      } finally {
        setProcessing(false);
      }
    } else {
      onClose();
      onProceedWithQR();
    }
  };
```

2) The API endpoint called by the frontend:

```395:399:frontend/src/lib/api.js
export const createAndPaySteamAccountOrderWithBalance = async (accountId) => {
  return apiRequest('/steam-account-orders/pay-with-balance', {
    method: 'POST',
    // ...
  });
};
```

3) Backend service creates the order, deducts user balance, marks the order as paid, and sets the Steam account to SOLD:

```208:254:backend/src/main/java/com/shopaccgame/service/SteamAccountOrderService.java
public OrderResponseDto createAndPayWithBalance(OrderRequestDto requestDto, String username) {
    // ... find user and steamAccount, validations ...

    // Deduct user balance
    if (!userBalanceService.deductFromBalance(username, steamAccount.getAccountInfo().getPrice())) {
        throw new RuntimeException("Insufficient balance");
    }

    // Create the order
    SteamAccountOrder order = new SteamAccountOrder(steamAccount, user, steamAccount.getAccountInfo().getPrice());

    // Mark as paid immediately
    order.markAsPaid();

    // Save and return
    SteamAccountOrder savedOrder = orderRepository.save(order);
    return toOrderResponseDto(savedOrder);
}
```

4) The `markAsPaid()` method updates the linked Steam account status to SOLD and stores credentials on the order:

```81:93:backend/src/main/java/com/shopaccgame/entity/SteamAccountOrder.java
public void markAsPaid() {
    this.status = OrderStatus.PAID;
    this.paidAt = LocalDateTime.now();

    if (this.steamAccount != null) {
        this.accountUsername = this.steamAccount.getUsername();
        this.accountPassword = this.steamAccount.getPassword();
        // Mark the steam account as sold
        this.steamAccount.setStatus(AccountStockStatus.SOLD);
    }
}
```

5) The parent pages receive `onPaymentSuccess(order)` and navigate to Profile with success params:

```101:105:frontend/src/pages/Cart.jsx
const handlePaymentSuccess = (order) => {
  setShowPaymentDialog(false);
  navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
};
```

```346:351:frontend/src/pages/SteamAccounts.jsx
const handlePaymentSuccess = (order) => {
  setShowPaymentDialog(false);
  setSelectedAccount(null);
  navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
};
```

```169:173:frontend/src/pages/SteamAccountDetail.jsx
const handlePaymentSuccess = (order) => {
  setShowPaymentDialog(false);
  navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
};
```

6) Profile page reads the query params and shows a success toast to the user:

```179:194:frontend/src/pages/Profile.jsx
useEffect(() => {
  const paymentSuccess = searchParams.get('payment');
  const orderId = searchParams.get('orderId');

  if (paymentSuccess === 'success' && orderId && isAuthenticated) {
    toast({
      title: "Thanh toán thành công!",
      description: `Đơn hàng ${orderId} đã được thanh toán. Thông tin tài khoản đã có sẵn bên dưới.`,
      variant: "default",
    });

    setSearchParams({});
  }
}, [searchParams, setSearchParams, toast, isAuthenticated]);
```

Result: The account is already SOLD in the backend when `onPaymentSuccess` fires. The frontend simply redirects to Profile and informs the user.

---

### QR payment flow
1) User chooses QR in `PaymentConfirmationDialog`, which closes the confirmation and opens `PaymentDialog`:

```108:113:frontend/src/components/PaymentConfirmationDialog.jsx
} else {
  // Handle QR payment
  onClose();
  onProceedWithQR();
}
```

2) Payment is made externally (e.g., sepay). The payment gateway calls our webhook with the reference (orderId).

3) Webhook controller recognizes order references that start with `ORD` and marks the corresponding order as paid in the service layer:

```35:47:backend/src/main/java/com/shopaccgame/controller/SepayWebhookController.java
@PostMapping
public ResponseEntity<Map<String, Object>> handlePaymentWebhook(@RequestBody SepayWebhookDto webhookData) {
  // ... validate webhookData ...
```

```95:103:backend/src/main/java/com/shopaccgame/controller/SepayWebhookController.java
if (ref.startsWith("ORD")) {
  orderService.markOrderAsPaid(ref);
  ordersPaid.add(ref);
} else if (ref.startsWith("DEP") || ref.startsWith("DNT")) {
  walletDepositService.markDepositPaid(ref);
  depositsPaid.add(ref);
} else {
  unknownReferences.add(ref);
}
```

4) In `markOrderAsPaid(...)`, the service should load the order by `orderId`, call `order.markAsPaid()`, and save. As in the Balance flow, this sets `steam_accounts.status = SOLD`.

5) The frontend listens for success (either via the payment dialog polling/callback or manual refresh) and navigates to Profile, similar to Balance, showing the success toast and revealing account credentials associated with the paid order.

---

### State transitions
- `steam_accounts.status`: `IN_STOCK` → `SOLD` when `order.markAsPaid()` runs.
- `steam_account_orders.status`: `PENDING` → `PAID` (and later possibly `DELIVERED`).

### After onPaymentSuccess
- No extra write is needed. The account is already SOLD by the backend.
- The UI navigates to `Profile` to show the success message and the purchased account credentials for the order.


