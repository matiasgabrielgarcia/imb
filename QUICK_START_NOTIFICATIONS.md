# Quick Start: Notification System

## Getting Started in 3 Steps

### Step 1: Start the wapp Server (WhatsApp Backend)

```bash
cd wapp
npm start
```

You should see:
```
================================================
WhatsApp Business Webhook Server
================================================
Server running on port 3005
Webhook URL: http://localhost:3005/webhook
Test endpoint: http://localhost:3005/webhook/test
Messages directory: C:\projects\imb\wapp\messages
Verify token: my_secure_verify_token_123
================================================
```

### Step 2: Start the Front-End Application

```bash
cd front
npm start
```

The application will open at `http://localhost:3000`

### Step 3: View Notifications

1. **Log in** to the application
2. Click **"Notificaciones"** in the left sidebar
3. View your categorized messages!

## Testing the System

### Send a Test Message

Open a new terminal and run:

```bash
curl -X POST http://localhost:3005/webhook/test -H "Content-Type: application/json" -d "{\"messageFrom\": \"+1234567890\", \"message\": \"Hola, quiero comprar una casa en el centro\"}"
```

Or use Postman:
- **URL:** `http://localhost:3005/webhook/test`
- **Method:** POST
- **Body (JSON):**
```json
{
  "messageFrom": "+54911123456",
  "message": "Hola, quiero comprar una casa en el centro"
}
```

### Verify It's Working

1. Go to `http://localhost:3000/notificaciones`
2. You should see your message under the **"Comprador"** (Buyer) category
3. It will have a **green background** (recent message)

## Understanding the Notifications

### Categories & Icons

| Category | Spanish | Icon | What It Means |
|----------|---------|------|---------------|
| BUYER | Comprador | 🛒 | Client wants to buy |
| SELLER | Vendedor | 💰 | Client wants to sell |
| TENANT | Inquilino | 🏠 | Client wants to rent |
| LANDLORD | Propietario | 🏢 | Owner wants to rent out |
| UNCATEGORIZED | Sin categoría | ❓ | Unknown intent |

### Color Coding

- **🟢 Green background** = Recent message (less than 1 month)
- **🔴 Red background** = Old message (more than 1 month) - Needs attention!

### Summary Dashboard

At the top of the notifications page, you'll see a summary like:

```
Comprador: 2    Vendedor: 2    Inquilino: 2    Propietario: 1    Sin categoría: 1
```

This tells you at a glance how many clients of each type need attention.

## Example Test Messages

Try sending these different types:

### Buyer (Comprador)
```json
{
  "messageFrom": "+54911111111",
  "message": "Hola, estoy buscando una propiedad para comprar"
}
```

### Seller (Vendedor)
```json
{
  "messageFrom": "+54922222222",
  "message": "Quiero vender mi casa en Palermo"
}
```

### Tenant (Inquilino)
```json
{
  "messageFrom": "+54933333333",
  "message": "Necesito alquilar un departamento de 2 ambientes"
}
```

### Landlord (Propietario)
```json
{
  "messageFrom": "+54944444444",
  "message": "Tengo un local comercial para alquilar"
}
```

## Workflow Example

### Typical Real Estate Agent Workflow:

1. **Morning Routine:**
   - Open the Notifications page
   - Check the summary: "3 Buyers, 2 Sellers, 1 Landlord"
   - Note which messages have red backgrounds (old, need priority)

2. **Prioritize Calls:**
   - Start with **red background** messages (old clients)
   - These have been waiting over a month for follow-up

3. **Action:**
   - Call the client based on their phone number
   - Discuss their needs (buying, selling, renting)
   - Match them with available properties

4. **Throughout the Day:**
   - Check back periodically for new messages
   - Recent messages appear with green backgrounds

## Customizing Keywords

If you want to add your own keywords for categorization, edit `wapp/server.js`:

```javascript
// Find the categorizeMessage function
function categorizeMessage(messageText) {
  // ...
  const buyerKeywords = [
    'comprar', 
    'compro', 
    'busco casa',
    'YOUR_NEW_KEYWORD_HERE'  // Add here!
  ];
  // ...
}
```

Then restart the wapp server.

## Troubleshooting

### "No se pudieron cargar las notificaciones"

**Problem:** Front-end can't connect to wapp server

**Solution:**
1. Make sure wapp server is running on port 3005
2. Check: `curl http://localhost:3005/`
3. Should return: `{"status":"running",...}`

### No messages showing

**Problem:** No test data

**Solution:** The system comes with sample messages in `wapp/messages/`. If they're missing, send a test message using curl or Postman.

### Messages not categorizing correctly

**Problem:** Keywords not matching

**Solution:** 
1. Check your message contains Spanish or English keywords
2. Review keywords list in `wapp/README.md`
3. Messages must include clear intent (e.g., "quiero comprar", "quiero vender")

## Next Steps

1. ✅ Test the system with different message types
2. ✅ Customize keywords for your region/language
3. ✅ Integrate with actual WhatsApp Business API (see wapp/README.md)
4. ✅ Start using it to manage real client inquiries!

## Need More Help?

- Full documentation: See `NOTIFICATIONS_SYSTEM.md`
- WhatsApp setup: See `wapp/README.md`
- Frontend details: See `front/README.md`

