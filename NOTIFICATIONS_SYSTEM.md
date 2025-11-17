# Notification System Documentation

## Overview

The notification system connects the **wapp** (WhatsApp) service with the **front** (frontend) application to automatically categorize and display incoming client messages based on their intent.

## Features

### 1. **Automatic Message Categorization**
Messages are automatically categorized into 5 types:
- **BUYER** 🛒 - Clients interested in buying properties
- **SELLER** 💰 - Clients wanting to sell their properties
- **TENANT** 🏠 - Clients looking to rent a property
- **LANDLORD** 🏢 - Property owners wanting to rent out their properties
- **UNCATEGORIZED** ❓ - Messages that don't match any category

### 2. **Color-Coded Time Indicators**
- **Red background** 🔴 - Messages older than 1 month (need attention!)
- **Green background** 🟢 - Recent messages (less than 1 month old)

### 3. **Summary Dashboard**
Displays a quick overview showing the count of notifications by category.

## Architecture

```
┌─────────────────┐
│   WhatsApp API  │
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────┐
│   wapp Server   │◄─── Categorizes messages
│   (Port 3005)   │      Stores in filesystem
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  front React    │◄─── Displays notifications
│   Application   │      Color-coded by date
└─────────────────┘
```

## Setup and Usage

### 1. Start the wapp Server

```bash
cd wapp
npm install
npm start
```

The server will run on **http://localhost:3005**

### 2. Start the Front Application

```bash
cd front
npm install
npm start
```

The frontend will run on **http://localhost:3000**

### 3. Access Notifications

1. Log in to the application
2. Click on **"Notificaciones"** in the sidebar navigation
3. View categorized messages with color coding

## API Endpoints

### wapp Server Endpoints

#### Get All Notifications
```
GET http://localhost:3005/notifications
```

**Response:**
```json
{
  "total": 8,
  "summary": {
    "BUYER": 2,
    "SELLER": 2,
    "TENANT": 2,
    "LANDLORD": 1,
    "UNCATEGORIZED": 1
  },
  "notifications": [
    {
      "messageFrom": "+54911234567",
      "message": "Quiero comprar una casa",
      "datetime": "2025-11-09T10:30:00.000Z",
      "category": "BUYER",
      "isOld": false
    }
  ]
}
```

#### Test Message Reception
```
POST http://localhost:3005/webhook/test
Content-Type: application/json

{
  "messageFrom": "+1234567890",
  "message": "Estoy buscando una casa para comprar"
}
```

## Message Categorization Logic

### Buyer Keywords (Spanish & English)
- comprar, compro, busco casa, busco propiedad, quiero comprar
- buyer, looking to buy, want to buy

### Seller Keywords
- vender, vendo, quiero vender, poner en venta
- selling, sell, want to sell, for sale

### Tenant Keywords
- alquilar, alquilo, busco alquiler, quiero alquilar
- renting, rent, looking to rent, need to rent

### Landlord Keywords
- alquilar propiedad, alquilar mi casa, tengo para alquilar, poner en alquiler
- renting out, have property to rent

## Testing the System

### Using Postman or cURL

Send a test message:

```bash
curl -X POST http://localhost:3005/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "messageFrom": "+1234567890",
    "message": "Hola, estoy interesado en comprar una casa en Palermo"
  }'
```

### Viewing Results

1. Navigate to **http://localhost:3000/notificaciones**
2. You should see the new notification categorized as "BUYER"
3. The notification will have a green background (recent)

## File Structure

```
wapp/
├── server.js              # Main server with categorization logic
├── messages/              # Stored messages (JSON files)
│   ├── message_1731024000001.json
│   ├── message_1731024000002.json
│   └── ...
└── README.md

front/
├── src/
│   ├── views/
│   │   └── NotificationsView.tsx    # Main notifications view
│   ├── services/
│   │   └── api.ts                   # API client (includes notificationsAPI)
│   ├── components/
│   │   └── Layout.tsx               # Sidebar with notifications link
│   └── App.tsx                      # Routes configuration
```

## Customization

### Adding New Categories

1. **Update wapp/server.js:**
   - Add new keywords to `categorizeMessage()` function
   - Add new category to summary grouping

2. **Update front/src/services/api.ts:**
   - Add new category type to `NotificationDto` interface

3. **Update front/src/views/NotificationsView.tsx:**
   - Add icon for new category in `getCategoryIcon()`
   - Add label in `getCategoryLabel()`
   - Add color in `getCategoryColor()`

### Changing Time Threshold

To change the "1 month" threshold for old messages:

**wapp/server.js** (line ~170):
```javascript
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Change to -2 for 2 months
```

### Changing Colors

**front/src/views/NotificationsView.tsx:**

```typescript
const getCardBackgroundColor = (isOld: boolean) => {
  return isOld ? '#ffebee' : '#e8f5e9'; // Customize colors here
};
```

## Troubleshooting

### Notifications Not Loading

1. Check if wapp server is running:
   ```bash
   curl http://localhost:3005/
   ```

2. Check CORS settings in wapp/server.js

3. Check browser console for errors

### Messages Not Categorizing

1. Review keywords in `categorizeMessage()` function
2. Check that messages contain recognizable keywords
3. Test with the `/webhook/test` endpoint

### Old Messages Not Showing Correct Color

1. Verify the `datetime` field is in ISO format
2. Check the timezone settings
3. Verify the time threshold calculation

## Production Considerations

1. **Environment Variables:**
   - Set `WAPP_API_URL` in production
   - Use environment-specific configuration

2. **Security:**
   - Implement proper CORS policies
   - Add authentication for wapp API endpoints
   - Validate and sanitize message content

3. **Performance:**
   - Consider pagination for large message volumes
   - Implement caching mechanisms
   - Use database instead of filesystem for scalability

4. **Monitoring:**
   - Log categorization accuracy
   - Track API response times
   - Monitor message processing errors

## Future Enhancements

- [ ] Mark notifications as "read/unread"
- [ ] Filter notifications by category
- [ ] Search within notifications
- [ ] Export notifications to CSV
- [ ] AI-powered categorization using machine learning
- [ ] Direct response to clients from the frontend
- [ ] WhatsApp integration for sending messages
- [ ] Notification badges showing unread count
- [ ] Real-time updates using WebSockets

