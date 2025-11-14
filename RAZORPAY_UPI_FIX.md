# Razorpay UPI/QR Code Payment Fix

If you're getting "beneficiary upi id incorrect" error when scanning the QR code, follow these steps:

## Understanding the Error

The "beneficiary upi id incorrect" error occurs when:
1. Your Razorpay merchant account doesn't have a UPI ID configured
2. UPI payments are not enabled in your Razorpay account
3. Your account needs KYC verification for UPI payments
4. The merchant account is not properly set up for UPI collections

## Solution Steps

### Step 1: Complete KYC Verification

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **Account & Settings**
3. Complete your **KYC (Know Your Customer)** verification:
   - Business details
   - Bank account details
   - Business documents
   - Authorized signatory details
4. Wait for Razorpay to approve your KYC (usually 24-48 hours)

### Step 2: Enable UPI Payments

1. In Razorpay Dashboard, go to **Settings** → **Payment Methods**
2. Enable **UPI** payment method:
   - Toggle **UPI** to **ON**
   - Save the changes
3. If UPI is not available, it means:
   - Your KYC is not complete
   - Your account type doesn't support UPI
   - Contact Razorpay support for assistance

### Step 3: Configure UPI ID (If Required)

1. Go to **Settings** → **Account & Settings** → **Bank Accounts**
2. Ensure your bank account is verified
3. For UPI, Razorpay automatically generates a UPI ID based on your merchant account
4. If you need a custom UPI ID, contact Razorpay support

### Step 4: Check Account Status

1. Go to **Settings** → **Account & Settings**
2. Check your account status:
   - **Active**: Account is ready for payments
   - **Pending**: KYC or verification pending
   - **Suspended**: Contact support

### Step 5: Test Mode vs Live Mode

#### Test Mode
- Test mode may have limited UPI functionality
- Use test UPI apps or test mode in UPI apps
- Some UPI features may not work in test mode

#### Live Mode
- Requires complete KYC
- Full UPI functionality available
- Real payments will be processed

### Step 6: Alternative Payment Methods

If UPI is not working, you can:

1. **Use Card Payments**: Credit/Debit cards work without UPI setup
2. **Use Net Banking**: Direct bank transfers
3. **Use Wallets**: Paytm, PhonePe, etc.

The payment gateway will automatically show available payment methods based on your account configuration.

## Code Updates

The payment service has been updated to:
- Enable UPI payment method explicitly
- Configure payment method blocks
- Show all available payment methods

## Testing UPI Payments

### Test Mode Testing
1. Use Razorpay test credentials
2. Try scanning QR code with a test UPI app
3. Note: Some UPI features may not work in test mode

### Live Mode Testing
1. Complete KYC verification
2. Enable UPI in payment methods
3. Test with a small amount first
4. Use a real UPI app to scan the QR code

## Common Issues and Solutions

### Issue: "UPI not available in payment methods"
**Solution:**
- Complete KYC verification
- Enable UPI in Razorpay Dashboard → Settings → Payment Methods
- Wait for account activation (24-48 hours)

### Issue: "QR code not generating"
**Solution:**
- Check if UPI is enabled in your account
- Verify your Razorpay Key ID is correct
- Check browser console for errors

### Issue: "Payment fails after scanning QR"
**Solution:**
- Verify your bank account is linked and verified
- Check if your account has sufficient balance
- Ensure UPI is enabled for your merchant account

### Issue: "UPI ID not found"
**Solution:**
- This is a Razorpay account configuration issue
- Contact Razorpay support: support@razorpay.com
- Provide your merchant account details

## Contact Razorpay Support

If the issue persists:

1. **Email Support**: support@razorpay.com
2. **Dashboard Support**: Go to Dashboard → Help & Support
3. **Phone Support**: Check Razorpay website for phone numbers
4. **Live Chat**: Available in Razorpay Dashboard

When contacting support, provide:
- Your merchant account ID
- Error message screenshot
- Payment attempt details
- Account status (test/live)

## Temporary Workaround

While fixing UPI configuration:

1. **Use Card Payments**: Users can pay via credit/debit cards
2. **Use Net Banking**: Direct bank transfers
3. **Use Wallets**: Paytm, PhonePe, etc.
4. **Manual Payment**: For urgent cases, process payments manually

## Prevention

To avoid this issue in the future:

1. **Complete KYC early**: Don't wait until you need UPI
2. **Enable all payment methods**: Enable UPI, cards, net banking, wallets
3. **Test thoroughly**: Test all payment methods before going live
4. **Monitor account status**: Regularly check account health in dashboard

## Additional Resources

- Razorpay UPI Documentation: https://razorpay.com/docs/payments/payment-methods/upi/
- Razorpay KYC Guide: https://razorpay.com/docs/payments/dashboard/account-and-settings/kyc/
- Razorpay Support: https://razorpay.com/support/

## Next Steps

1. Complete KYC verification in Razorpay Dashboard
2. Enable UPI in Payment Methods settings
3. Wait for account activation (if pending)
4. Test UPI payment with a small amount
5. If still not working, contact Razorpay support

The code has been updated to properly configure UPI payments. Once your Razorpay account is properly set up, UPI payments should work correctly.

